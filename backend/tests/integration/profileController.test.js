const request = require('supertest');
const app = require('../../server');
const { initializeDatabase, cleanupDatabase } = require('../sql/testSQLUtils');
const db = require('../../config/db');
const { generateToken } = require('../testUtils');

// Global setup and teardown
beforeAll(async () => {
  // Any global setup if needed
});

afterAll(async () => {
  await cleanupDatabase();
});

describe('Profile Controller Integration', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });


  describe('GET /api/profile', () => {
    it('should return the current logged in user profile', async () => {
      // UID 1 is seeded (Ali Khan)
      const token = generateToken({ uid: 1, roles: ['Admin'] });
      const res = await request(app)
        .get('/api/profile')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('UID', 1);
    });

    it('should fail with 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/profile');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 404 if the user does not exist', async () => {
      // Use a token for a non-existent user
      const token = generateToken({ uid: 99999, roles: ['Admin'] });
      const res = await request(app)
        .get('/api/profile')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/profile', () => {

    it('should update the current user profile with valid data', async () => {
      const token = generateToken({ uid: 1, roles: ['Admin'] });
      const res = await request(app)
        .put('/api/profile')
        .set('Cookie', [`token=${token}`])
        .send({
          FIRSTNAME: 'Updated',
          MIDDLENAME: 'A',
          LASTNAME: 'Khan',
          DOB: '1990-04-20',
          EMAIL: 'ali.khan@example.com',
          PASSWORD: 'abc123',
          PHONENUMBER: '6045551234',
          ADDRESS: '123 Main St',
          CITY: 'UpdatedCity',
          PROVINCE: 'BC',
          POSTALCODE: 'V5K0A1'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
// ... existing code ...
    it('should fail with 404 if the user does not exist', async () => {
      const token = generateToken({ uid: 99999, roles: ['Admin'] });
      const res = await request(app)
        .put('/api/profile')
        .set('Cookie', [`token=${token}`])
        .send({ CITY: 'NoUserCity' });
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 401 if no token is provided', async () => {
      const res = await request(app)
        .put('/api/profile')
        .send({ CITY: 'NoTokenCity' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
}); 
