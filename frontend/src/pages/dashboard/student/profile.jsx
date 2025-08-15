import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Grid, Chip, Stack, Paper, Table, Avatar, TableRow, TableBody, TableCell, TableHead, Typography, TableContainer } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `My Profile | Student Dashboard - ${CONFIG.appName}` };

export default function StudentProfilePage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!user?.UID) return;
    try {
      setLoading(true);
      const coursesResponse = await axios.get(endpoints.courses.list);
      const allCourses = coursesResponse.data.courses || [];
      const enrollments = [];
      for (const course of allCourses) {
        try {
          const enrollmentResponse = await axios.get(endpoints.courses.students(course.COURSEID));
          const students = enrollmentResponse.data.students || [];
          const userEnrollment = students.find(student => student.UID === user.UID);
          if (userEnrollment) {
            enrollments.push({ ...course, enrollment: userEnrollment });
          }
        } catch (error) {
          console.error(`Error fetching enrollment for course ${course.COURSEID}:`, error);
        }
      }
      setEnrolledCourses(enrollments);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.UID]);

  useEffect(() => {
    if (authenticated && user?.UID) {
      fetchEnrolledCourses();
    }
  }, [authenticated, user?.UID, fetchEnrolledCourses]);

  if (!authenticated) {
    router.push('/login');
    return null;
  }

  const getCourseStatus = (course) => {
    const now = new Date();
    const startDate = new Date(course.STARTDATE);
    const endDate = new Date(course.ENDDATE);
    if (startDate > now) { return { label: 'Upcoming', color: 'info' }; }
    else if (startDate <= now && endDate >= now) { return { label: 'Ongoing', color: 'success' }; }
    else { return { label: 'Completed', color: 'default' }; }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const calculateGPA = () => {
    const coursesWithGrades = enrolledCourses.filter(course => course.enrollment.FINAL_GRADE);
    if (coursesWithGrades.length === 0) return 0;
    
    const totalGrade = coursesWithGrades.reduce((sum, course) => sum + course.enrollment.FINAL_GRADE, 0);
    return (totalGrade / coursesWithGrades.length).toFixed(2);
  };

  const getCompletedCourses = () => enrolledCourses.filter(course => {
      const endDate = new Date(course.ENDDATE);
      return endDate < new Date();
    });

  const getOngoingCourses = () => enrolledCourses.filter(course => {
      const now = new Date();
      const startDate = new Date(course.STARTDATE);
      const endDate = new Date(course.ENDDATE);
      return startDate <= now && endDate >= now;
    });

  const getUpcomingCourses = () => enrolledCourses.filter(course => {
      const startDate = new Date(course.STARTDATE);
      return startDate > new Date();
    });

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading your profile...</div>
        </DashboardContent>
      </>
    );
  }

  const gpa = calculateGPA();
  const completedCourses = getCompletedCourses();
  const ongoingCourses = getOngoingCourses();
  const upcomingCourses = getUpcomingCourses();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="My Profile"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Student', href: paths.dashboard.student.courses },
            { name: 'My Profile' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Avatar
                  sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                >
                  <Typography variant="h4">
                    {user?.FIRSTNAME?.[0]}{user?.LASTNAME?.[0]}
                  </Typography>
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {user?.FIRSTNAME} {user?.LASTNAME}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Student ID: {user?.UID}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Email: {user?.EMAIL}
                  </Typography>
                  <Chip 
                    label="Student" 
                    color="success" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Academic Statistics */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {gpa}
              </Typography>
              <Typography variant="h6" gutterBottom>
                GPA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedCourses.filter(c => c.enrollment.FINAL_GRADE).length} graded courses
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {completedCourses.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Completed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Courses finished
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                {ongoingCourses.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Ongoing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently enrolled
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {upcomingCourses.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Upcoming
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Future courses
              </Typography>
            </Card>
          </Grid>

          {/* Enrollment History */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Enrollment History
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Enrollment Date</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Final Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrolledCourses.map((course) => {
                      const courseStatus = getCourseStatus(course);
                      const grade = course.enrollment.FINAL_GRADE;
                      
                      return (
                        <TableRow key={course.COURSEID}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {course.TITLE}
                            </Typography>
                          </TableCell>
                          <TableCell>{course.LOCATION}</TableCell>
                          <TableCell>
                            <Chip 
                              label={courseStatus.label} 
                              color={courseStatus.color} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{formatDate(course.enrollment.ENROLL_DATE)}</TableCell>
                          <TableCell>{formatDate(course.STARTDATE)}</TableCell>
                          <TableCell>{formatDate(course.ENDDATE)}</TableCell>
                          <TableCell>
                            {grade ? `${grade}%` : 'Pending'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Course Progress */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Course Progress
            </Typography>
          </Grid>
          
          {enrolledCourses.map((course) => {
            const courseStatus = getCourseStatus(course);
            const grade = course.enrollment.FINAL_GRADE;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={course.COURSEID}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {course.TITLE}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip 
                          label={courseStatus.label} 
                          color={courseStatus.color} 
                          size="small" 
                        />
                        {grade && (
                          <Chip 
                            label={`${grade}%`} 
                            color="primary" 
                            size="small" 
                          />
                        )}
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Location:</strong> {course.LOCATION}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Enrolled:</strong> {formatDate(course.enrollment.ENROLL_DATE)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Duration:</strong> {formatDate(course.STARTDATE)} - {formatDate(course.ENDDATE)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Status:</strong> {course.enrollment.STATUS}
                      </Typography>
                      {grade && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Final Grade:</strong> {grade}%
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DashboardContent>
    </>
  );
}
