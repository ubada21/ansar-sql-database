const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

// get all
router.get('/users', userController.getAllUsers)

// get by UID
router.get('/users/:uid', userController.getUserByUID)

// post user
router.post('/users', authJwtToken, requirePermission('modify_user'), userController.createUser)

// update user
router.put('/users/:uid',authJwtToken, requirePermission('modify_user'), userController.updateUser)

// delete user
router.delete('/users/:uid',authJwtToken, requirePermission('modify_user'), userController.deleteUserByUID)

// assign role to a user
router.post('/users/:uid/roles/',authJwtToken, requirePermission('modify_role'), userController.assignRoleToUser)

// get a list of roles assigned to user 
router.get('/users/:uid/roles', authJwtToken, requirePermission('view_roles'), userController.getUserRoles)

// delete a role assigned to a user
router.delete('/users/:uid/roles/:roleid', authJwtToken, requirePermission('modify_role'), userController.deleteUserRole)



// Auth routes
router.post('/register', userController.registerUser)

router.post('/login', userController.loginUser)

router.post('/logout', userController.logoutUser)

module.exports = router;
