import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Grid, Chip, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `My Schedule | Student Dashboard - ${CONFIG.appName}` };

export default function StudentSchedulePage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseSchedules, setCourseSchedules] = useState({});
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

      const schedulesMap = {};
      for (const course of enrollments) {
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

  // Create weekly schedule grid
  const createWeeklySchedule = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
    
    // Create a list of courses with their positioning data
    const courseBlocks = [];
    
    // Process each course schedule
    enrolledCourses.forEach(course => {
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
          <div>Loading your schedule...</div>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="My Schedule"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Student', href: paths.dashboard.student.courses },
            { name: 'My Schedule' },
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
            {/* Statistics Cards */}
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

            {/* Weekly Schedule Grid */}
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

            {/* Course Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {enrolledCourses.map((course) => {
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
                          {course.INSTRUCTOR_NAMES && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Instructor:</strong> {course.INSTRUCTOR_NAMES}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        )}
      </DashboardContent>
    </>
  );
}
