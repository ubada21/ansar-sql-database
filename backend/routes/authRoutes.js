const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')

router.post('/request-otp', authController.requestOtpReset)

router.post('/verify-otp', authController.verifyOtpAndResetPassword)

module.exports = router

