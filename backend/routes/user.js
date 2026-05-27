/**
 * routes/user.js — /api/users/*
 */

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authenticate = require("../middleware/auth");
const { getProfile, updateProfile, changePassword } = require("../controllers/userController");

router.use(authenticate);

const profileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters."),
  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Please enter a valid email.")
    .normalizeEmail(),
];

const passwordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Must contain an uppercase letter.")
    .matches(/[0-9]/).withMessage("Must contain a number."),
];

router.get("/profile",         getProfile);
router.put("/profile",         profileValidation,  updateProfile);
router.put("/change-password", passwordValidation, changePassword);

module.exports = router;
