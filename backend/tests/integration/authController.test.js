const request = require('supertest');
const app = require('../../server');
const { initializeDatabase } = require('../sql/testSQLUtils');
const db = require('../../config/db');
const otpService = require('../../services/otpService');

// Use a seeded user from test_init.sql
const TEST_EMAIL = 'ali.khan@example.com';
const TEST_PHONE = '6045551234';

// Helper to get user UID
async function getUserUIDByEmail(email) {
  const [rows] = await db.query('SELECT UID FROM USERS WHERE Email = ?', [email]);
  return rows[0]?.UID;
}

describe('Auth OTP Integration', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    await db.end();
  });

  describe('POST /api/request-otp', () => {
    it('should send OTP for valid email', async () => {
      const res = await request(app)
        .post('/api/request-otp')
        .send({ email: TEST_EMAIL });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/OTP has been sent/);
    });

    it('should send OTP for valid phone', async () => {
      const res = await request(app)
        .post('/api/request-otp')
        .send({ phone: TEST_PHONE });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/OTP has been sent/);
    });

    it('should fail if no contact provided', async () => {
      const res = await request(app)
        .post('/api/request-otp')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/verify-otp', () => {
    it('should reset password with valid OTP', async () => {
      // Simulate requesting OTP
      const uid = await getUserUIDByEmail(TEST_EMAIL);
      const otp = otpService.generateOtp();
      await otpService.storeOtp(uid, otp);
      const newPassword = 'newStrongPassword123!';
      const res = await request(app)
        .post('/api/verify-otp')
        .send({ email: TEST_EMAIL, otp, newPassword });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Password reset successful/);
    });

    it('should fail with invalid OTP', async () => {
      const uid = await getUserUIDByEmail(TEST_EMAIL);
      const otp = '000000'; // unlikely to be valid
      const newPassword = 'anotherPassword!';
      const res = await request(app)
        .post('/api/verify-otp')
        .send({ email: TEST_EMAIL, otp, newPassword });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail for non-existent user', async () => {
      const res = await request(app)
        .post('/api/verify-otp')
        .send({ email: 'notfound@example.com', otp: '123456', newPassword: 'pw' });
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail if no contact provided', async () => {
      const res = await request(app)
        .post('/api/verify-otp')
        .send({ otp: '123456', newPassword: 'pw' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });
}); 