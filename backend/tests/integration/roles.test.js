const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db')
const dbUtils = require('../sql/testSQLUtils.js')

describe('Role API', () => {
  describe('GET /api/users/:uid', () => {
    it('should return 404 if user not found', async () => {
      const res = await request(app).get('/api/users/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 200 if user is found', async () => {
      const res = await request(app).get('/api/users/2');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user', {"UID":2,"FirstName":"Ubada","MiddleName":null,"LastName":"Raja","DOB":"1995-09-15T07:00:00.000Z","Email":"ubada.r@example.com","PhoneNumber":"6045555678","Address":"456 Oak Ave","City":"Burnaby","Province":"BC","PostalCode":"V5C2Z4"})
    });

  });

  describe('POST /api/users/', () => {
    beforeEach(async () => {
      await dbUtils.initializeDatabase()
    })

    it('should return 201 and create user', async () => {
      const res = await request(app).post('/api/users').send(
        {FirstName: 'Khalid',
          MiddleName: null,
          LastName: 'Ali',
          DOB: '1990-04-20',
          Email: 'khalid@example.com',
          PhoneNumber: '6045555555',
          Address: '12345 1 st',
          City: 'Vancouver',
          Province: 'BC',
          PostalCode: 'V1V1V1'
        }
      )
      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('message', 'User created successfully')
      const checkUserExists = await request(app).get('/api/users/5')
      expect(checkUserExists.statusCode).toBe(200);
      expect(checkUserExists.body).toHaveProperty('user', {UID: 5,
        FirstName: 'Khalid',
        MiddleName: null,
        LastName: 'Ali',
        DOB: '1990-04-20T07:00:00.000Z',
        Email: 'khalid@example.com',
        PhoneNumber: '6045555555',
        Address: '12345 1 st',
        City: 'Vancouver',
        Province: 'BC',
        PostalCode: 'V1V1V1'
      })

    });
  });
  describe('PUT /api/users/:uid', () => {
    it('should return 200 if user is found and updated', async () => {
      const res = await request(app).put('/api/users/1').send({
        FirstName: 'Ali',
          MiddleName: 'Ahmad',
          LastName: 'Khan',
          DOB: '1990-04-20',
          Email: 'alikhan@example.com',
          PhoneNumber: '6045551234',
          Address: '124 Main St',
          City: 'Vancouver',
          Province: 'BC',
          PostalCode: 'V5K0A1'
        })
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message', 'User with UID 1 updated successfully.')
      const checkUserExists = await request(app).get('/api/users/1')
      expect(checkUserExists.statusCode).toBe(200);
      expect(checkUserExists.body).toHaveProperty('user', {UID: 1,
        FirstName: 'Ali',
        MiddleName: 'Ahmad',
        LastName: 'Khan',
        DOB: '1990-04-20T07:00:00.000Z',
        Email: 'alikhan@example.com',
        PhoneNumber: '6045551234',
        Address: '124 Main St',
        City: 'Vancouver',
        Province: 'BC',
        PostalCode: 'V5K0A1'
      })
    })
    it('should return 404', async () => {
      const res = await request(app).put('/api/users/999').send({
        FirstName: 'Ali',
          MiddleName: 'Ahmad',
          LastName: 'Khan',
          DOB: '1990-04-20',
          Email: 'alikhan@example.com',
          PhoneNumber: '6045551234',
          Address: '124 Main St',
          City: 'Vancouver',
          Province: 'BC',
          PostalCode: 'V5K0A1'
        })
      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty('message', 'User not found')
    })
  });
 describe('DELETE /api/users/:uid', () => {
   it('should delete user and return 200', async () => {
     const res = await request(app).delete('/api/users/5')
     expect(res.statusCode).toBe(200)
     expect(res.body).toHaveProperty('message', 'User with UID 5 deleted successfully.')
   });
   it('should return 404, user not found', async () => {
     const res = await request(app).delete('/api/users/9999')
     expect(res.statusCode).toBe(404)
     expect(res.body).toHaveProperty('message', 'User not found')
   });
 });

});
