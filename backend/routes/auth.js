/**
 * routes/auth.js — /api/auth/*
 */

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const authenticate = require("../middleware/auth");

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters."),
  body("email")
    .trim()
    .isEmail().withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login",    loginValidation,    login);
router.get("/me",        authenticate,       getMe);

module.exports = router;
