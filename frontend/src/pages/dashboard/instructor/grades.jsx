import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Chip, Grid, Paper, Stack, Table, Button, Dialog, Tooltip, TableRow, TableBody, TableCell, TableHead, TextField, IconButton, Typography, DialogTitle, DialogActions, DialogContent, LinearProgress, TableContainer } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `Grade Management | Instructor Dashboard - ${CONFIG.appName}` };

export default function InstructorGradesPage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [updatingGrade, setUpdatingGrade] = useState(false);

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

      // Fetch students and their grades for each teaching course
      const studentsWithGrades = [];
      for (const course of teaching) {
        try {
          const enrollmentResponse = await axios.get(endpoints.courses.students(course.COURSEID));
          const students = enrollmentResponse.data.students || [];
          students.forEach(student => {
            studentsWithGrades.push({
              ...student,
              courseId: course.COURSEID,
              courseTitle: course.TITLE,
              courseLocation: course.LOCATION,
              courseStartDate: course.STARTDATE,
              courseEndDate: course.ENDDATE
            });
          });
        } catch (error) {
          console.error(`Error fetching students for course ${course.COURSEID}:`, error);
        }
      }
      
      setCourseStudents(studentsWithGrades);
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

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

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

  const getEnrollmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'withdrawn': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const calculateAverageGrade = () => {
    const studentsWithGrades = courseStudents.filter(student => student.FINAL_GRADE != null && !isNaN(student.FINAL_GRADE));
    if (studentsWithGrades.length === 0) return 0;
    
    const totalGrade = studentsWithGrades.reduce((sum, student) => sum + parseFloat(student.FINAL_GRADE), 0);
    return (totalGrade / studentsWithGrades.length).toFixed(2);
  };

  const getStudentsWithGrades = () => courseStudents.filter(student => student.FINAL_GRADE != null && !isNaN(student.FINAL_GRADE));

  const getStudentsWithoutGrades = () => courseStudents.filter(student => student.FINAL_GRADE == null || isNaN(student.FINAL_GRADE));

  const handleOpenGradeDialog = (student) => {
    setSelectedStudent(student);
    setNewGrade(student.FINAL_GRADE ? student.FINAL_GRADE.toString() : '');
    setGradeDialogOpen(true);
  };

  const handleCloseGradeDialog = () => {
    setGradeDialogOpen(false);
    setSelectedStudent(null);
    setNewGrade('');
  };

  const handleUpdateGrade = async () => {
    if (!selectedStudent || !newGrade) return;
    
    const gradeValue = parseFloat(newGrade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }

    try {
      setUpdatingGrade(true);
      await axios.patch(endpoints.courses.updateEnrollment(selectedStudent.courseId, selectedStudent.UID), {
        FINAL_GRADE: gradeValue
      });
      
      // Update the local state
      setCourseStudents(prev => prev.map(student => 
        student.UID === selectedStudent.UID && student.courseId === selectedStudent.courseId
          ? { ...student, FINAL_GRADE: gradeValue }
          : student
      ));
      
      handleCloseGradeDialog();
    } catch (error) {
      console.error('Error updating grade:', error);
      alert('Failed to update grade. Please try again.');
    } finally {
      setUpdatingGrade(false);
    }
  };

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading grade management...</div>
        </DashboardContent>
      </>
    );
  }

  const averageGrade = calculateAverageGrade();
  const studentsWithGrades = getStudentsWithGrades();
  const studentsWithoutGrades = getStudentsWithoutGrades();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="Grade Management"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Instructor', href: paths.dashboard.instructor.courses },
            { name: 'Grade Management' },
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
        ) : courseStudents.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No students are enrolled in your courses yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Students will appear here once they enroll in your courses.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Statistics Cards */}
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {averageGrade}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Average Grade
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all students
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {courseStudents.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enrolled in courses
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" gutterBottom>
                  {studentsWithGrades.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Graded Students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With final grades
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {studentsWithoutGrades.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Pending Grades
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Need grading
                </Typography>
              </Card>
            </Grid>

            {/* Grades Table */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Student Grades
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Enrollment Status</TableCell>
                        <TableCell>Final Grade</TableCell>
                        <TableCell>Letter Grade</TableCell>
                        <TableCell>Enrollment Date</TableCell>
                        <TableCell>Course Duration</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseStudents.map((student) => {
                        const grade = student.FINAL_GRADE;
                        const gradeColor = getGradeColor(grade);
                        const letterGrade = getGradeLetter(grade);
                        
                        return (
                          <TableRow key={`${student.UID}-${student.courseId}`}>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {student.FIRSTNAME} {student.LASTNAME}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {student.EMAIL}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {student.courseTitle}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {student.courseLocation}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={student.STATUS} 
                                color={getEnrollmentStatusColor(student.STATUS)} 
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
                              {formatDate(student.ENROLL_DATE)}
                            </TableCell>
                            <TableCell>
                              {formatDate(student.courseStartDate)} - {formatDate(student.courseEndDate)}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Edit Grade">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenGradeDialog(student)}
                                  color="primary"
                                >
                                  <Iconify icon="eva:edit-fill" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Grade Distribution by Course */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Grade Distribution by Course
              </Typography>
            </Grid>
            
            {teachingCourses.map((course) => {
              const courseStudentList = courseStudents.filter(student => student.courseId === course.COURSEID);
              const courseGrades = courseStudentList.filter(student => student.FINAL_GRADE != null && !isNaN(student.FINAL_GRADE));
              const averageCourseGrade = courseGrades.length > 0 
                ? (courseGrades.reduce((sum, student) => sum + parseFloat(student.FINAL_GRADE), 0) / courseGrades.length).toFixed(2)
                : 0;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={course.COURSEID}>
                  <Card sx={{ p: 3, height: '100%' }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {course.TITLE}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {course.LOCATION}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Total Students:</strong> {courseStudentList.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Graded Students:</strong> {courseGrades.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Average Grade:</strong> {averageCourseGrade}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Duration:</strong> {formatDate(course.STARTDATE)} - {formatDate(course.ENDDATE)}
                        </Typography>
                      </Box>

                      {courseGrades.length > 0 && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Grade Distribution
                          </Typography>
                          <Stack spacing={1}>
                            {courseGrades.map((student) => (
                              <Box key={student.UID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">
                                  {student.FIRSTNAME} {student.LASTNAME}
                                </Typography>
                                <Chip
                                  label={`${student.FINAL_GRADE}% (${getGradeLetter(student.FINAL_GRADE)})`}
                                  color={getGradeColor(student.FINAL_GRADE)}
                                  size="small"
                                />
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Grade Editing Dialog */}
        <Dialog open={gradeDialogOpen} onClose={handleCloseGradeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Grade for {selectedStudent?.FIRSTNAME} {selectedStudent?.LASTNAME}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course: {selectedStudent?.courseTitle}
              </Typography>
              <TextField
                fullWidth
                label="Final Grade (%)"
                type="number"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGradeDialog} disabled={updatingGrade}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateGrade} 
              variant="contained" 
              disabled={updatingGrade || !newGrade}
            >
              {updatingGrade ? 'Updating...' : 'Update Grade'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardContent>
    </>
  );
}
