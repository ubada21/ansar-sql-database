const db = require('../config/db')

exports.createDonor = async (donorData) => {
  result = db.query(
    `INSERT INTO DONORS  (UID, EMAIL, FIRSTNAME, LASTNAME, AMOUNT_DONATED, LAST_DONATION) VALUES
    (?, ?, ?, ?, ?, ?)`,
    [donorData.UID ? donorData.UID : null, donorData.EMAIL, donorData.FIRSTNAME, donorData.LASTNAME, donorData.AMOUNT_DONATED, donorData.LAST_DONATION]
  );
  return {DONOR_ID: result.insertID}
}

exports.updateDonor = async (donorId, newAmount, date) => {
  await db.query(
    `UPDATE DONORS SET AMOUNT_DONATED = ?, LAST_DONATION = ? WHERE DONOR_ID = ?`,
    [newAmount, date,  donorId]
  );
}

exports.getDonorByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM DONORS  WHERE EMAIL = ?', [email])
  return rows[0]
}

exports.getAllDonors = async () => {
  const [rows] = await db.query('SELECT * FROM DONORS')
  return rows
}
