const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { requirePermission } = require('../middlewares/rbacMiddleware')

// get list of all available roles
router.get('/roles', requirePermission('view_roles'), roleController.getAllRoles)

//get all users with a certain role
router.get('/roles/:roleid', requirePermission('view_roles'), roleController.getUsersByRole)

module.exports = router;
