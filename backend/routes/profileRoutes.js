
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js')
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

// get by UID
router.get('/profile',authJwtToken, profileController.getProfile)

// update profile
router.put('/profile', authJwtToken, profileController.updateProfile)

// change password
router.patch('/profile/password', authJwtToken, profileController.changePassword)

// delete user
router.delete('/profile', authJwtToken, profileController.deleteProfile)

module.exports = router
