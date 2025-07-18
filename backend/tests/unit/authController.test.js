const authController = require('../../controllers/authController');
const otpService = require('../../services/otpService');
const userModel = require('../../models/userModel');
const bcrypt = require('bcrypt');
const CustomError = require('../../utils/customError');

jest.mock('../../services/otpService');
jest.mock('../../models/userModel');
jest.mock('bcrypt');

describe('authController', () => {
  describe('requestOtpReset', () => {
    it('should send OTP if email is provided', async () => {
      userModel.getUserByEmail.mockResolvedValue({ UID: 1 });
      otpService.generateOtp.mockReturnValue('123456');
      otpService.storeOtp.mockResolvedValue();
      const req = { body: { email: 'a@b.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.requestOtpReset(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If that contact exists, an OTP has been sent.' });
    });
    it('should send OTP if phone is provided', async () => {
      userModel.getUserByPhone.mockResolvedValue({ UID: 2 });
      otpService.generateOtp.mockReturnValue('654321');
      otpService.storeOtp.mockResolvedValue();
      const req = { body: { phone: '1234567890' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.requestOtpReset(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If that contact exists, an OTP has been sent.' });
    });
    it('should respond with 400 if neither email nor phone is provided', async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.requestOtpReset(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
    it('should log error if exception thrown', async () => {
      userModel.getUserByEmail.mockRejectedValue(new Error('DB error'));
      otpService.generateOtp.mockReturnValue('123456');
      otpService.storeOtp.mockResolvedValue();
      const req = { body: { email: 'a@b.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.requestOtpReset(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError))
    });
  });

  describe('verifyOtpAndResetPassword', () => {
    it('should respond with 400 if neither email nor phone is provided', async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
    it('should respond with 404 if user not found (email)', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      const req = { body: { email: 'a@b.com', otp: '123456', newPassword: 'pass' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
    });
    it('should respond with 404 if user not found (phone)', async () => {
      userModel.getUserByPhone.mockResolvedValue(null);
      const req = { body: { phone: '1234567890', otp: '123456', newPassword: 'pass' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
    });
    it('should respond with 400 if OTP is invalid', async () => {
      userModel.getUserByEmail.mockResolvedValue({ UID: 1 });
      otpService.verifyOtp.mockResolvedValue(false);
      const req = { body: { email: 'a@b.com', otp: 'wrong', newPassword: 'pass' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
    it('should respond with 500 if updatePassword fails', async () => {
      userModel.getUserByEmail.mockResolvedValue({ UID: 1 });
      otpService.verifyOtp.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed');
      userModel.updatePassword.mockResolvedValue({ affectedRows: 0 });
      const req = { body: { email: 'a@b.com', otp: '123456', newPassword: 'pass' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
    it('should respond with 200 if password reset is successful', async () => {
      userModel.getUserByEmail.mockResolvedValue({ UID: 1 });
      otpService.verifyOtp.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed');
      userModel.updatePassword.mockResolvedValue({ affectedRows: 1 });
      const req = { body: { email: 'a@b.com', otp: '123456', newPassword: 'pass' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successful' });
    });
    it('should respond with 500 if error thrown', async () => {
      userModel.getUserByEmail.mockRejectedValue(new Error('DB error'));
      const req = { body: { email: 'a@b.com', otp: '123456', newPassword: 'pass' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await authController.verifyOtpAndResetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      logSpy.mockRestore();
    });
  });
}); 
