import jwt from 'jsonwebtoken';
import db from '../db.js';

/**
 * Middleware to require authentication via JWT stored in cookie.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. No session token found.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_change_me_in_production_123456');
    
    // Fetch user from DB
    const user = db.prepare('SELECT id, name, email, role, is_verified, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_status, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid session. User not found.'
      });
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication verification failed:', error.message);
    return res.status(401).json({
      status: 'error',
      message: 'Session expired or invalid. Please sign in again.'
    });
  }
}

/**
 * Middleware to restrict route access to administrators only.
 * Must be used AFTER requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Administrator privileges required.'
    });
  }

  next();
}
