const request = require('supertest');
const app = require('../../server');
const { initializeDatabase } = require('../sql/testSQLUtils');
const db = require('../../config/db');
const { generateToken } = require('../testUtils');

describe('User Registration Integration', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  const validUser = {
    FIRSTNAME: 'Test',
    MIDDLENAME: 'T',
    LASTNAME: 'User',
    DOB: '2000-01-01',
    EMAIL: 'testuser@example.com',
    PASSWORD: 'TestPassword123!',
    PHONENUMBER: '5551234567',
    ADDRESS: '123 Test St',
    CITY: 'Testville',
    PROVINCE: 'BC',
    POSTALCODE: 'V1V1V1'
  };

  it('should register a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('UID');
  });

  it('should fail to register a user with an existing email', async () => {
    // First registration
    await request(app).post('/api/register').send(validUser);
    // Second registration with same email
    const res = await request(app)
      .post('/api/register')
      .send(validUser);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to register with missing required fields', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ FirstName: 'NoEmail' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('User Login Integration', () => {
  const seededUser = {
    email: 'ali.khan@example.com',
    password: 'abc123' 
  };

  it('should login with valid credentials and set a cookie', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: seededUser.email, password: seededUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail login with invalid email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'notfound@example.com', password: 'password' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: seededUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail login with missing fields', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: seededUser.email });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
  });
}); 

describe('User Logout Integration', () => {
  const seededUser = {
    email: 'ali.khan@example.com',
    password: 'abc123'
  };

  it('should logout after login and clear the token cookie', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/login')
      .send(seededUser);
    const cookie = loginRes.headers['set-cookie'];
    expect(cookie).toBeDefined();
    // Logout
    const logoutRes = await request(app)
      .post('/api/logout')
      .set('Cookie', cookie);
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body).toHaveProperty('message', 'Logged out successfully');
    // Should clear the cookie
    expect(logoutRes.headers['set-cookie']).toBeDefined();
    expect(logoutRes.headers['set-cookie'][0]).toMatch(/token=;/);
  });

  it('should allow logout even if not logged in', async () => {
    const res = await request(app)
      .post('/api/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out successfully');
  });
}); 

describe('Get All Users Integration', () => {
  it('should get all users with valid token and permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_user'] });
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  it('should fail to get all users without a token', async () => {
    const res = await request(app)
      .get('/api/users');
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to get all users with token but without permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Student'] });
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
}); 

describe('Get User by UID Integration', () => {
  it('should get an existing user by UID', async () => {
    // UID 1 is seeded (Ali Khan)
    const res = await request(app)
      .get('/api/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('UID', 1);
  });

  it('should fail for non-existent user UID', async () => {
    const res = await request(app)
      .get('/api/users/99999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail for invalid UID', async () => {
    const res = await request(app)
      .get('/api/users/invalid');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
  });
}); 

describe('Create User Integration', () => {
  const validUser = {
    FIRSTNAME: 'New',
    MIDDLENAME: 'N',
    LASTNAME: 'User',
    DOB: '1999-12-31',
    EMAIL: 'newuser@example.com',
    PASSWORD: 'NewUserPass123!',
    PHONENUMBER: '5559876543',
    ADDRESS: '456 New St',
    CITY: 'Newcity',
    PROVINCE: 'BC',
    POSTALCODE: 'V2V2V2'
  };

  it('should create a new user with valid data and permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_user'] });
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', [`token=${token}`])
      .send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
    expect(res.body).toHaveProperty('UID');
  });

  it('should fail to create a user with an existing email', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_user'] });
    // First create
    await request(app).post('/api/users').set('Cookie', [`token=${token}`]).send(validUser);
    // Second create with same email
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', [`token=${token}`])
      .send(validUser);
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to create a user with missing required fields', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_user'] });
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', [`token=${token}`])
      .send({ FirstName: 'NoEmail' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to create a user without a token', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(validUser);
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to create a user with token but without permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Student'] });
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', [`token=${token}`])
      .send(validUser);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
}); 

