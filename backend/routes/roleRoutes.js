const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

router.get('/roles', authJwtToken, requirePermission('view_roles'), roleController.getAllRoles)

router.get('/roles/:roleid',authJwtToken,  requirePermission('view_roles'), roleController.getUsersByRole)

router.get('/roles/name/:roleName',authJwtToken,  requirePermission('view_roles'), roleController.getUsersByRoleName)

module.exports = router;
