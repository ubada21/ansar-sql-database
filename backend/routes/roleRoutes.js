const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');



// get list of all available roles
router.get('/roles', roleController.getAllRoles)

//get all users with a certain role
router.get('/roles/:roleid', roleController.getUsersByRole)

module.exports = router;
