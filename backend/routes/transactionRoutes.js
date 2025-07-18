const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController')

router.post('/transactions', transactionController.createTransaction)

router.get('/transactions', transactionController.getAllTransactions)

router.get('/transactions/:tid', transactionController.getTransactionByTID)

router.get('/donors', transactionController.getAllDonors)

module.exports = router
