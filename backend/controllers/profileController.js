const profileModel = require('../models/roleModel') 
const userModel = require('../models/userModel')


exports.getProfile = async (req, res) => {
  const uid = req.user.uid
  try {
    const rows = await userModel.getUserByUID(uid)

    if (rows.length === 0) {
      return next(new CustomError('User not found', 404));
    }

    res.json({user: rows[0]});

  } catch(err) {
    console.log(err)
    res.status(500).send('Server Error');
  }
}

exports.updateProfile = async (req, res) => {
  const { uid } = req.user.uid;
  const userData = req.body;

  try {
    const result = await userModel.updateUserById(uid, userData);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    res.status(200).json({ message: `User with UID ${uid} updated successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }

// TODO implement change password func (need to add passwordHash to users table)
exports.changePassword = async (req, res) => {
  try {

  } catch(err) {
    console.log(err)
    next(err)
  }
}

exports.deleteProfile = async (req, res) => {
  const { uid } = req.user.uid;

  try {
    result = await userModel.deleteUserByUID(uid)

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
     res.status(200).json({ message: `User with UID ${uid} deleted successfully.` });

  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
};
