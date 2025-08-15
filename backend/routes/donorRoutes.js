const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

router.get('/users',authJwtToken, requirePermission('modify_user'), userController.getAllUsers)

router.get('/users/:uid', userController.getUserByUID)

router.post('/users',requirePermission('modify_user'), userController.createUser)

router.put('/users/:uid', requirePermission('modify_user'), userController.updateUser)

router.delete('/users/:uid', requirePermission('modify_user'), userController.deleteUserByUID)

router.post('/users/:uid/roles/', requirePermission('modify_role'), userController.assignRoleToUser)

router.get('/users/:uid/roles', authJwtToken, requirePermission('view_roles'), userController.getUserRoles)

router.delete('/users/:uid/roles/:roleid', requirePermission('modify_role'), userController.deleteUserRole)

router.post('/register', userController.registerUser)

router.post('/login', userController.loginUser)

router.post('/logout', userController.logoutUser)

module.exports = router;
