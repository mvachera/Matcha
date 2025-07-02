const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const authController = require('../controllers/authController');

// Login route
router.post('/signin', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.signIn);

// Register route
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstname').notEmpty().trim().escape().withMessage('First name is required'),
  body('lastname').notEmpty().trim().escape().withMessage('Last name is required'),
  body('username').notEmpty().trim().escape().withMessage('Username is required'),
  body('birth_date').isISO8601().toDate().withMessage('Valid birth date is required')
], authController.signUp);

// Email verification route
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Token is required')
], authController.verifyEmail);

// Forgot password route
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], authController.forgotPassword);

// Reset password route
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], authController.resetPassword);

// Resend verification email route
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], authController.resendVerification);

module.exports = router;