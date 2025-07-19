const transactionModel = require('../models/transactionModel');
const userModel = require('../models/userModel');
const donorModel = require('../models/donorModel');
const { v4: uuidv4 } = require('uuid');

exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionModel.getAllTransactions()
    res.status(200).json({transactions: transactions})
  } catch(err) {
    console.log(err)
    next(err)
  }
}

exports.getTransactionByTID = async (req, res, next) => {
  const { tid } = req.params
  try {
    const result = await transactionModel.getTransactionByTID(tid)
    if (!result) {
      return res.status(404).json({message: `No transactions found with TransactionID ${tid}`})
    }
    res.status(200).json({transaction: result})
  } catch(err){
    console.log(err)
    next(err)
  }
} 

exports.createTransaction = async (req, res, next) => {
  let transactionData = req.body;
  console.log(transactionData)
  function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
  const now = new Date();
  transactionData.RECEIPT_NUMBER = `RCPT-${formatDate(now)}-${uuidv4().slice(0, 6)}`;
  try {
    const user = await userModel.getUserByEmail(transactionData.EMAIL);
    if (user) {
      const donorResult = await donorModel.getDonorByEmail(transactionData.EMAIL);
      if (donorResult) {
        transactionData.DONOR_ID = donorResult.DONOR_ID;
        await transactionModel.createTransaction(transactionData);
        // update donor stats
        const currentAmount = parseFloat(donorResult.AMOUNT_DONATED) || 0;
        const newAmount = parseFloat(transactionData.AMOUNT) || 0;
        const updatedAmount = currentAmount + newAmount;
        await donorModel.updateDonor(donorResult.DONOR_ID, updatedAmount, new Date())
        return res.status(201).json({ message: 'Transaction created for existing donor.' });
      } else {
        const donorData = {
          UID: user.UID,
          EMAIL: user.EMAIL,
          FIRSTNAME: user.FIRSTNAME,
          LASTNAME: user.LASTNAME,
          AMOUNT_DONATED: transactionData.AMOUNT,
          LAST_DONATION: new Date(),
        };
        console.log(donorData)
        const newDonor = await donorModel.createDonor(donorData);
        transactionData.DONOR_ID = newDonor.DONOR_ID
        await transactionModel.createTransaction(transactionData);
        return res.status(201).json({ message: 'Transaction and new donor (user) created successfully.' });
      }
    } else {
      const donorResult = await donorModel.getDonorByEmail(transactionData.EMAIL);
      if (donorResult) {
        transactionData.DONOR_ID = donorResult.DONOR_ID;
        await transactionModel.createTransaction(transactionData);
        // update donor stats
        const currentAmount = parseFloat(donorResult.AMOUNT_DONATED) || 0;
        const newAmount = parseFloat(transactionData.AMOUNT) || 0;
        const updatedAmount = currentAmount + newAmount;
        await donorModel.updateDonor(donorResult.DONOR_ID, updatedAmount, new Date())
        return res.status(201).json({ message: 'Transaction created for existing donor.' });
      } else {
      // no user found, create donor from transaction form input
      const donorData = {
        EMAIL: transactionData.EMAIL,
        FIRSTNAME: transactionData.FIRSTNAME,
        LASTNAME: transactionData.LASTNAME,
        AMOUNT_DONATED: transactionData.AMOUNT,
        LAST_DONATION: new Date(),
      };
      const newDonor = await donorModel.createDonor(donorData);
      transactionData.DONOR_ID = newDonor.DONOR_ID
      await transactionModel.createTransaction(transactionData);
      return res.status(201).json({ message: 'Transaction and new donor (non-user) created successfully.' });
    }
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// ONLY TO TEST, DONT THINK WE NEED A DONORS ROUTE
exports.getAllDonors = async (req, res, next) => {
  try {
    result = await donorModel.getAllDonors()
    console.log(result)
    res.status(200).json({donors: result})
  } catch(err) {
    console.log(err)
    next(err)
  }
}
