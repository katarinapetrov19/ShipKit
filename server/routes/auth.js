import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all required fields (name, email, password).'
    });
  }

  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique ID and email verification token
    const userId = crypto.randomUUID();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const createdAt = Date.now();

    // Insert user into SQLite database
    db.prepare(`
      INSERT INTO users (id, name, email, password, verification_token, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name, email.toLowerCase(), hashedPassword, verificationToken, createdAt);

    // Check if SMTP is actually configured for real emails
    const smtpConfigured = process.env.SMTP_HOST && 
      !process.env.SMTP_HOST.includes('mailtrap.io') && 
      process.env.SMTP_USER !== 'your_smtp_username';

    if (smtpConfigured) {
      // Send real verification email
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;
      
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - ShipKit ⚡',
        text: `Welcome to ShipKit! Please verify your email by clicking the following link: ${verificationLink}`,
        html: `...`
      });

      return res.status(201).json({
        status: 'success',
        message: 'Registration successful! Please check your email to verify your account.'
      });
    } else {
      // Dev mode — auto-verify the user so no email is needed
      db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?').run(userId);
      
      // Auto-login: generate JWT and set cookie
      const jwtSecret = process.env.JWT_SECRET || 'super_secret_change_me_in_production_123456';
      const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign({ id: userId, email: email.toLowerCase() }, jwtSecret, { expiresIn: jwtExpiry });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const user = db.prepare('SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?').get(userId);

      return res.status(201).json({
        status: 'success',
        message: 'Registration successful! Welcome to ShipKit.',
        user,
        autoLoggedIn: true
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set cookie session
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide both email and password.'
    });
  }

  try {
    // Fetch user from DB
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_change_me_in_production_123456';
    const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiry });

    // Set cookie session (7 days expiry matching default JWT)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    });

    // Remove sensitive password hash from user response payload
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Log out active user and clear session cookie
 * @access  Public
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: req.user
  });
});

/**
 * @route   GET /api/auth/verify
 * @desc    Confirm email verification with token query param
 * @access  Public
 */
router.get('/verify', (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      status: 'error',
      message: 'Verification token is required.'
    });
  }

  try {
    // Find user with verification token
    const user = db.prepare('SELECT id FROM users WHERE verification_token = ?').get(token);
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired email verification token.'
      });
    }

    // Set user as verified and clear verification token
    db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Confirm email verification code token
 * @access  Public
 */
router.post('/verify-email', (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: 'error',
      message: 'Verification token is required.'
    });
  }

  try {
    // Find user with verification token
    const user = db.prepare('SELECT id FROM users WHERE verification_token = ?').get(token);
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired email verification token.'
      });
    }

    // Set user as verified and clear verification token
    db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password recovery email
 * @access  Public
 */
router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email address is required.'
    });
  }

  try {
    // Query user by email
    const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email.toLowerCase());
    
    // Always return 200 for security, preventing user enumeration
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If that email is registered in our system, a password recovery link has been sent.'
      });
    }

    // Generate password recovery token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Store token in DB
    db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
      .run(resetToken, resetTokenExpiry, user.id);

    // Send recovery email (SMTP or simulation log)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - ShipKit ⚡',
      text: `You requested a password reset. Please reset your password by clicking the following link: ${resetLink}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #8b5cf6;">Password Reset Request ⚡</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password for your ShipKit account. Click the button below to set a new password. This link is valid for 1 hour.</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
          <p style="font-size: 12px; color: #64748b;">Or copy/paste this link into your browser: <br>${resetLink}</p>
        </div>
      `
    });

    return res.status(200).json({
      status: 'success',
      message: 'If that email is registered in our system, a password recovery link has been sent.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Accept password reset token and update password
 * @access  Public
 */
router.post('/reset-password', async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Verification token and new password are both required.'
    });
  }

  try {
    // Find user with reset token and check expiration date
    const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?').get(token, Date.now());
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired password reset token.'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset tokens in DB
    db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
      .run(hashedPassword, user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
