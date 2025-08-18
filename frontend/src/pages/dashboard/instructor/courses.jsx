import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card, 
  Chip, 
  Grid, 
  Paper, 
  Stack, 
  Table, 
  Avatar, 
  Button, 
  Dialog, 
  Tooltip, 
  TableRow, 
  TableBody, 
  TableCell, 
  TableHead, 
  TextField, 
  IconButton, 
  Typography, 
  DialogTitle, 
  DialogActions,
  DialogContent, 
  TableContainer
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `My Courses | Instructor Dashboard - ${CONFIG.appName}` };

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [courseSchedules, setCourseSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [updatingGrade, setUpdatingGrade] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);

  const fetchTeachingCourses = useCallback(async () => {
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

      // Fetch schedules for all teaching courses
      const schedulesMap = {};
      for (const course of teaching) {
        try {
          const scheduleResponse = await axios.get(endpoints.courses.schedule(course.COURSEID));
          schedulesMap[course.COURSEID] = scheduleResponse.data.schedule || [];
        } catch (error) {
          console.error(`Error fetching schedule for course ${course.COURSEID}:`, error);
          schedulesMap[course.COURSEID] = [];
        }
      }
      setCourseSchedules(schedulesMap);
    } catch (error) {
      console.error('Error fetching teaching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.UID, user?.FIRSTNAME, user?.LASTNAME]);

  useEffect(() => {
    if (authenticated && user?.UID) {
      fetchTeachingCourses();
    }
  }, [authenticated, user?.UID, fetchTeachingCourses]);

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

  const formatTimeUserFriendly = (timeString) => {
    if (!timeString) return 'TBD';
    const time = new Date(`2000-01-01T${timeString}`);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const shortenWeekday = (weekday) => {
    const shortNames = {
      'Monday': 'Mon',
      'Tuesday': 'Tue', 
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return shortNames[weekday] || weekday;
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

  const handleOpenStudentDialog = async (course) => {
    setSelectedCourse(course);
    setStudentDialogOpen(true);
    setLoadingStudents(true);
    
    try {
      const response = await axios.get(endpoints.courses.students(course.COURSEID));
      setCourseStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setCourseStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCloseStudentDialog = () => {
    setStudentDialogOpen(false);
    setSelectedCourse(null);
    setCourseStudents([]);
  };

  const handleOpenGradeDialog = (student) => {
    setSelectedStudent(student);
    setNewGrade(student.FINAL_GRADE || '');
    setGradeDialogOpen(true);
  };

  const handleCloseGradeDialog = () => {
    setGradeDialogOpen(false);
    setSelectedStudent(null);
    setNewGrade('');
  };

  const handleUpdateGrade = async () => {
    if (!selectedStudent || !newGrade) return;
    
    setUpdatingGrade(true);
    try {
      await axios.put(endpoints.courses.updateGrade(selectedCourse.COURSEID, selectedStudent.UID), {
        finalGrade: parseFloat(newGrade)
      });
      
      // Update the student in the local state
      setCourseStudents(prev => prev.map(student => 
        student.UID === selectedStudent.UID 
          ? { ...student, FINAL_GRADE: parseFloat(newGrade) }
          : student
      ));
      
      handleCloseGradeDialog();
    } catch (error) {
      console.error('Error updating grade:', error);
    } finally {
      setUpdatingGrade(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!selectedCourse) return;
    
    setDeletingStudent(true);
    try {
      await axios.delete(endpoints.courses.removeStudent(selectedCourse.COURSEID, student.UID));
      
      // Remove the student from the local state
      setCourseStudents(prev => prev.filter(s => s.UID !== student.UID));
    } catch (error) {
      console.error('Error removing student:', error);
    } finally {
      setDeletingStudent(false);
    }
  };

  // Create weekly schedule grid
  const createWeeklySchedule = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
    
    // Create a list of courses with their positioning data
    const courseBlocks = [];
    
    // Process each course schedule
    teachingCourses.forEach(course => {
      const courseSchedule = courseSchedules[course.COURSEID] || [];
      courseSchedule.forEach(scheduleItem => {
        const day = scheduleItem.WEEKDAY;
        const startTime = scheduleItem.START_TIME;
        const endTime = scheduleItem.END_TIME;
        
        if (weekdays.includes(day)) {
          // Convert times to comparable format (minutes since midnight)
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTime);
          
          // Find the grid positions
          const dayIndex = weekdays.indexOf(day);
          const startSlotIndex = timeSlots.findIndex(slot => timeToMinutes(slot) >= startMinutes);
          const endSlotIndex = timeSlots.findIndex(slot => timeToMinutes(slot) >= endMinutes);
          
          // Calculate grid positioning
          const gridColumn = dayIndex + 2; // +2 because first column is time labels
          const gridRowStart = startSlotIndex + 2; // +2 because first row is day headers
          const gridRowEnd = endSlotIndex > -1 ? endSlotIndex + 2 : timeSlots.length + 2;
          
          courseBlocks.push({
            course,
            scheduleItem,
            startTime,
            endTime,
            day,
            dayIndex,
            gridColumn,
            gridRowStart,
            gridRowEnd,
            startMinutes,
            endMinutes
          });
        }
      });
    });

    return { weekdays, timeSlots, courseBlocks };
  };

  const { weekdays, timeSlots, courseBlocks } = createWeeklySchedule();



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
            { name: 'Instructor', href: paths.dashboard.instructor.courses },
            { name: 'My Courses' },
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
        ) : (
          <>
            {/* Weekly Schedule Grid */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Schedule
                </Typography>
                
                {/* Weekly Schedule Grid */}
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: '80px repeat(7, 1fr)',
                  gridTemplateRows: 'auto repeat(14, 60px)',
                  gap: 0,
                  mt: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Header Row */}
                  <Box sx={{
                    gridColumn: '1',
                    gridRow: '1',
                    backgroundColor: '#f5f5f5',
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    Time
                  </Box>
                  
                  {weekdays.map((day, index) => (
                    <Box key={day} sx={{
                      gridColumn: `${index + 2}`,
                      gridRow: '1',
                      backgroundColor: '#f5f5f5',
                      borderBottom: '1px solid #e0e0e0',
                      borderRight: '1px solid #e0e0e0',
                      p: 1,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {shortenWeekday(day)}
                    </Box>
                  ))}
                  
                  {/* Time Labels */}
                  {timeSlots.map((time, timeIndex) => (
                    <Box key={time} sx={{
                      gridColumn: '1',
                      gridRow: `${timeIndex + 2}`,
                      backgroundColor: '#f9f9f9',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #e0e0e0',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}>
                      {formatTimeUserFriendly(time)}
                    </Box>
                  ))}
                  
                  {/* Grid Cells Background */}
                  {timeSlots.map((time, timeIndex) => 
                    weekdays.map((day, dayIndex) => (
                      <Box key={`${day}-${time}`} sx={{
                        gridColumn: `${dayIndex + 2}`,
                        gridRow: `${timeIndex + 2}`,
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: timeIndex % 2 === 0 ? '#ffffff' : '#fafafa'
                      }} />
                    ))
                  )}
                  
                  {/* Course Blocks */}
                  {courseBlocks.map((block, index) => {
                    const status = getCourseStatus(block.course);
                    
                    return (
                      <Box
                        key={`${block.course.COURSEID}-${index}`}
                        sx={{
                          gridColumn: block.gridColumn,
                          gridRow: `${block.gridRowStart} / ${block.gridRowEnd}`,
                          backgroundColor: status.color === 'success' ? 'success.light' : 
                                         status.color === 'info' ? 'info.light' : 'grey.100',
                          border: `2px solid ${status.color === 'success' ? 'success.main' : 
                                             status.color === 'info' ? 'info.main' : 'grey.300'}`,
                          borderRadius: 1,
                          p: 1,
                          m: 0.5,
                          fontSize: '0.7rem',
                          lineHeight: 1.1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          zIndex: 1,
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transform: 'translateY(-1px)',
                            zIndex: 2
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ 
                          fontWeight: 'bold', 
                          display: 'block', 
                          textAlign: 'center',
                          fontSize: '0.65rem',
                          mb: 0.5
                        }}>
                          {block.course.TITLE}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          textAlign: 'center',
                          fontSize: '0.6rem',
                          opacity: 0.8,
                          mb: 0.5
                        }}>
                          {formatTimeUserFriendly(block.startTime)} - {formatTimeUserFriendly(block.endTime)}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          textAlign: 'center',
                          fontSize: '0.6rem',
                          opacity: 0.7
                        }}>
                          {block.course.LOCATION}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Course Cards */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {teachingCourses.map((course) => {
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
                        </Stack>
                      </Box>
                      
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
                          <strong>Schedule:</strong>
                        </Typography>
                        {courseSchedules[course.COURSEID] && courseSchedules[course.COURSEID].length > 0 ? (
                          courseSchedules[course.COURSEID].map((scheduleItem, index) => (
                            <Typography key={index} variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                              {shortenWeekday(scheduleItem.WEEKDAY)}: {formatTimeUserFriendly(scheduleItem.START_TIME)} - {formatTimeUserFriendly(scheduleItem.END_TIME)}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                            No schedule set
                          </Typography>
                        )}
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:people-fill" />}
                          onClick={() => handleOpenStudentDialog(course)}
                        >
                          Students
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:file-text-fill" />}
                          onClick={() => router.push(paths.dashboard.instructor.grades)}
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
          </>
        )}

        {/* Student Dialog */}
        <Dialog 
          open={studentDialogOpen} 
          onClose={handleCloseStudentDialog} 
          maxWidth="lg" 
          fullWidth
        >
          <DialogTitle>
            Students in {selectedCourse?.TITLE}
          </DialogTitle>
          <DialogContent>
            {loadingStudents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography>Loading students...</Typography>
              </Box>
            ) : courseStudents.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No students enrolled in this course yet.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students will appear here once they enroll.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Enrollment Status</TableCell>
                      <TableCell>Final Grade</TableCell>
                      <TableCell>Letter Grade</TableCell>
                      <TableCell>Enrollment Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseStudents.map((student) => {
                      const grade = student.FINAL_GRADE;
                      const gradeColor = getGradeColor(grade);
                      const letterGrade = getGradeLetter(grade);
                      
                      return (
                        <TableRow key={student.UID}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                <Typography variant="body2">
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
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Edit Grade">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenGradeDialog(student)}
                                  color="primary"
                                >
                                  <Iconify icon="eva:edit-fill" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove Student">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteStudent(student)}
                                  color="error"
                                  disabled={deletingStudent}
                                >
                                  <Iconify icon="eva:trash-2-fill" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStudentDialog}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Grade Editing Dialog */}
        <Dialog open={gradeDialogOpen} onClose={handleCloseGradeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Grade for {selectedStudent?.FIRSTNAME} {selectedStudent?.LASTNAME}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course: {selectedCourse?.TITLE}
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
