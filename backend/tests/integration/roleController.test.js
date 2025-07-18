const request = require('supertest');
const app = require('../../server');
const { initializeDatabase } = require('../sql/testSQLUtils');
const db = require('../../config/db');
const { generateToken } = require('../testUtils');

describe('Role Controller Integration', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });


  describe('GET /api/roles', () => {
    it('should get all roles with valid token and permission', async () => {
      const token = generateToken({ uid: 1, roles: ['Admin'] });

      const res = await request(app)
        .get('/api/roles')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('roles');
      expect(Array.isArray(res.body.roles)).toBe(true);
      expect(res.body.roles.length).toBeGreaterThan(0);
    });

    it('should fail to get all roles without a token', async () => {
      const res = await request(app)
        .get('/api/roles');
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail to get all roles with token but without permission', async () => {
      const token = generateToken({ uid: 1, roles: ['Student'] });
      const res = await request(app)
        .get('/api/roles')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/roles/:roleid', () => {
    it('should get users for an existing role with valid token and permission', async () => {
      // RoleID 4 (Student) is assigned to UID 1 in seed
      const token = generateToken({ uid: 1, roles: ['Admin', 'view_roles'] });
      const res = await request(app)
        .get('/api/roles/4')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
    });

    it('should fail for a non-existent role', async () => {
      const token = generateToken({ uid: 1, roles: ['Admin', 'view_roles'] });
      const res = await request(app)
        .get('/api/roles/99999')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/roles/4');
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 403 if token does not have permission', async () => {
      const token = generateToken({ uid: 1, roles: ['Student'] });
      const res = await request(app)
        .get('/api/roles/4')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 404 if role exists but has no users', async () => {
      // RoleID 5 (Donor) is not assigned to any user in seed
      const token = generateToken({ uid: 1, roles: ['Admin', 'view_roles'] });
      const res = await request(app)
        .get('/api/roles/5')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });
}); 
