const transactionController = require('../../controllers/transactionController');
const transactionModel = require('../../models/transactionModel');
const userModel = require('../../models/userModel');
const donorModel = require('../../models/donorModel');
const CustomError = require('../../utils/customError');

jest.mock('../../models/transactionModel');
jest.mock('../../models/userModel');
jest.mock('../../models/donorModel');

describe('transactionController', () => {
  describe('getAllTransactions', () => {
    it('should respond with 200 and transactions on success', async () => {
      const fakeTransactions = [{ TID: 1, AMOUNT: 100 }];
      transactionModel.getAllTransactions.mockResolvedValue(fakeTransactions);
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await transactionController.getAllTransactions(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: fakeTransactions });
    });
    it('should call next with error if exception thrown', async () => {
      transactionModel.getAllTransactions.mockRejectedValue(new Error('DB error'));
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await transactionController.getAllTransactions(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      logSpy.mockRestore();
    });
  });

  // getTransactionByTID: only error case, as logic is incomplete (roleService/roleid undefined)
  describe('getTransactionByTID', () => {
    it('should call next with error if exception thrown', async () => {
      transactionModel.getTransactionByTID.mockRejectedValue(new Error('DB error'));
      const req = { params: { tid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await transactionController.getTransactionByTID(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      logSpy.mockRestore();
    });
  });

  describe('createTransaction', () => {
    it('should create transaction for existing donor (user)', async () => {
      userModel.getUserByEmail.mockResolvedValue({ UID: 1, EMAIL: 'a@b.com', FIRSTNAME: 'Ali', LASTNAME: 'Baba' });
      donorModel.getDonorByEmail.mockResolvedValue({ DONOR_ID: 2, AMOUNT_DONATED: 100 });
      transactionModel.createTransaction.mockResolvedValue();
      donorModel.updateDonor.mockResolvedValue();
      const req = { body: { EMAIL: 'a@b.com', AMOUNT: 50, FIRSTNAME: 'Ali', LASTNAME: 'Baba' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await transactionController.createTransaction(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction created for existing donor.' });
    });
    it('should create transaction and new donor (user)', async () => {
      userModel.getUserByEmail.mockResolvedValue({ UID: 1, EMAIL: 'a@b.com', FIRSTNAME: 'Ali', LASTNAME: 'Baba' });
      donorModel.getDonorByEmail.mockResolvedValue(null);
      donorModel.createDonor.mockResolvedValue({ DONOR_ID: 3 });
      transactionModel.createTransaction.mockResolvedValue();
      const req = { body: { EMAIL: 'a@b.com', AMOUNT: 50, FIRSTNAME: 'Ali', LASTNAME: 'Baba' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await transactionController.createTransaction(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction and new donor (user) created successfully.' });
    });
    it('should create transaction for existing donor (non-user)', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      donorModel.getDonorByEmail.mockResolvedValue({ DONOR_ID: 2, AMOUNT_DONATED: 100 });
      transactionModel.createTransaction.mockResolvedValue();
      donorModel.updateDonor.mockResolvedValue();
      const req = { body: { EMAIL: 'a@b.com', AMOUNT: 50, FIRSTNAME: 'Ali', LASTNAME: 'Baba' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await transactionController.createTransaction(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction created for existing donor.' });
    });
    it('should create transaction and new donor (non-user)', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      donorModel.getDonorByEmail.mockResolvedValue(null);
      donorModel.createDonor.mockResolvedValue({ DONOR_ID: 4 });
      transactionModel.createTransaction.mockResolvedValue();
      const req = { body: { EMAIL: 'a@b.com', AMOUNT: 50, FIRSTNAME: 'Ali', LASTNAME: 'Baba' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await transactionController.createTransaction(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction and new donor (non-user) created successfully.' });
    });
    it('should call next with error if exception thrown', async () => {
      userModel.getUserByEmail.mockRejectedValue(new Error('DB error'));
      const req = { body: { EMAIL: 'a@b.com', AMOUNT: 50, FIRSTNAME: 'Ali', LASTNAME: 'Baba' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await transactionController.createTransaction(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      logSpy.mockRestore();
    });
  });

  describe('getAllDonors', () => {
    it('should respond with 200 and donors on success', async () => {
      donorModel.getAllDonors.mockResolvedValue([{ DONOR_ID: 1, EMAIL: 'a@b.com' }]);
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await transactionController.getAllDonors(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ donors: [{ DONOR_ID: 1, EMAIL: 'a@b.com' }] });
    });
    it('should call next with error if exception thrown', async () => {
      donorModel.getAllDonors.mockRejectedValue(new Error('DB error'));
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await transactionController.getAllDonors(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      logSpy.mockRestore();
    });
  });
}); 