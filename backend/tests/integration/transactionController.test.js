const request = require('supertest');
const app = require('../../server');
const { initializeDatabase, cleanupDatabase } = require('../sql/testSQLUtils');
const db = require('../../config/db');

// Test data
const TEST_USER_EMAIL = 'ali.khan@example.com';
const TEST_NON_USER_EMAIL = 'newdonor@example.com';

// Global setup and teardown
beforeAll(async () => {
  // Any global setup if needed
});

afterAll(async () => {
  await cleanupDatabase();
});

describe('Transaction Controller Integration', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions', async () => {
      const res = await request(app)
        .get('/api/transactions');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
    });
  });

  describe('GET /api/transactions/:tid', () => {
    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app)
        .get('/api/transactions/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('No transactions found with TransactionID 999');
    });

    it('should return transaction when it exists', async () => {
      // First create a transaction
      const transactionData = {
        EMAIL: TEST_USER_EMAIL,
        AMOUNT: 100.00,
        FIRSTNAME: 'Ali',
        LASTNAME: 'Khan',
        METHOD: 'credit_card',
        ADDRESS: '123 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1',
        NOTES: 'Test transaction'
      };

      await request(app)
        .post('/api/transactions')
        .send(transactionData);

      // Get the created transaction
      const [transactions] = await db.query('SELECT TRANSACTION_ID FROM TRANSACTIONS ORDER BY TRANSACTION_ID DESC LIMIT 1');
      const transactionId = transactions[0].TRANSACTION_ID;

      const res = await request(app)
        .get(`/api/transactions/${transactionId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('transaction');
      expect(res.body.transaction.TRANSACTION_ID).toBe(transactionId);
      expect(res.body.transaction.EMAIL).toBe(TEST_USER_EMAIL);
      expect(res.body.transaction.AMOUNT).toBe(100.00);
    });
  });

  describe('POST /api/transactions', () => {
    it('should create transaction for existing user (new donor)', async () => {
      const transactionData = {
        EMAIL: TEST_USER_EMAIL,
        AMOUNT: 150.00,
        FIRSTNAME: 'Ali',
        LASTNAME: 'Khan',
        METHOD: 'credit_card',
        ADDRESS: '123 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1',
        NOTES: 'Test donation'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(transactionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Transaction and new donor (user) created successfully.');

      // Verify transaction was created
      const [transactions] = await db.query('SELECT * FROM TRANSACTIONS WHERE EMAIL = ?', [TEST_USER_EMAIL]);
      expect(transactions).toHaveLength(1);
      expect(transactions[0].AMOUNT).toBe("150.00");
      expect(transactions[0].METHOD).toBe('credit_card');
      expect(transactions[0].RECEIPT_NUMBER).toMatch(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/);

      // Verify donor was created
      const [donors] = await db.query('SELECT * FROM DONORS WHERE EMAIL = ?', [TEST_USER_EMAIL]);
      expect(donors).toHaveLength(1);
      expect(donors[0].FIRSTNAME).toBe('Ali');
      expect(donors[0].LASTNAME).toBe('Khan');
      expect(donors[0].AMOUNT_DONATED).toBe("150.00");
    });

    it('should create transaction for existing donor (user)', async () => {
      // First create a donor
      const firstTransactionData = {
        EMAIL: TEST_USER_EMAIL,
        AMOUNT: 100.00,
        FIRSTNAME: 'Ali',
        LASTNAME: 'Khan',
        METHOD: 'credit_card',
        ADDRESS: '123 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1',
        NOTES: 'First donation'
      };

      await request(app)
        .post('/api/transactions')
        .send(firstTransactionData);

      // Create second transaction for same donor
      const secondTransactionData = {
        EMAIL: TEST_USER_EMAIL,
        AMOUNT: 75.00,
        FIRSTNAME: 'Ali',
        LASTNAME: 'Khan',
        METHOD: 'debit_card',
        ADDRESS: '123 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1',
        NOTES: 'Second donation'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(secondTransactionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Transaction created for existing donor.');

      // Verify donor amount was updated
      const [donors] = await db.query('SELECT * FROM DONORS WHERE EMAIL = ?', [TEST_USER_EMAIL]);
      expect(donors).toHaveLength(1);
      expect(donors[0].AMOUNT_DONATED).toBe("175.00");

      // Verify both transactions exist
      const [transactions] = await db.query('SELECT * FROM TRANSACTIONS WHERE EMAIL = ?', [TEST_USER_EMAIL]);
      expect(transactions).toHaveLength(2);
    });

    it('should create transaction for non-user (new donor)', async () => {
      const transactionData = {
        EMAIL: TEST_NON_USER_EMAIL,
        AMOUNT: 200.00,
        FIRSTNAME: 'Jane',
        LASTNAME: 'Smith',
        METHOD: 'paypal',
        ADDRESS: '456 Oak Ave',
        CITY: 'Burnaby',
        PROVINCE: 'BC',
        POSTALCODE: 'V5C2Z4',
        NOTES: 'Anonymous donation'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(transactionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Transaction and new donor (non-user) created successfully.');

      // Verify transaction was created
      const [transactions] = await db.query('SELECT * FROM TRANSACTIONS WHERE EMAIL = ?', [TEST_NON_USER_EMAIL]);
      expect(transactions).toHaveLength(1);
      expect(transactions[0].AMOUNT).toBe("200.00");
      expect(transactions[0].METHOD).toBe('paypal');

      // Verify donor was created
      const [donors] = await db.query('SELECT * FROM DONORS WHERE EMAIL = ?', [TEST_NON_USER_EMAIL]);
      expect(donors).toHaveLength(1);
      expect(donors[0].FIRSTNAME).toBe('Jane');
      expect(donors[0].LASTNAME).toBe('Smith');
      expect(donors[0].AMOUNT_DONATED).toBe("200.00");
    });

    it('should create transaction for existing donor (non-user)', async () => {
      // First create a donor
      const firstTransactionData = {
        EMAIL: TEST_NON_USER_EMAIL,
        AMOUNT: 50.00,
        FIRSTNAME: 'Jane',
        LASTNAME: 'Smith',
        METHOD: 'credit_card',
        ADDRESS: '456 Oak Ave',
        CITY: 'Burnaby',
        PROVINCE: 'BC',
        POSTALCODE: 'V5C2Z4',
        NOTES: 'First donation'
      };

      await request(app)
        .post('/api/transactions')
        .send(firstTransactionData);

      // Create second transaction for same donor
      const secondTransactionData = {
        EMAIL: TEST_NON_USER_EMAIL,
        AMOUNT: 125.00,
        FIRSTNAME: 'Jane',
        LASTNAME: 'Smith',
        METHOD: 'bank_transfer',
        ADDRESS: '456 Oak Ave',
        CITY: 'Burnaby',
        PROVINCE: 'BC',
        POSTALCODE: 'V5C2Z4',
        NOTES: 'Second donation'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(secondTransactionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Transaction created for existing donor.');

      // Verify donor amount was updated
      const [donors] = await db.query('SELECT * FROM DONORS WHERE EMAIL = ?', [TEST_NON_USER_EMAIL]);
      expect(donors).toHaveLength(1);
      expect(donors[0].AMOUNT_DONATED).toBe("175.00");
    });

    it('should generate unique receipt numbers', async () => {
      const transactionData1 = {
        EMAIL: 'test1@example.com',
        AMOUNT: 100.00,
        FIRSTNAME: 'Test',
        LASTNAME: 'User1',
        METHOD: 'credit_card',
        ADDRESS: '123 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1'
      };

      const transactionData2 = {
        EMAIL: 'test2@example.com',
        AMOUNT: 200.00,
        FIRSTNAME: 'Test',
        LASTNAME: 'User2',
        METHOD: 'credit_card',
        ADDRESS: '456 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1'
      };

      await request(app)
        .post('/api/transactions')
        .send(transactionData1);

      await request(app)
        .post('/api/transactions')
        .send(transactionData2);

      const [transactions] = await db.query('SELECT RECEIPT_NUMBER FROM TRANSACTIONS WHERE EMAIL IN (?, ?)', ['test1@example.com', 'test2@example.com']);
      expect(transactions).toHaveLength(2);
      expect(transactions[0].RECEIPT_NUMBER).not.toBe(transactions[1].RECEIPT_NUMBER);
      expect(transactions[0].RECEIPT_NUMBER).toMatch(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/);
      expect(transactions[1].RECEIPT_NUMBER).toMatch(/^RCPT-\d{8}-[A-Za-z0-9]{6}$/);
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        EMAIL: 'test@example.com',
        // Missing AMOUNT, FIRSTNAME, LASTNAME, METHOD
        ADDRESS: '123 Test St',
        CITY: 'Vancouver'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(incompleteData);

      expect(res.statusCode).toBe(500); // Should fail due to missing required fields
    });
  });

  describe('GET /api/donors', () => {
    it('should return all donors', async () => {
      // Create some donors first
      const transactionData1 = {
        EMAIL: 'donor1@example.com',
        AMOUNT: 100.00,
        FIRSTNAME: 'Donor',
        LASTNAME: 'One',
        METHOD: 'credit_card',
        ADDRESS: '123 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1'
      };

      const transactionData2 = {
        EMAIL: 'donor2@example.com',
        AMOUNT: 200.00,
        FIRSTNAME: 'Donor',
        LASTNAME: 'Two',
        METHOD: 'credit_card',
        ADDRESS: '456 Test St',
        CITY: 'Vancouver',
        PROVINCE: 'BC',
        POSTALCODE: 'V5K0A1'
      };

      await request(app)
        .post('/api/transactions')
        .send(transactionData1);

      await request(app)
        .post('/api/transactions')
        .send(transactionData2);

      const res = await request(app)
        .get('/api/donors');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('donors');
      expect(Array.isArray(res.body.donors)).toBe(true);
      expect(res.body.donors.length).toBeGreaterThanOrEqual(2);
    });
  });
}); 