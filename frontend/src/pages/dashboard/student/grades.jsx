import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Grid, Chip, Paper, Table, TableRow, TableBody, TableCell, TableHead, Typography, TableContainer, LinearProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `My Grades | Student Dashboard - ${CONFIG.appName}` };

export default function StudentGradesPage() {
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

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'warning';
    return 'error';
  };

  const getGradeLetter = (grade) => {
    if (!grade) return 'N/A';
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
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

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading your grades...</div>
        </DashboardContent>
      </>
    );
  }

  const gpa = calculateGPA();
  const completedCourses = getCompletedCourses();
  const ongoingCourses = getOngoingCourses();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="My Grades"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Student', href: paths.dashboard.student.courses },
            { name: 'My Grades' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {enrolledCourses.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You are not enrolled in any courses yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Contact an administrator to enroll you in courses.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Grade Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 3, 
                textAlign: 'center',
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
                <Typography variant="h4" color="primary" gutterBottom>
                  {gpa}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  GPA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completedCourses.length} completed courses
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 3, 
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'success.main'
                }
              }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {completedCourses.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Completed Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completedCourses.filter(c => c.enrollment.FINAL_GRADE).length} with grades
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 3, 
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'info.main'
                }
              }}>
                <Typography variant="h4" color="info.main" gutterBottom>
                  {ongoingCourses.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Ongoing Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently enrolled
                </Typography>
              </Card>
            </Grid>

            {/* Grades Table */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Course Grades
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Final Grade</TableCell>
                        <TableCell>Letter Grade</TableCell>
                        <TableCell>Enrollment Date</TableCell>
                        <TableCell>Completion Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrolledCourses.map((course) => {
                        const courseStatus = getCourseStatus(course);
                        const grade = course.enrollment.FINAL_GRADE;
                        const gradeColor = getGradeColor(grade);
                        const letterGrade = getGradeLetter(grade);
                        
                        return (
                          <TableRow key={course.COURSEID}>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {course.TITLE}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {course.LOCATION}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={courseStatus.label} 
                                color={courseStatus.color} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              {grade ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    {grade}%
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={grade} 
                                    color={gradeColor}
                                    sx={{ width: 60, height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Pending
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {grade ? (
                                <Chip 
                                  label={letterGrade} 
                                  color={gradeColor} 
                                  size="small" 
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatDate(course.enrollment.ENROLL_DATE)}
                            </TableCell>
                            <TableCell>
                              {courseStatus.label === 'Completed' ? formatDate(course.ENDDATE) : 'Ongoing'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        )}
      </DashboardContent>
    </>
  );
}