describe('Update User Integration', () => {
  const updateData = {
    FIRSTNAME: 'Updated',
    LASTNAME: 'User',
    CITY: 'UpdatedCity'
  };

  it('should update an existing user with valid data and permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_user'] });
    // Update seeded user UID 1
    const res = await request(app)
      .put('/api/users/1')
      .set('Cookie', [`token=${token}`])
      .send(updateData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to update a non-existent user', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_user'] });
    const res = await request(app)
      .put('/api/users/99999')
      .set('Cookie', [`token=${token}`])
      .send(updateData);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to update a user without a token', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send(updateData);
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to update a user with token but without permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Student'] });
    const res = await request(app)
      .put('/api/users/1')
      .set('Cookie', [`token=${token}`])
      .send(updateData);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

describe('Assign Role to User Integration', () => {
  // Use seeded user UID 1 (Ali Khan) and RoleID 2 (Instructor)
  const validRoleData = { UID: 1, ROLEID: 2 };

  it('should assign a valid role to an existing user with permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    const res = await request(app)
      .post('/api/users/1/roles/')
      .set('Cookie', [`token=${token}`])
      .send(validRoleData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to assign a role to a non-existent user', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    const res = await request(app)
      .post('/api/users/99999/roles/')
      .set('Cookie', [`token=${token}`])
      .send({ UID: 99999, RoleID: 2 });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to assign a non-existent role to a user', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    const res = await request(app)
      .post('/api/users/1/roles/')
      .set('Cookie', [`token=${token}`])
      .send({ UID: 1, RoleID: 99999 });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to assign a role that is already assigned', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    // Assign once
    await request(app).post('/api/users/1/roles/').set('Cookie', [`token=${token}`]).send(validRoleData);
    // Assign again
    const res = await request(app)
      .post('/api/users/1/roles/')
      .set('Cookie', [`token=${token}`])
      .send(validRoleData);
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to assign a role without a token', async () => {
    const res = await request(app)
      .post('/api/users/1/roles/')
      .send(validRoleData);
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to assign a role with token but without permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Student'] });
    const res = await request(app)
      .post('/api/users/1/roles/')
      .set('Cookie', [`token=${token}`])
      .send(validRoleData);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
});
}); 

describe('Get User Roles Integration', () => {
  it('should get roles for an existing user with valid token and permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'view_roles'] });
    const res = await request(app)
      .get('/api/users/1/roles')
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('roles');
    expect(Array.isArray(res.body.roles)).toBe(true);
  });

  it('should fail to get roles for a non-existent user', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'view_roles'] });
    const res = await request(app)
      .get('/api/users/99999/roles')
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to get roles without a token', async () => {
    const res = await request(app)
      .get('/api/users/1/roles');
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to get roles with token but without permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Student'] });
    const res = await request(app)
      .get('/api/users/1/roles')
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
}); 

describe('Delete User Role Integration', () => {
  // Use seeded user UID 1 (Ali Khan) and RoleID 4 (Student, which he has in seed)
  const uid = 1;
  const roleid = 4;

  it('should delete a role from an existing user with valid permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    const res = await request(app)
      .delete(`/api/users/${uid}/roles/${roleid}`)
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to delete a role from a non-existent user', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    const res = await request(app)
      .delete(`/api/users/99999/roles/${roleid}`)
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to delete a non-existent role from a user', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    const res = await request(app)
      .delete(`/api/users/${uid}/roles/99999`)
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to delete a role the user does not have', async () => {
    const token = generateToken({ uid: 1, roles: ['Admin', 'modify_role'] });
    // Try to delete a role not assigned (e.g., RoleID 3)
    const res = await request(app)
      .delete(`/api/users/${uid}/roles/3`)
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to delete a user role without a token', async () => {
    const res = await request(app)
      .delete(`/api/users/${uid}/roles/${roleid}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to delete a user role with token but without permission', async () => {
    const token = generateToken({ uid: 1, roles: ['Student'] });
    const res = await request(app)
      .delete(`/api/users/${uid}/roles/${roleid}`)
      .set('Cookie', [`token=${token}`]);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
}); 
