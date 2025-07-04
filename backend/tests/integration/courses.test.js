const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db')
const dbUtils = require('../sql/testSQLUtils.js')

// beforeAll(() => {
  //   return initializeCityDatabase();
  // });

describe('Course API', () => {
  describe('GET /api/courses/:cid', () => {
    it('should return 404 if course not found', async () => {
      const res = await request(app).get('/api/courses/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Course not found');
    });

    it('should return 200 if course is found', async () => {
      const res = await request(app).get('/api/courses/2');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('course', {"CourseID":2,"Title":"Beginner Arabic Workshop","StartDate":"2025-07-11T00:00:00.000Z","EndDate":"2025-08-26T02:00:00.000Z","Schedule":"Tuesday, Thursday","Location":"Community Center Room B"})
    });

  });

  describe('POST /api/courses/', () => {
    beforeEach(async () => {
      await dbUtils.initializeDatabase()
    })

    it('should return 201 and create course', async () => {
      const res = await request(app).post('/api/courses').send(
        {
          Title: "Introduction to Quranic Arabic",
          StartDate: "2025-07-15 18:30:00",
          EndDate: "2025-08-20 20:30:00",
          Schedule: "Monday, Wednesday",
          Location: "Masjid Main Hall"
        })
      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('message', 'Course created successfully')
      const checkCourseExists = await request(app).get('/api/courses/4')
      expect(checkCourseExists.statusCode).toBe(200);
      expect(checkCourseExists.body).toHaveProperty('course', {
          CourseID: 4,
          Title: "Introduction to Quranic Arabic",
          StartDate: "2025-07-16T01:30:00.000Z",
          EndDate: "2025-08-21T03:30:00.000Z",
          Schedule: "Monday, Wednesday",
          Location: "Masjid Main Hall"
        })

    });
  });
  describe('PUT /api/courses/:uid', () => {
    it('should return 200 if course is found and updated', async () => {
      const res = await request(app).put('/api/courses/1').send({
          Title: "Quran Memorization Class",
          StartDate: "2025-08-15 18:30:00",
          EndDate: "2025-09-30 10:30:00",
          Schedule: "Monday, Friday",
          Location: "Masjid Main Hall"
        })
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message', 'Course with CourseID 1 updated successfully.')
      const checkCourseExists = await request(app).get('/api/courses/1')
      expect(checkCourseExists.statusCode).toBe(200);
      expect(checkCourseExists.body).toHaveProperty('course', 
        {
          CourseID: 1,
          Title: "Quran Memorization Class",
          StartDate: "2025-08-16T01:30:00.000Z",
          EndDate: "2025-09-30T17:30:00.000Z",
          Schedule: "Monday, Friday",
          Location: "Masjid Main Hall"
        })
    })
    it('should return 404', async () => {
      const res = await request(app).put('/api/courses/999').send(
        {
          Title: "Quran Memorization Class",
          StartDate: "2025-08-15 18:30:00",
          EndDate: "2025-09-30 20:30:00",
          Schedule: "Monday, Friday",
          Location: "Masjid Main Hall"
        })
      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty('message', 'Course not found')
    })
  });
 describe('DELETE /api/courses/:cid', () => {
   it('should delete course and return 200', async () => {
     const res = await request(app).delete('/api/courses/4')
     expect(res.statusCode).toBe(200)
     expect(res.body).toHaveProperty('message', 'Course with CourseID 4 deleted successfully.')
   });
   it('should return 404, course not found', async () => {
     const res = await request(app).delete('/api/courses/9999')
     expect(res.statusCode).toBe(404)
     expect(res.body).toHaveProperty('message', 'Course not found')
   });
 });

});
