/**
 * controllers/userController.js — Profile view & update, password change
 */

const { validationResult } = require("express-validator");
const User = require("../models/User");

// ── GET /api/users/profile ────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email } = req.body;

    // Check if new email is already taken by a DIFFERENT user
    if (email) {
      const existing = await User.findByEmail(email);
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ success: false, message: "Email already in use by another account." });
      }
    }

    const updated = await User.update(req.user.id, {
      name:  name  || req.user.name,
      email: email || req.user.email,
    });

    res.json({ success: true, message: "Profile updated successfully.", user: updated });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/change-password ────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch full user row (includes password_hash)
    const user = await User.findByEmail(req.user.email);
    const valid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    await User.updatePassword(req.user.id, newPassword);
    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
