const db = require('../config/db')


exports.getAllTransactions = async () => {
  [rows] = await db.query('SELECT * FROM TRANSACTIONS')
  return rows
}

exports.getTransactionByTID = async (tid) => {
  const [rows] = await db.query(`SELECT * FROM TRANSACTIONS WHERE TRANSACTION_ID = ?`, [tid])
  return rows[0]
}

exports.createTransaction = async (transactionData) => {
  const {
    EMAIL,
    DONOR_ID,
    AMOUNT,
    ADDRESS,
    CITY,
    PROVINCE,
    POSTALCODE,
    METHOD,
    NOTES,
    RECEIPT_NUMBER
  } = transactionData
  const rows = db.query(`INSERT INTO TRANSACTIONS  (EMAIL, DONOR_ID, AMOUNT, ADDRESS, CITY, PROVINCE, POSTALCODE, METHOD, NOTES, RECEIPT_NUMBER) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [EMAIL, DONOR_ID ? DONOR_ID : null, AMOUNT, ADDRESS, CITY, PROVINCE, POSTALCODE, METHOD, NOTES, RECEIPT_NUMBER])
  return rows
}
