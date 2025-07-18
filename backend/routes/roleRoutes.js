const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

// get list of all available roles
router.get('/roles', authJwtToken, requirePermission('view_roles'), roleController.getAllRoles)

//get all users with a certain role
router.get('/roles/:roleid',authJwtToken,  requirePermission('view_roles'), roleController.getUsersByRole)

module.exports = router;
