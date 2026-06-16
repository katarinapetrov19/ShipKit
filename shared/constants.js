// Shared Constants and Configurations for ShipKit

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    interval: 'never',
    features: [
      'Basic user authentication',
      'Limited access to admin dashboard',
      'Community support'
    ]
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Starter Monthly',
    price: 19,
    interval: 'month',
    priceIdEnvVar: 'STRIPE_PRICE_ID_MONTHLY',
    features: [
      'Full authentication suite',
      'Complete user management dashboard',
      'Stripe checkout integration',
      'Email notifications (welcome, receipts)',
      'Basic analytics dashboard',
      'Email support'
    ]
  },
  YEARLY: {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 149,
    interval: 'year',
    priceIdEnvVar: 'STRIPE_PRICE_ID_YEARLY',
    features: [
      'Everything in Starter Monthly',
      'Priority email & chat support',
      'Multiple projects deployment license',
      '2 months free (save 35%+)',
      'Lifetime access to template updates'
    ]
  }
};

export const APP_INFO = {
  name: 'ShipKit',
  description: 'The ultimate production-ready SaaS boilerplate. Launch your startup in hours.',
  url: 'https://shipkit.dev',
  supportEmail: 'support@shipkit.dev'
};

export const DOWNLOAD_URL = 'https://github.com/katarinapetrov19/ShipKit';
