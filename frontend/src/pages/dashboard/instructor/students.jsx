import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Chip, Grid, Stack, Avatar, Tooltip, IconButton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `My Students | Instructor Dashboard - ${CONFIG.appName}` };

export default function InstructorStudentsPage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchTeachingCoursesAndStudents = useCallback(async () => {
    if (!user?.UID) return;
    try {
      setLoading(true);
      const coursesResponse = await axios.get(endpoints.courses.list);
      const allCourses = coursesResponse.data.courses || [];
      
      // Filter courses where the current user is the instructor
      const teaching = allCourses.filter(course => {
        const instructorIds = course.INSTRUCTOR_IDS ? course.INSTRUCTOR_IDS.split(',') : [];
        const instructorNames = course.INSTRUCTOR_NAMES ? course.INSTRUCTOR_NAMES.split(',') : [];
        const userFullName = `${user.FIRSTNAME} ${user.LASTNAME}`;
        
        return instructorIds.includes(user.UID.toString()) || instructorNames.includes(userFullName);
      });
      
      setTeachingCourses(teaching);

      // Fetch students for each teaching course
      const studentsMap = new Map();
      for (const course of teaching) {
        try {
          const enrollmentResponse = await axios.get(endpoints.courses.students(course.COURSEID));
          const students = enrollmentResponse.data.students || [];
          students.forEach(student => {
            if (!studentsMap.has(student.UID)) {
              studentsMap.set(student.UID, {
                ...student,
                courses: []
              });
            }
            studentsMap.get(student.UID).courses.push({
              courseId: course.COURSEID,
              courseTitle: course.TITLE,
              enrollment: student
            });
          });
        } catch (error) {
          console.error(`Error fetching students for course ${course.COURSEID}:`, error);
        }
      }
      
      setAllStudents(Array.from(studentsMap.values()));
    } catch (error) {
      console.error('Error fetching teaching courses and students:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.UID, user?.FIRSTNAME, user?.LASTNAME]);

  useEffect(() => {
    if (authenticated && user?.UID) {
      fetchTeachingCoursesAndStudents();
    }
  }, [authenticated, user?.UID, fetchTeachingCoursesAndStudents]);

  if (!authenticated) {
    router.push('/login');
    return null;
  }



  const getEnrollmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'withdrawn': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };





  const handleRemoveStudent = async (studentId, courseId) => {
    if (!confirm('Are you sure you want to remove this student from the course?')) return;

    try {
      await axios.delete(endpoints.courses.removeStudent(courseId, studentId));
      
      // Refresh the data
      fetchTeachingCoursesAndStudents();
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Failed to remove student. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading your students...</div>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="My Students"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Instructor', href: paths.dashboard.instructor.courses },
            { name: 'My Students' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {teachingCourses.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You are not assigned to teach any courses yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Contact an administrator to assign you to courses.
            </Typography>
          </Card>
        ) : allStudents.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No students are enrolled in your courses yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Students will appear here once they enroll in your courses.
            </Typography>
          </Card>
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {allStudents.length}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Across all courses
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    {teachingCourses.length}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Teaching Courses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active assignments
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" gutterBottom>
                    {allStudents.filter(student => 
                      student.courses.some(course => course.enrollment.STATUS === 'active')
                    ).length}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Active Students
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently enrolled
                  </Typography>
                </Card>
              </Grid>
            </Grid>



            {/* Student Cards */}
            <Grid container spacing={3}>
              
              {allStudents.map((student) => (
                <Grid item xs={12} md={6} lg={4} key={student.UID}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                          <Typography variant="h6">
                            {student.FIRSTNAME?.[0]}{student.LASTNAME?.[0]}
                          </Typography>
                        </Avatar>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {student.FIRSTNAME} {student.LASTNAME}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.EMAIL}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Student ID:</strong> {student.UID}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Enrolled Courses:</strong> {student.courses.length}
                        </Typography>
                      </Box>



                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Courses:</strong>
                        </Typography>
                        <Stack spacing={1}>
                          {student.courses.map((course) => (
                            <Box key={course.courseId} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {course.courseTitle}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip
                                  label={course.enrollment.STATUS}
                                  color={getEnrollmentStatusColor(course.enrollment.STATUS)}
                                  size="small"
                                />
                                {course.enrollment.FINAL_GRADE && (
                                  <Chip
                                    label={`${course.enrollment.FINAL_GRADE}%`}
                                    color="primary"
                                    size="small"
                                  />
                                )}
                                <Tooltip title="Remove from course">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveStudent(student.UID, course.courseId)}
                                  >
                                    <Iconify icon="eva:close-fill" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}


      </DashboardContent>
    </>
  );
}
