/**
 * controllers/authController.js — Register & Login
 */

const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

/** Sign a JWT token for the given user */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ── POST /api/auth/register ────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const userId = await User.create({ name, email, password });
    const user = await User.findById(userId);
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const valid = await User.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me — Return current user from token ─────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
