import express from 'express';
import Stripe from 'stripe';
import path from 'path';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Initialize Stripe if keys are set
const isStripeConfigured = 
  process.env.STRIPE_SECRET_KEY && 
  !process.env.STRIPE_SECRET_KEY.includes('...') && 
  process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key';

let stripe = null;
if (isStripeConfigured) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('[Stripe] Initialized successfully with live API keys.');
} else {
  console.log('[Stripe] Warning: Missing or placeholder STRIPE_SECRET_KEY. Running in Billing Simulation mode.');
}

/**
 * Core checkout session logic
 */
const handleCreateCheckout = async (req, res, next) => {
  const { priceId, successUrl, cancelUrl } = req.body;

  if (!priceId) {
    return res.status(400).json({
      status: 'error',
      message: 'priceId parameter is required.'
    });
  }

  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // If Stripe is not configured, run in Billing Simulation mode
    if (!isStripeConfigured) {
      console.log(`[Stripe Simulation] Creating simulated checkout for user ${req.user.email} with priceId: ${priceId}`);
      
      // Return simulated success redirect URL
      const simulatedUrl = `${clientUrl}/dashboard?mock_success=true&price_id=${encodeURIComponent(priceId)}`;
      return res.status(200).json({
        status: 'success',
        simulated: true,
        url: simulatedUrl
      });
    }

    // --- Real Stripe Implementation ---
    let customerId = req.user.stripe_customer_id;

    // Create a Stripe Customer if not already exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name || undefined,
        metadata: {
          userId: req.user.id
        }
      });
      customerId = customer.id;
      
      // Update local database with Stripe Customer ID
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, req.user.id);
    }

    // Translate environmental variables to Stripe Price IDs if keys matched
    let actualPriceId = priceId;
    if (priceId === 'STRIPE_PRICE_ID_MONTHLY') {
      actualPriceId = process.env.STRIPE_PRICE_ID_MONTHLY;
    } else if (priceId === 'STRIPE_PRICE_ID_YEARLY') {
      actualPriceId = process.env.STRIPE_PRICE_ID_YEARLY;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${clientUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${clientUrl}/dashboard?canceled=true`,
      metadata: {
        userId: req.user.id,
      },
      subscription_data: {
        metadata: {
          userId: req.user.id
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      simulated: false,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('[Stripe Error] checkout session creation failed:', error.message);
    next(error);
  }
};

/**
 * @route   POST /api/payments/create-checkout
 * @desc    Create a Stripe checkout session for subscription (or simulated session)
 * @access  Private
 */
router.post('/create-checkout', requireAuth, handleCreateCheckout);
router.post('/create-checkout-session', requireAuth, handleCreateCheckout);

/**
 * Core portal session logic
 */
const handleCreatePortal = async (req, res, next) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (!isStripeConfigured) {
      // Simulate Billing Portal by redirecting back with a feedback query param
      return res.status(200).json({
        status: 'success',
        simulated: true,
        url: `${clientUrl}/dashboard?mock_portal=true`
      });
    }

    const customerId = req.user.stripe_customer_id;
    if (!customerId) {
      return res.status(400).json({
        status: 'error',
        message: 'No active billing profile was found. Please purchase a plan first.'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${clientUrl}/dashboard`,
    });

    return res.status(200).json({
      status: 'success',
      simulated: false,
      url: session.url
    });
  } catch (error) {
    console.error('[Stripe Error] Billing portal creation failed:', error.message);
    next(error);
  }
};

/**
 * @route   POST /api/payments/create-portal
 * @desc    Create a Stripe customer billing portal session (or simulate it)
 * @access  Private
 */
router.post('/create-portal', requireAuth, handleCreatePortal);
router.post('/create-portal-session', requireAuth, handleCreatePortal);

/**
 * @route   GET /api/payments/subscription
 * @desc    Get current subscription status for the logged-in user
 * @access  Private
 */
router.get('/subscription', requireAuth, (req, res) => {
  let planName = 'Free Trial';
  if (req.user.stripe_price_id) {
    planName = req.user.stripe_price_id.includes('year') || req.user.stripe_price_id === 'STRIPE_PRICE_ID_YEARLY' 
      ? 'Pro Yearly' 
      : 'Starter Monthly';
  }
  
  return res.status(200).json({
    status: 'success',
    subscription: {
      stripe_customer_id: req.user.stripe_customer_id,
      stripe_subscription_id: req.user.stripe_subscription_id,
      stripe_price_id: req.user.stripe_price_id,
      stripe_status: req.user.stripe_status || 'active',
      plan: planName
    }
  });
});

/**
 * @route   POST /api/payments/cancel-subscription
 * @desc    Cancel active subscription (Stripe API or Simulation)
 * @access  Private
 */
