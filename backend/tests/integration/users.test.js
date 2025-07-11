jest.mock('../../services/tokenService', () => ({
  verifyToken: jest.fn(() => ({ uid: 999, roles: ['Admin'] }))
}))

const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db')
const dbUtils = require('../sql/testSQLUtils.js')


describe('User API', () => {
  beforeEach(async () => {
    await dbUtils.initializeDatabase()
  });
  describe('GET /api/users/:uid', () => {
    beforeAll(async () => {
      await db.query('DELETE FROM USER_ROLE');
      await db.query('DELETE FROM COURSE_INSTRUCTORS');

      await db.query('DELETE FROM USERS');
      await db.query('ALTER TABLE USERS AUTO_INCREMENT = 1');
      await db.query(`
        INSERT INTO USERS (FirstName, LastName, Email, DOB, PhoneNumber, Address, City, Province, PostalCode)
        VALUES 
        ('Ali', 'Khan', 'ali.khan@example.com', '1990-04-20', '6045551234', '123 Main St', 'Vancouver', 'BC', 'V5K0A1'),
        ('Ubada', 'Raja', 'ubada.r@example.com', '1995-09-15', '6045555678', '456 Oak Ave', 'Burnaby', 'BC', 'V5C2Z4');
        `);
    });
    test.each([
      [1, 200, 'Ali'],        // assuming UID 1 exists, with FirstName Ali
      [9999, 404, 'User not found'],   // non-existent UID
    ])('should return %i status for UID %s', async (uid, expectedStatus, expectedMessage) => {
      const all = await request(app).get('/api/users')
      const res = await request(app).get(`/api/users/${uid}`);

      expect(res.statusCode).toBe(expectedStatus);

      if (expectedStatus === 200) {
        expect(res.body.user).toHaveProperty('FirstName', expectedMessage);
      } else {
        expect(res.body.message).toBe(expectedMessage);
      }
    });
  });

  describe('GET /api/users', () => {

    beforeAll(async () => {
      await db.query('DELETE FROM USER_ROLE');
      await db.query('DELETE FROM COURSE_INSTRUCTORS');

      await db.query('DELETE FROM USERS');
      await db.query('ALTER TABLE USERS AUTO_INCREMENT = 1');
      await db.query(`
        INSERT INTO USERS (FirstName, LastName, Email, DOB, PhoneNumber, Address, City, Province, PostalCode)
        VALUES 
        ('Ali', 'Khan', 'ali.khan@example.com', '1990-04-20', '6045551234', '123 Main St', 'Vancouver', 'BC', 'V5K0A1'),
        ('Ubada', 'Raja', 'ubada.r@example.com', '1995-09-15', '6045555678', '456 Oak Ave', 'Burnaby', 'BC', 'V5C2Z4');
        `);
    });
    it('should return a list of users', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
      expect(res.body.users[0]).toHaveProperty('UID');
      expect(res.body.users[0]).toHaveProperty('FirstName');
      expect(res.body.users[1]).toHaveProperty('UID');
      expect(res.body.users[1]).toHaveProperty('FirstName');
    });
  })

  // If access control is applied
  // it('should return 401 if not authenticated', async () => {
    //   const res = await request(app).get('/api/users'); // No token
    //   expect(res.statusCode).toBe(401);
    // });

  describe('POST /api/users', () => {
    test.each([
  // valid case
  [201, { FirstName: 'Ali', LastName: 'Khan', Email: 'ali@example.com', DOB: '1990-04-20', PhoneNumber: '6045551234', Address: '123 Main St', City: 'Vancouver', Province: 'BC', PostalCode: 'V5K0A1' }],




  // duplicate email
  [409, { FirstName: 'Ali', LastName: 'Khan', Email: 'ali.khan@example.com', DOB: '1990-04-20' }],

  // without optional fields
  [201, { FirstName: 'Yusuf', LastName: 'Ali', Email: 'yusufa@example.com', DOB: '2000-01-01' }],

  // missing LastName
  // [400, { FirstName: 'Ali', Email: 'ali@example.com', DOB: '1990-04-20' }],

  // missing FirstName
  // [400, { LastName: 'Khan', Email: 'ali@example.com', DOB: '1990-04-20' }],

  // invalid Email
  // [400, { FirstName: 'Ali', LastName: 'Khan', Email: 'invalid-email', DOB: '1990-04-20' }],

  // invalid ph
  // [400, { FirstName: 'Ali', LastName: 'Khan', Email: 'ali2@example.com', DOB: '1990-04-20', PhoneNumber: 'abc123' },

  // invalid DOB
  // [400, { FirstName: 'Ali', LastName: 'Khan', Email: 'ali3@example.com', DOB: '1990-40-90' }],

  // empty FirstName
  // [400, { FirstName: '', LastName: 'Khan', Email: 'ali4@example.com', DOB: '1990-04-20' }],

  // long FirstName
  // [400, { FirstName: 'A'.repeat(300), LastName: 'Khan', Email: 'ali5@example.com', DOB: '1990-04-20' }],

])('POST /api/users should respond with status %i for input %o', async (expectedStatus, userData) => {
      const res = await request(app).post('/api/users').send(userData);
      expect(res.statusCode).toBe(expectedStatus);
    });
  });
  describe('DELETE /api/users/:uid', () => {
    test.each([
      [1, 200, 'User with UID 1 deleted successfully.'],        // assuming UID 1 exists, with FirstName Ali
    ])('should return %i status for UID %s', async (uid, expectedStatus, expectedMessage) => {
      const res = await request(app).delete(`/api/users/${uid}`);

      expect(res.statusCode).toBe(expectedStatus);

      if (expectedStatus === 200) {
        expect(res.body.message).toBe(expectedMessage);
      } else {
        expect(res.body.message).toBe(expectedMessage);
      }
    });
  });

  describe('User Roles API', () => {
    beforeEach(async () => {
      await db.query('DELETE FROM USER_ROLE');
      await db.query('DELETE FROM COURSE_INSTRUCTORS');

      await db.query('DELETE FROM USERS');
      await db.query('ALTER TABLE USERS AUTO_INCREMENT = 1');
      await db.query(`
        INSERT INTO USERS (FirstName, LastName, Email, DOB, PhoneNumber, Address, City, Province, PostalCode)
        VALUES 
        ('Ali', 'Khan', 'ali.khan@example.com', '1990-04-20', '6045551234', '123 Main St', 'Vancouver', 'BC', 'V5K0A1'),
        ('Ubada', 'Raja', 'ubada.r@example.com', '1995-09-15', '6045555678', '456 Oak Ave', 'Burnaby', 'BC', 'V5C2Z4');
        `);
      await db.query(`
        INSERT INTO USER_ROLE (UID, RoleID) VALUES (2, 2)
        `);

    });

    describe('POST /api/users/:uid/roles/', () => {
      it.each([
        [{ UID: 1, RoleID: 2}, 201, 'Role 2 Assigned to User 1'],
        [{ UID: 99, RoleID: 2}, 404, 'User not found'],
        [{ UID: 1, RoleID: 999}, 404, 'Role not found'],
        [{ UID: 2, RoleID: 2}, 409, 'User already has this role assigned'],
      ])('POST /api/users with data %o should return status %i', async (postData, expectedStatus) => {
        const res = await request(app).post(`/api/users/${postData.UID}/roles`).send(postData);
        expect(res.statusCode).toBe(expectedStatus);
      });
    })

    describe('GET /api/users/:uid/roles', () => {
      it.each([
        [2, 200, 'Instructor'],
        [999, 404, 'User not found'],
      ])('GET /api/users/%o/roles/ should return status %i', async (uid, expectedStatus, expectedMessage) => {
        const res = await request(app).get(`/api/users/${uid}/roles`).set('Authorization', 'Bearer dummy');
        const res1 = await request(app).get(`/api/users/`)
        expect(res.statusCode).toBe(expectedStatus);
        if (res.statusCode === 200) {
          expect(res.body.roles[0].ROLENAME).toBe(expectedMessage)
        } else {
          expect(res.body.message).toBe(expectedMessage)
        }
      });
    })
    describe('DELETE /api/users/:uid/roles/:roleid', () => {
      it.each([
        [2, 2, 200, 'Role 2 removed from User with UID 2.'],
        [999, 2, 404, 'User not found'],
        [1, 999, 404, 'Role not found'],
        [1, 2, 404, 'User 1 does not have Role 2'],
      ])('DELETE /api/users/%o/roles/%o should return status %i', async (uid, roleid, expectedStatus, expectedMessage) => {
        const res = await request(app).delete(`/api/users/${uid}/roles/${roleid}`).set('Authorization', 'Bearer dummy');
        expect(res.statusCode).toBe(expectedStatus);
        if (res.statusCode === 200) {
          expect(res.body.message).toBe(expectedMessage)
        } else {
          expect(res.body.message).toBe(expectedMessage)
        }
      });
    })
  });
})
