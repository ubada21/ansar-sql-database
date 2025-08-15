const db = require('../config/db')
const { convertDecimalFields } = require('../utils/dbHelpers')

exports.getAllTransactions = async () => {
  const [rows] = await db.query(`
    SELECT t.*, d.FIRSTNAME, d.LASTNAME 
    FROM TRANSACTIONS t
    LEFT JOIN DONORS d ON t.DONOR_ID = d.DONOR_ID
    ORDER BY t.TRANSACTION_DATE DESC
  `)
  return rows.map(convertDecimalFields)
}

exports.getTransactionByTID = async (tid) => {
  const [rows] = await db.query(`
    SELECT t.*, d.FIRSTNAME, d.LASTNAME 
    FROM TRANSACTIONS t
    LEFT JOIN DONORS d ON t.DONOR_ID = d.DONOR_ID
    WHERE t.TRANSACTION_ID = ?
  `, [tid])
  return convertDecimalFields(rows[0])
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
