const crypto = require('crypto');
const { redisClient, connectRedis} = require('../config/redis');

const generateOtp = (length = 6) => {
  return crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
};

const storeOtp = async (contactType, contactValue, otp) => {
  await connectRedis(); // connect to redis instance
  const key = `otp:${contactType}:${contactValue}`; //contactType is phone or email
  await redisClient.set(key, otp, { EX: 300 }); // expires in 5 minutes
};

const verifyOtp = async (contactType, contactValue, submittedOtp) => {
  try {
  await connectRedis();
  const key = `otp:${contactType}:${contactValue}`;
  const storedOtp = await redisClient.get(key);
  if (String(storedOtp) === String(submittedOtp)) {
    await redisClient.del(key);
    return true;
  }
  return false;
  } catch (err) {
    console.log(err)
  }
};

module.exports = { generateOtp, storeOtp, verifyOtp };

