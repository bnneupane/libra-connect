const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ======================================
// 🔐 Authentication Routes
// ======================================

// ✅ Registration
router.get('/register', authController.showRegisterForm);
router.post('/register', authController.registerUser);

// ✅ Login / Logout
router.get('/login', authController.showLoginForm);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);

// ======================================
// 🔁 Password Recovery
// ======================================

// ✅ Forgot Password (Send OTP)
router.get('/forgot-password', authController.showForgotPasswordForm);
router.post('/forgot-password', authController.sendOTP);

// ✅ Reset Password (Verify OTP & Change)
router.get('/reset-password', authController.showResetPasswordForm);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