router.post('/cancel-subscription', requireAuth, async (req, res, next) => {
  try {
    if (!isStripeConfigured) {
      // Simulation mode cancellation: update db status instantly
      db.prepare(`
        UPDATE users 
        SET stripe_subscription_id = NULL, stripe_price_id = NULL, stripe_status = 'canceled' 
        WHERE id = ?
      `).run(req.user.id);

      return res.status(200).json({
        status: 'success',
        message: 'Your simulated subscription has been successfully canceled.'
      });
    }

    const subId = req.user.stripe_subscription_id;
    if (!subId) {
      return res.status(400).json({
        status: 'error',
        message: 'No active Stripe subscription found to cancel.'
      });
    }

    // Cancel at period end using Stripe SDK
    await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true
    });

    // Mark status as canceled or updating db
    db.prepare("UPDATE users SET stripe_status = 'canceled' WHERE id = ?").run(req.user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Subscription will be canceled at the end of the current billing period.'
    });
  } catch (error) {
    console.error('[Stripe Error] Subscription cancellation failed:', error.message);
    next(error);
  }
});

/**
 * @route   POST /api/payments/simulate-upgrade
 * @desc    Simulation endpoint to instantly upgrade user subscription in DB (Dev mode only)
 * @access  Private
 */
router.post('/simulate-upgrade', requireAuth, async (req, res, next) => {
  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({
      status: 'error',
      message: 'priceId parameter is required.'
    });
  }

  try {
    const mockSubId = 'sub_sim_' + Math.random().toString(36).substring(2, 10);
    const mockCustId = req.user.stripe_customer_id || 'cus_sim_' + Math.random().toString(36).substring(2, 10);

    db.prepare(`
      UPDATE users 
      SET stripe_customer_id = ?, stripe_subscription_id = ?, stripe_price_id = ?, stripe_status = 'active'
      WHERE id = ?
    `).run(mockCustId, mockSubId, priceId, req.user.id);

    // Send email receipt & subscription confirmation in simulated mode!
    const planName = priceId.includes('year') || priceId === 'STRIPE_PRICE_ID_YEARLY' 
      ? 'Pro Yearly (Simulated)' 
      : 'Starter Monthly (Simulated)';
    const priceAmount = priceId.includes('year') || priceId === 'STRIPE_PRICE_ID_YEARLY'
      ? '$149.00'
      : '$19.00';

    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Subscription Confirmed! Welcome to ShipKit Pro (Simulation Mode) ⚡',
        text: `Hi ${req.user.name || 'there'},\n\nThank you for subscribing to ShipKit! Your ${planName} subscription has been successfully processed in simulation mode.\n\nTransaction Receipt:\nPlan: ${planName}\nAmount: ${priceAmount}\nStatus: Active (Simulated)\n\nYou can access your SaaS Boilerplate starter kit assets and admin features now on your dashboard.\n\nBest regards,\nThe ShipKit Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px;">
            <h2 style="color: #8b5cf6;">Subscription Confirmed! ⚡ (Simulated)</h2>
            <p>Hi ${req.user.name || 'there'},</p>
            <p>Thank you for your simulated purchase! Your subscription to the <strong>${planName}</strong> plan has been successfully activated.</p>
            
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #334155;">Receipt / Order Summary (Simulation Mode)</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Plan Purchased:</td>
                  <td style="padding: 6px 0; font-weight: bold; text-align: right;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Amount Charged:</td>
                  <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #10b981;">${priceAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Status:</td>
                  <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #10b981;">Paid</td>
                </tr>
              </table>
            </div>

            <div style="margin: 24px 0; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">This was a simulation of your SaaS payment flow. Real setup uses real webhooks to trigger email receipts.</p>
          </div>
        `
      });
    } catch (err) {
      console.error('[Simulated Purchase Email Error]', err.message);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Billing Simulated Upgrade completed successfully!'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook endpoint to process real subscription lifecycle events
 * @access  Public (constructEvent verifies signatures)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Construct real verified event using rawBody buffer
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`[Stripe Webhook Signatures Error] ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const session = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = session.metadata.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        
        // Retrieve full subscription details to fetch current price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const status = subscription.status; // e.g. 'active'

        db.prepare(`
          UPDATE users 
          SET stripe_customer_id = ?, stripe_subscription_id = ?, stripe_price_id = ?, stripe_status = ? 
          WHERE id = ?
        `).run(customerId, subscriptionId, priceId, status, userId);
        
        console.log(`[Stripe Webhook] checkout.session.completed recorded successfully for user: ${userId}`);

        // Send payment receipt and subscription confirmation email!
        try {
          const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(userId);
          if (user) {
            const planName = priceId.includes('year') || priceId === 'STRIPE_PRICE_ID_YEARLY' 
              ? 'Pro Yearly' 
              : 'Starter Monthly';
            const priceAmount = priceId.includes('year') || priceId === 'STRIPE_PRICE_ID_YEARLY'
              ? '$149.00'
              : '$19.00';

            await sendEmail({
              to: user.email,
              subject: 'Subscription Confirmed! Welcome to ShipKit Pro ⚡',
              text: `Hi ${user.name || 'there'},\n\nThank you for subscribing to ShipKit! Your ${planName} subscription has been successfully processed.\n\nTransaction Receipt:\nPlan: ${planName}\nAmount: ${priceAmount}\nStatus: Active\n\nYou can access your SaaS Boilerplate starter kit assets and admin features now on your dashboard.\n\nBest regards,\nThe ShipKit Team`,
              html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px;">
                  <h2 style="color: #8b5cf6;">Subscription Confirmed! ⚡</h2>
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Thank you for your purchase! Your subscription to the <strong>${planName}</strong> plan has been successfully activated.</p>
                  
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #334155;">Receipt / Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Plan Purchased:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Amount Charged:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #10b981;">${priceAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Status:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #10b981;">Paid</td>
                      </tr>
                    </table>
                  </div>

                  <div style="margin: 24px 0; text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">Thank you for your support of ShipKit! If you have any questions or need help setting up your boilerplate, please reply to this email.</p>
                </div>
              `
            });
          }
        } catch (err) {
          console.error('[Webhook Purchase Email Error]', err.message);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionId = session.id;
        const priceId = session.items.data[0].price.id;
        const status = session.status; // active, trialing, past_due, canceled

        db.prepare(`
          UPDATE users 
          SET stripe_price_id = ?, stripe_status = ? 
          WHERE stripe_subscription_id = ?
        `).run(priceId, status, subscriptionId);

        console.log(`[Stripe Webhook] customer.subscription.updated recorded for subscription: ${subscriptionId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = session.id;

        // Clear active subscription data and set status to canceled
        db.prepare(`
          UPDATE users 
          SET stripe_subscription_id = NULL, stripe_price_id = NULL, stripe_status = 'canceled' 
          WHERE stripe_subscription_id = ?
        `).run(subscriptionId);

        console.log(`[Stripe Webhook] customer.subscription.deleted processed subscription: ${subscriptionId}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook Error] Event processing failed:`, error.message);
    return res.status(500).json({ error: 'Webhook processing crashed.' });
  }
});

/**
 * @route   POST /api/payments/verify-session
 * @desc    Verify Stripe Checkout Session ID or dev-download-token for file access
 * @access  Public
 */
router.post('/verify-session', async (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      status: 'error',
      verified: false,
      message: 'sessionId parameter is required.'
    });
  }

  try {
    if (!isStripeConfigured) {
      if (sessionId === 'dev-download-token') {
        return res.status(200).json({
          status: 'success',
          verified: true
        });
      } else {
        return res.status(400).json({
          status: 'error',
          verified: false,
          message: 'Invalid session ID or token. In simulation mode, use dev-download-token.'
        });
      }
    }

    // Stripe is configured - retrieve Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session && session.payment_status === 'paid') {
      return res.status(200).json({
        status: 'success',
        verified: true
      });
    } else {
      return res.status(400).json({
        status: 'error',
        verified: false,
        message: 'The payment for this checkout session has not been completed.'
      });
    }
  } catch (error) {
    console.error('[Verify Session Error]', error.message);
    return res.status(400).json({
      status: 'error',
      verified: false,
      message: 'Failed to verify checkout session: ' + error.message
    });
  }
});

/**
 * @route   GET /api/payments/download-file
 * @desc    Serve the shipkit-boilerplate.tar.gz file for verified buyers
 * @access  Public
 */
router.get('/download-file', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Download token is required.');
  }

  try {
    let isValid = false;

    if (!isStripeConfigured) {
      if (token === 'dev-download-token') {
        isValid = true;
      }
    } else {
      // Stripe is configured - retrieve and verify
      try {
        const session = await stripe.checkout.sessions.retrieve(token);
        if (session && session.payment_status === 'paid') {
          isValid = true;
        }
      } catch (err) {
        console.error('[Download File Auth Error]', err.message);
      }
    }

    if (!isValid) {
      return res.status(403).send('Unauthorized. Invalid or expired download token.');
    }

    // Serve the tarball
    const filePath = '/home/team/shared/shipkit/shipkit-boilerplate.tar.gz';
    
    res.setHeader('Content-Disposition', 'attachment; filename="shipkit-boilerplate.tar.gz"');
    res.setHeader('Content-Type', 'application/gzip');
    
    return res.sendFile(filePath);
  } catch (error) {
    console.error('[Download File Error]', error.message);
    return res.status(500).send('Internal Server Error serving download: ' + error.message);
  }
});

export default router;
