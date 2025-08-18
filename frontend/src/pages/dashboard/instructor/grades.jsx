import React, { useState, useEffect, useCallback } from 'react';

import { Box, Card, Chip, Grid, Paper, Table, Avatar, Button, Dialog, Tooltip, Collapse, TableRow, TableBody, TableCell, TableHead, TextField, IconButton, Typography, DialogTitle, DialogActions, DialogContent, LinearProgress, TableContainer, TableSortLabel, InputAdornment } from '@mui/material';

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
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const getCourseStatus = (course) => {
    const now = new Date();
    const startDate = new Date(course.STARTDATE);
    const endDate = new Date(course.ENDDATE);
    if (startDate > now) { return { label: 'Upcoming', color: 'info' }; }
    else if (startDate <= now && endDate >= now) { return { label: 'Ongoing', color: 'success' }; }
    else { return { label: 'Completed', color: 'default' }; }
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

  const handleToggleExpanded = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleFilterByStatus = (event) => {
    setFilterStatus(event.target.value);
  };

  const applyFilter = (students) => {
    let filteredStudents = students;

    // Filter by name
    if (filterName) {
      filteredStudents = filteredStudents.filter(student => 
        `${student.FIRSTNAME} ${student.LASTNAME}`.toLowerCase().includes(filterName.toLowerCase()) ||
        student.EMAIL.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filteredStudents = filteredStudents.filter(student => 
        student.STATUS.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Sort
    if (orderBy) {
      filteredStudents.sort((a, b) => {
        let aValue, bValue;
        
        switch (orderBy) {
          case 'name':
            aValue = `${a.FIRSTNAME} ${a.LASTNAME}`.toLowerCase();
            bValue = `${b.FIRSTNAME} ${b.LASTNAME}`.toLowerCase();
            break;
          case 'email':
            aValue = a.EMAIL.toLowerCase();
            bValue = b.EMAIL.toLowerCase();
            break;
          case 'status':
            aValue = a.STATUS.toLowerCase();
            bValue = b.STATUS.toLowerCase();
            break;
          case 'grade':
            aValue = a.FINAL_GRADE || 0;
            bValue = b.FINAL_GRADE || 0;
            break;
          case 'enrollDate':
            aValue = new Date(a.ENROLL_DATE);
            bValue = new Date(b.ENROLL_DATE);
            break;
          default:
            return 0;
        }

        if (order === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filteredStudents;
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
                  borderColor: 'warning.main'
                }
              }}>
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

            {/* Course List with Expandable Student Details */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Course Grades Overview
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ minWidth: 1200 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Students</TableCell>
                        <TableCell>Class Average</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teachingCourses.map((course) => {
                        const courseStatus = getCourseStatus(course);
                        const courseStudentList = courseStudents.filter(student => student.courseId === course.COURSEID);
                        const courseGrades = courseStudentList.filter(student => student.FINAL_GRADE != null && !isNaN(student.FINAL_GRADE));
                        const averageCourseGrade = courseGrades.length > 0 
                          ? (courseGrades.reduce((sum, student) => sum + parseFloat(student.FINAL_GRADE), 0) / courseGrades.length).toFixed(2)
                          : 0;
                        const isExpanded = expandedCourse === course.COURSEID;
                        
                        return (
                          <React.Fragment key={course.COURSEID}>
                            <TableRow 
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                              onClick={() => handleToggleExpanded(course.COURSEID)}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleExpanded(course.COURSEID);
                                    }}
                                  >
                                    <Iconify 
                                      icon={isExpanded ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"} 
                                    />
                                  </IconButton>
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {course.TITLE}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {course.LOCATION}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={courseStatus.label} 
                                  color={courseStatus.color} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {courseStudentList.length} students
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {averageCourseGrade > 0 ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {averageCourseGrade}%
                                    </Typography>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={parseFloat(averageCourseGrade)} 
                                      color={getGradeColor(averageCourseGrade)}
                                      sx={{ width: 60, height: 6, borderRadius: 3 }}
                                    />
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No grades yet
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleExpanded(course.COURSEID);
                                    }}
                                  >
                                    <Iconify 
                                      icon={isExpanded ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} 
                                    />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Student Details */}
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ margin: 2 }}>
                                    {/* Filter Controls */}
                                    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                      <TextField
                                        placeholder="Search by name or email..."
                                        value={filterName}
                                        onChange={handleFilterByName}
                                        InputProps={{
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <Iconify icon="eva:search-fill" />
                                            </InputAdornment>
                                          ),
                                        }}
                                        sx={{ minWidth: 300 }}
                                      />
                                      <TextField
                                        select
                                        label="Status"
                                        value={filterStatus}
                                        onChange={handleFilterByStatus}
                                        sx={{ minWidth: 150 }}
                                      >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="withdrawn">Withdrawn</option>
                                        <option value="failed">Failed</option>
                                      </TextField>
                                    </Box>
                                    
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, width: '100%' }}>
                                      <Table size="small" stickyHeader>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>
                                              <TableSortLabel
                                                active={orderBy === 'name'}
                                                direction={orderBy === 'name' ? order : 'asc'}
                                                onClick={(event) => handleRequestSort(event, 'name')}
                                              >
                                                Student
                                              </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                              <TableSortLabel
                                                active={orderBy === 'email'}
                                                direction={orderBy === 'email' ? order : 'asc'}
                                                onClick={(event) => handleRequestSort(event, 'email')}
                                              >
                                                Email
                                              </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                              <TableSortLabel
                                                active={orderBy === 'status'}
                                                direction={orderBy === 'status' ? order : 'asc'}
                                                onClick={(event) => handleRequestSort(event, 'status')}
                                              >
                                                Enrollment Status
                                              </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                              <TableSortLabel
                                                active={orderBy === 'grade'}
                                                direction={orderBy === 'grade' ? order : 'asc'}
                                                onClick={(event) => handleRequestSort(event, 'grade')}
                                              >
                                                Final Grade
                                              </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Letter Grade</TableCell>
                                            <TableCell>
                                              <TableSortLabel
                                                active={orderBy === 'enrollDate'}
                                                direction={orderBy === 'enrollDate' ? order : 'asc'}
                                                onClick={(event) => handleRequestSort(event, 'enrollDate')}
                                              >
                                                Enrollment Date
                                              </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Actions</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {applyFilter(courseStudentList).map((student) => {
                                            const grade = student.FINAL_GRADE;
                                            const gradeColor = getGradeColor(grade);
                                            const letterGrade = getGradeLetter(grade);
                                            
                                            return (
                                              <TableRow key={`${student.UID}-${student.courseId}`}>
                                                <TableCell>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                      <Typography variant="caption">
                                                        {student.FIRSTNAME?.[0]}{student.LASTNAME?.[0]}
                                                      </Typography>
                                                    </Avatar>
                                                    <Box>
                                                      <Typography variant="subtitle2">
                                                        {student.FIRSTNAME} {student.LASTNAME}
                                                      </Typography>
                                                      <Typography variant="body2" color="text.secondary">
                                                        ID: {student.UID}
                                                      </Typography>
                                                    </Box>
                                                  </Box>
                                                </TableCell>
                                                <TableCell>
                                                  <Typography variant="body2">
                                                    {student.EMAIL}
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
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>


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
