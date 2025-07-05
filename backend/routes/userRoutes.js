const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')

// CRUD OPERATIONS

// get all
router.get('/users', userController.getAllUsers)

// get by UID
router.get('/users/:uid', userController.getUserByUID)

// post user
router.post('/users', userController.createUser)

// update user
router.put('/users/:uid', userController.updateUser)

// delete user
router.delete('/users/:uid', userController.deleteUserByUID)

// assign role to a user
router.post('/users/:uid/roles/', userController.assignRoleToUser)

// get a list of roles assigned to user 
router.get('/users/:uid/roles', userController.getUserRoles)

// delete a role assigned to a user
router.delete('/users/:uid/roles/:roleid', userController.deleteUserRole)
module.exports = router;
