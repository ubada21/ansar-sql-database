import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Grid, Chip, Stack, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `My Courses | Student Dashboard - ${CONFIG.appName}` };

export default function StudentCoursesPage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!user?.UID) return;

    try {
      setLoading(true);
      // Get all courses first
      const coursesResponse = await axios.get(endpoints.courses.list);
      const allCourses = coursesResponse.data.courses || [];

      // Get user's enrollments
      const enrollments = [];
      for (const course of allCourses) {
        try {
          const enrollmentResponse = await axios.get(endpoints.courses.students(course.COURSEID));
          const students = enrollmentResponse.data.students || [];
          const userEnrollment = students.find(student => student.UID === user.UID);
          
          if (userEnrollment) {
            enrollments.push({
              ...course,
              enrollment: userEnrollment,
            });
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
    
    if (startDate > now) {
      return { label: 'Upcoming', color: 'info' };
    } else if (startDate <= now && endDate >= now) {
      return { label: 'Ongoing', color: 'success' };
    } else {
      return { label: 'Completed', color: 'default' };
    }
  };

  const getEnrollmentStatus = (enrollment) => {
    switch (enrollment.STATUS) {
      case 'active':
        return { label: 'Active', color: 'success' };
      case 'completed':
        return { label: 'Completed', color: 'primary' };
      case 'withdrawn':
        return { label: 'Withdrawn', color: 'warning' };
      case 'failed':
        return { label: 'Failed', color: 'error' };
      default:
        return { label: 'Unknown', color: 'default' };
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading your courses...</div>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>

      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="My Courses"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Student', href: paths.dashboard.student.courses },
            { name: 'My Courses' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {enrolledCourses.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You are not enrolled in any courses yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Contact an administrator to enroll you in courses.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(paths.dashboard.root)}
            >
              Back to Dashboard
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Statistics Cards */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" gutterBottom>
                  {enrolledCourses.filter(course => getCourseStatus(course).label === 'Upcoming').length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Upcoming Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Starting soon
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {enrolledCourses.filter(course => getCourseStatus(course).label === 'Ongoing').length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Ongoing Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently enrolled
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {enrolledCourses.filter(course => getCourseStatus(course).label === 'Completed').length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Completed Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Finished courses
                </Typography>
              </Card>
            </Grid>

            {/* Course Cards */}
            {enrolledCourses.map((course) => {
              const courseStatus = getCourseStatus(course);
              const enrollmentStatus = getEnrollmentStatus(course.enrollment);

              return (
                <Grid item xs={12} md={6} lg={4} key={course.COURSEID}>
                  <Card sx={{ p: 3, height: '100%' }}>
                    <Stack spacing={2}>
                      {/* Course Title and Status */}
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
                          <Chip
                            label={enrollmentStatus.label}
                            color={enrollmentStatus.color}
                            size="small"
                          />
                        </Stack>
                      </Box>

                      {/* Course Details */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Location:</strong> {course.LOCATION}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Start Date:</strong> {formatDate(course.STARTDATE)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>End Date:</strong> {formatDate(course.ENDDATE)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Enrolled:</strong> {formatDate(course.enrollment.ENROLL_DATE)}
                        </Typography>
                        {course.enrollment.FINAL_GRADE && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Grade:</strong> {course.enrollment.FINAL_GRADE}%
                          </Typography>
                        )}
                      </Box>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:calendar-fill" />}
                          onClick={() => router.push(paths.dashboard.student.schedule)}
                        >
                          Schedule
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:file-text-fill" />}
                          onClick={() => router.push(paths.dashboard.student.grades)}
                        >
                          Grades
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DashboardContent>
    </>
  );
}
