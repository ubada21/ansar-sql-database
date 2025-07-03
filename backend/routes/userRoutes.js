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
router.put('/users/:id', userController.updateUser)

// delete user
//router.delete('/users/:id', userController.deleteUser)

module.exports = router;
