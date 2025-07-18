const transactionModel = require('../models/transactionModel');
const userModel = require('../models/userModel');
const donorModel = require('../models/donorModel');
const { v4: uuidv4 } = require('uuid');

// all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.getAllTransactions()
    res.status(200).json({transactions: transactions})

  } catch(err) {
    console.log(err)
    res.status(500).json({message: 'Server Error'})
  }
}


exports.getTransactionByTID = async (req, res) => {
  const { tid } = req.params
  try {
    const checkRole = await roleService.checkRoleExists(roleid)
    if (!checkRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    result = await transactionModel.getTransactionsByTID(tid)

    if (result.affectedRows === 0) {
      return res.status(404).json({message: `No transactions found with TransactionID ${tid}`})
    }
    res.status(200).json({transacton: result})
  } catch(err){
    console.log(err)
    res.status(500).json({message: 'Server Error'})
  }
} 

exports.createTransaction = async (req, res) => {
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
        console.log('HERE')
        transactionData.DONOR_ID = donorResult.DONOR_ID;
        await transactionModel.createTransaction(transactionData);

        // update donor stats
        const updatedAmount = donorResult.AMOUNT_DONATED + transactionData.AMOUNT;
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
        const updatedAmount = donorResult.AMOUNT_DONATED + transactionData.AMOUNT;
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
    res.status(500).json({ message: 'Server Error' });
  }
};



// ONLY TO TEST, DONT THINK WE NEED A DONORS ROUTE
exports.getAllDonors = async (req, res) => {
  try {
    result = await donorModel.getAllDonors()
    console.log(result)
    res.status(200).json({donors: result})
  } catch(err) {
    console.log(err)
    res.status(500).json('Server Error')
  }
}
