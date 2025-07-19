const transactionController = require('../../controllers/transactionController');
const transactionModel = require('../../models/transactionModel');
const userModel = require('../../models/userModel');
const donorModel = require('../../models/donorModel');
const roleService = require('../../services/roleService');
const CustomError = require('../../utils/customError');
const { cleanupDatabase } = require('../sql/testSQLUtils');

jest.mock('../../models/transactionModel');
jest.mock('../../models/userModel');
jest.mock('../../models/donorModel');
jest.mock('../../services/roleService');

// Global setup and teardown
beforeAll(async () => {
  // Any global setup if needed
});

afterAll(async () => {
  await cleanupDatabase();
});

describe('transactionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTransactions', () => {
    it('should respond with 200 and transactions on success', async () => {
      const fakeTransactions = [
        { 
          TRANSACTION_ID: 1, 
          EMAIL: 'test@example.com',
          AMOUNT: 100.00,
          METHOD: 'credit_card',
          RECEIPT_NUMBER: 'RCPT-20241201-ABC123'
        }
      ];
      transactionModel.getAllTransactions.mockResolvedValue(fakeTransactions);
      
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.getAllTransactions(req, res, next);
      
      expect(transactionModel.getAllTransactions).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: fakeTransactions });
    });

    it('should call next with error if exception thrown', async () => {
      const error = new Error('Database connection failed');
      transactionModel.getAllTransactions.mockRejectedValue(error);
      
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await transactionController.getAllTransactions(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
      logSpy.mockRestore();
    });
  });

  describe('getTransactionByTID', () => {
    it('should respond with 200 and transaction when found', async () => {
      const fakeTransaction = {
        TRANSACTION_ID: 1,
        EMAIL: 'test@example.com',
        AMOUNT: 100.00,
        METHOD: 'credit_card',
        RECEIPT_NUMBER: 'RCPT-20241201-ABC123'
      };
      transactionModel.getTransactionByTID.mockResolvedValue(fakeTransaction);
      
      const req = { params: { tid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.getTransactionByTID(req, res, next);
      
      expect(transactionModel.getTransactionByTID).toHaveBeenCalledWith(1);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transaction: fakeTransaction });
    });

    it('should respond with 404 when transaction not found', async () => {
      transactionModel.getTransactionByTID.mockResolvedValue(null);
      
      const req = { params: { tid: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.getTransactionByTID(req, res, next);
      
      expect(transactionModel.getTransactionByTID).toHaveBeenCalledWith(999);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'No transactions found with TransactionID 999' 
      });
    });

    it('should call next with error if exception thrown', async () => {
      const error = new Error('Database error');
      transactionModel.getTransactionByTID.mockRejectedValue(error);
      
      const req = { params: { tid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await transactionController.getTransactionByTID(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
      logSpy.mockRestore();
    });
  });

  describe('createTransaction', () => {
    const mockTransactionData = {
      EMAIL: 'test@example.com',
      AMOUNT: 100.00,
      FIRSTNAME: 'John',
      LASTNAME: 'Doe',
      METHOD: 'credit_card',
      ADDRESS: '123 Main St',
      CITY: 'Vancouver',
      PROVINCE: 'BC',
      POSTALCODE: 'V5K0A1',
      NOTES: 'Test donation'
    };

    beforeEach(() => {
      // Mock console.log to avoid noise in tests
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create transaction for existing donor (user)', async () => {
      const mockUser = { 
        UID: 1, 
        EMAIL: 'test@example.com', 
        FIRSTNAME: 'John', 
        LASTNAME: 'Doe' 
      };
      const mockDonor = { 
        DONOR_ID: 2, 
        AMOUNT_DONATED: 500.00 
      };
      
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      donorModel.getDonorByEmail.mockResolvedValue(mockDonor);
      transactionModel.createTransaction.mockResolvedValue();
      donorModel.updateDonor.mockResolvedValue();
      
      const req = { body: mockTransactionData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.createTransaction(req, res, next);
      
      expect(userModel.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(donorModel.getDonorByEmail).toHaveBeenCalledWith('test@example.com');
      expect(transactionModel.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          DONOR_ID: 2,
          RECEIPT_NUMBER: expect.stringMatching(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/)
        })
      );
      expect(donorModel.updateDonor).toHaveBeenCalledWith(2, 600.00, expect.any(Date));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Transaction created for existing donor.' 
      });
    });

    it('should create transaction and new donor (user)', async () => {
      const mockUser = { 
        UID: 1, 
        EMAIL: 'test@example.com', 
        FIRSTNAME: 'John', 
        LASTNAME: 'Doe' 
      };
      
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      donorModel.getDonorByEmail.mockResolvedValue(null);
      donorModel.createDonor.mockResolvedValue({ DONOR_ID: 3 });
      transactionModel.createTransaction.mockResolvedValue();
      
      const req = { body: mockTransactionData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.createTransaction(req, res, next);
      
      expect(donorModel.createDonor).toHaveBeenCalledWith({
        UID: 1,
        EMAIL: 'test@example.com',
        FIRSTNAME: 'John',
        LASTNAME: 'Doe',
        AMOUNT_DONATED: 100.00,
        LAST_DONATION: expect.any(Date)
      });
      expect(transactionModel.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          DONOR_ID: 3,
          RECEIPT_NUMBER: expect.stringMatching(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/)
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Transaction and new donor (user) created successfully.' 
      });
    });

    it('should create transaction for existing donor (non-user)', async () => {
      const mockDonor = { 
        DONOR_ID: 2, 
        AMOUNT_DONATED: 300.00 
      };
      
      userModel.getUserByEmail.mockResolvedValue(null);
      donorModel.getDonorByEmail.mockResolvedValue(mockDonor);
      transactionModel.createTransaction.mockResolvedValue();
      donorModel.updateDonor.mockResolvedValue();
      
      const req = { body: mockTransactionData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.createTransaction(req, res, next);
      
      expect(userModel.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(donorModel.getDonorByEmail).toHaveBeenCalledWith('test@example.com');
      expect(transactionModel.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          DONOR_ID: 2,
          RECEIPT_NUMBER: expect.stringMatching(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/)
        })
      );
      expect(donorModel.updateDonor).toHaveBeenCalledWith(2, 400.00, expect.any(Date));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Transaction created for existing donor.' 
      });
    });

    it('should create transaction and new donor (non-user)', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      donorModel.getDonorByEmail.mockResolvedValue(null);
      donorModel.createDonor.mockResolvedValue({ DONOR_ID: 4 });
      transactionModel.createTransaction.mockResolvedValue();
      
      const req = { body: mockTransactionData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.createTransaction(req, res, next);
      
      expect(donorModel.createDonor).toHaveBeenCalledWith({
        EMAIL: 'test@example.com',
        FIRSTNAME: 'John',
        LASTNAME: 'Doe',
        AMOUNT_DONATED: 100.00,
        LAST_DONATION: expect.any(Date)
      });
      expect(transactionModel.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          DONOR_ID: 4,
          RECEIPT_NUMBER: expect.stringMatching(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/)
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Transaction and new donor (non-user) created successfully.' 
      });
    });

    it('should generate unique receipt number', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      donorModel.getDonorByEmail.mockResolvedValue(null);
      donorModel.createDonor.mockResolvedValue({ DONOR_ID: 1 });
      transactionModel.createTransaction.mockResolvedValue();
      
      const req = { body: mockTransactionData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.createTransaction(req, res, next);
      
      expect(transactionModel.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          RECEIPT_NUMBER: expect.stringMatching(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/)
        })
      );
    });

    it('should call next with error if exception thrown', async () => {
      const error = new Error('Database error');
      userModel.getUserByEmail.mockRejectedValue(error);
      
      const req = { body: mockTransactionData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await transactionController.createTransaction(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllDonors', () => {
    it('should respond with 200 and donors on success', async () => {
      const fakeDonors = [
        { 
          DONOR_ID: 1, 
          EMAIL: 'donor1@example.com',
          NAME: 'John Doe',
          AMOUNT_DONATED: 500.00
        },
        { 
          DONOR_ID: 2, 
          EMAIL: 'donor2@example.com',
          NAME: 'Jane Smith',
          AMOUNT_DONATED: 300.00
        }
      ];
      donorModel.getAllDonors.mockResolvedValue(fakeDonors);
      
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await transactionController.getAllDonors(req, res, next);
      
      expect(donorModel.getAllDonors).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ donors: fakeDonors });
      logSpy.mockRestore();
    });

    it('should call next with error if exception thrown', async () => {
      const error = new Error('Database error');
      donorModel.getAllDonors.mockRejectedValue(error);
      
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await transactionController.getAllDonors(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
      logSpy.mockRestore();
    });
  });
}); 