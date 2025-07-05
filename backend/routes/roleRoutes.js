const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');


// assign role to a user
router.post('/users/:uid/roles/', roleController.assignRoleToUser)

// get a list of roles assigned to user 
router.get('/users/:uid/roles', roleController.getUserRoles)

// get list of all available roles
router.get('/roles', roleController.getAllRoles)

// delete a role assigned to a user
router.delete('/users/:uid/roles/:roleid', roleController.deleteUserRole)

//get all users with a certain role
router.get('/roles/:roleid', roleController.getUsersByRole)

module.exports = router;
