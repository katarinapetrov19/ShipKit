import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   PUT /api/users/profile or /api/users/me
 * @desc    Update current user's profile information (name and email)
 * @access  Private
 */
router.put(['/profile', '/me'], requireAuth, (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'Name and email are required fields.'
    });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email is already in use by another user
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, req.user.id);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'This email address is already in use by another account.'
      });
    }

    // Update user profile in the database
    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(cleanName, cleanEmail, req.user.id);

    // Fetch updated user to return in payload
    const updatedUser = db.prepare('SELECT id, name, email, role, is_verified, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_status, created_at FROM users WHERE id = ?').get(req.user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile (alias of /api/auth/me)
 * @access  Private
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: req.user
  });
});

/**
 * @route   PUT /api/users/password or /api/users/me/password
 * @desc    Update current user's password
 * @access  Private
 */
router.put(['/password', '/me/password'], requireAuth, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Both current password and new password are required.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'New password must be at least 6 characters long.'
    });
  }

  try {
    // Fetch full user record including password hash
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User session invalid.'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect.'
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
