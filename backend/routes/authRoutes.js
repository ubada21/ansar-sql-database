const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')
const { authJwtToken } = require('../middlewares/authMiddleware')

console.log('✓ authRoutes.js loaded');

router.post('/request-otp', authController.requestOtpReset)

router.post('/verify-otp', authController.verifyOtpAndResetPassword)

router.get('/check-auth', authJwtToken, authController.checkAuthStatus)

router.get('/test-token', authController.getTestToken)

module.exports = router

