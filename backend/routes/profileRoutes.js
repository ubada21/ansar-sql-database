
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js')
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

router.get('/profile',authJwtToken, profileController.getProfile)

router.put('/profile', authJwtToken, profileController.updateProfile)

router.patch('/profile/password', authJwtToken, profileController.changePassword)

router.delete('/profile', authJwtToken, profileController.deleteProfile)

module.exports = router
