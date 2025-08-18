import { useState, useEffect, useCallback } from 'react';

import { Box, Tab, Card, Chip, Grid, Tabs, Alert, Stack, Button, Dialog, Divider, Typography, IconButton, DialogTitle, DialogActions, DialogContent } from '@mui/material';

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
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!user?.UID) return;

    try {
      setLoading(true);
      // Get all courses first
      const coursesResponse = await axios.get(endpoints.courses.list);
      const allCoursesData = coursesResponse.data.courses || [];

      // Get user's enrollments
      const enrollments = [];
      const availableCourses = [];
      
      for (const course of allCoursesData) {
        try {
          const enrollmentResponse = await axios.get(endpoints.courses.students(course.COURSEID));
          const students = enrollmentResponse.data.students || [];
          const userEnrollment = students.find(student => student.UID === user.UID);
          
          if (userEnrollment) {
            enrollments.push({
              ...course,
              enrollment: userEnrollment,
            });
          } else {
            availableCourses.push(course);
          }
        } catch (error) {
          console.error(`Error fetching enrollment for course ${course.COURSEID}:`, error);
          // If we can't fetch enrollment, assume course is available
          availableCourses.push(course);
        }
      }

      setEnrolledCourses(enrollments);
      setAllCourses(availableCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.UID]);

  useEffect(() => {
    if (authenticated && user?.UID) {
      fetchCourses();
    }
  }, [authenticated, user?.UID, fetchCourses]);

  const handleEnrollCourse = async () => {
    if (!enrollingCourse || !user?.UID) return;
    
    setEnrolling(true);
    try {
      await axios.post(endpoints.courses.enroll(enrollingCourse.COURSEID, user.UID));
      
      // Refresh courses after enrollment
      await fetchCourses();
      setEnrollDialogOpen(false);
      setEnrollingCourse(null);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleOpenEnrollDialog = (course) => {
    setEnrollingCourse(course);
    setEnrollDialogOpen(true);
  };

  const handleCloseEnrollDialog = () => {
    setEnrollDialogOpen(false);
    setEnrollingCourse(null);
  };

  const handleOpenInfoDialog = (course) => {
    setSelectedCourse(course);
    setInfoDialogOpen(true);
  };

  const handleCloseInfoDialog = () => {
    setInfoDialogOpen(false);
    setSelectedCourse(null);
  };

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

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label={`Enrolled Courses (${enrolledCourses.length})`} />
            <Tab label={`Available Courses (${allCourses.length})`} />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <>
            {enrolledCourses.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You are not enrolled in any courses yet.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Switch to the &ldquo;Available Courses&rdquo; tab to enroll in courses.
                </Typography>
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

                {/* Enrolled Course Cards */}
                {enrolledCourses.map((course) => {
                  const courseStatus = getCourseStatus(course);
                  const enrollmentStatus = getEnrollmentStatus(course.enrollment);

                  return (
                    <Grid item xs={12} md={6} lg={4} key={course.COURSEID}>
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
                          {/* Course Title and Status */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
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
                            <IconButton
                              size="small"
                              onClick={() => handleOpenInfoDialog(course)}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' }
                              }}
                            >
                              <Iconify icon="eva:info-fill" />
                            </IconButton>
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
          </>
        )}

        {currentTab === 1 && (
          <>
            {allCourses.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No available courses to enroll in.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  All courses are either full or not available for enrollment.
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {allCourses.map((course) => {
                  const courseStatus = getCourseStatus(course);

                  return (
                    <Grid item xs={12} md={6} lg={4} key={course.COURSEID}>
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
                          {/* Course Title and Status */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                {course.TITLE}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                  label={courseStatus.label}
                                  color={courseStatus.color}
                                  size="small"
                                />
                              </Stack>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenInfoDialog(course)}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' }
                              }}
                            >
                              <Iconify icon="eva:info-fill" />
                            </IconButton>
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
                            {course.INSTRUCTOR_NAMES && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>Instructor:</strong> {course.INSTRUCTOR_NAMES}
                              </Typography>
                            )}
                          </Box>

                          {/* Actions */}
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Iconify icon="eva:plus-fill" />}
                              onClick={() => handleOpenEnrollDialog(course)}
                            >
                              Enroll
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="eva:info-fill" />}
                              onClick={() => handleOpenInfoDialog(course)}
                            >
                              Details
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}

        {/* Enrollment Confirmation Dialog */}
        <Dialog open={enrollDialogOpen} onClose={handleCloseEnrollDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Enroll in Course
          </DialogTitle>
          <DialogContent>
            {enrollingCourse && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {enrollingCourse.TITLE}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Location:</strong> {enrollingCourse.LOCATION}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Duration:</strong> {formatDate(enrollingCourse.STARTDATE)} - {formatDate(enrollingCourse.ENDDATE)}
                </Typography>
                {enrollingCourse.INSTRUCTOR_NAMES && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Instructor:</strong> {enrollingCourse.INSTRUCTOR_NAMES}
                  </Typography>
                )}
                <Alert severity="info" sx={{ mt: 2 }}>
                  You will be enrolled as an active student in this course.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEnrollDialog} disabled={enrolling}>
              Cancel
            </Button>
            <Button 
              onClick={handleEnrollCourse} 
              variant="contained" 
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Course Information Dialog */}
        <Dialog open={infoDialogOpen} onClose={handleCloseInfoDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Course Information
          </DialogTitle>
          <DialogContent>
            {selectedCourse && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h5" gutterBottom color="primary">
                  {selectedCourse.TITLE}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Course Details
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Course ID:</strong> {selectedCourse.COURSEID}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {selectedCourse.LOCATION}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Start Date:</strong> {formatDate(selectedCourse.STARTDATE)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>End Date:</strong> {formatDate(selectedCourse.ENDDATE)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> {getCourseStatus(selectedCourse).label}
                      </Typography>
                    </Stack>
                  </Grid>

                  {/* Instructor Information */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Instructor Information
                    </Typography>
                    <Stack spacing={1}>
                      {selectedCourse.INSTRUCTOR_NAMES ? (
                        <>
                          <Typography variant="body2">
                            <strong>Name:</strong> {selectedCourse.INSTRUCTOR_NAMES}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {selectedCourse.INSTRUCTOR_EMAIL || 'Contact admin for email'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Contact:</strong> {selectedCourse.INSTRUCTOR_PHONE || 'Contact admin for phone'}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Instructor information not available
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  {/* Enrollment Information (for enrolled courses) */}
                  {selectedCourse.enrollment && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Enrollment Information
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Enrollment Date:</strong> {formatDate(selectedCourse.enrollment.ENROLL_DATE)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Enrollment Status:</strong> {getEnrollmentStatus(selectedCourse.enrollment).label}
                        </Typography>
                        {selectedCourse.enrollment.FINAL_GRADE && (
                          <Typography variant="body2">
                            <strong>Final Grade:</strong> {selectedCourse.enrollment.FINAL_GRADE}%
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  )}

                  {/* Course Description */}
                  {selectedCourse.DESCRIPTION && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Course Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourse.DESCRIPTION}
                      </Typography>
                    </Grid>
                  )}

                  {/* Additional Information */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Additional Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Maximum Capacity:</strong> {selectedCourse.MAX_CAPACITY || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Credits:</strong> {selectedCourse.CREDITS || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Prerequisites:</strong> {selectedCourse.PREREQUISITES || 'None'}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInfoDialog}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardContent>
    </>
  );
}
