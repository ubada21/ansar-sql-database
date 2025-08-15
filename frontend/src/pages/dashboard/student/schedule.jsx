import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Grid, Chip, Stack, Paper, Table, TableRow, TableBody, TableCell, TableHead, Typography, TableContainer } from '@mui/material';

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




  const createWeeklySchedule = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
    
    const schedule = {};
    

    weekdays.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(time => {
        schedule[day][time] = [];
      });
    });


    enrolledCourses.forEach(course => {
      const courseSchedule = courseSchedules[course.COURSEID] || [];
      courseSchedule.forEach(scheduleItem => {
        const day = scheduleItem.WEEKDAY;
        const startTime = scheduleItem.START_TIME;
        const endTime = scheduleItem.END_TIME;
        

        timeSlots.forEach(timeSlot => {
          if (timeSlot >= startTime && timeSlot < endTime) {
            if (!schedule[day][timeSlot]) {
              schedule[day][timeSlot] = [];
            }
            schedule[day][timeSlot].push({
              course,
              scheduleItem
            });
          }
        });
      });
    });

    return { weekdays, timeSlots, schedule };
  };

  const { weekdays, timeSlots, schedule } = createWeeklySchedule();

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
            {/* Weekly Schedule Grid */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Schedule
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
                  <Table stickyHeader sx={{ 
                    '& .MuiTableCell-root': {
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#fafafa'
                    },
                    '& .MuiTableHead-root .MuiTableCell-root': {
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      border: '1px solid #d0d0d0'
                    },
                    '& .MuiTableBody-root .MuiTableRow:nth-of-type(even) .MuiTableCell-root': {
                      backgroundColor: '#ffffff'
                    },
                    '& .MuiTableBody-root .MuiTableRow:nth-of-type(odd) .MuiTableCell-root': {
                      backgroundColor: '#f9f9f9'
                    }
                  }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 80 }}>Time</TableCell>
                        {weekdays.map((day) => (
                          <TableCell key={day} sx={{ minWidth: 120, textAlign: 'center' }}>
                            {day}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timeSlots.map((time) => (
                        <TableRow key={time}>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                            {formatTimeUserFriendly(time)}
                          </TableCell>
                          {weekdays.map((day) => {
                            const coursesInSlot = schedule[day][time] || [];
                            return (
                              <TableCell key={`${day}-${time}`} sx={{ p: 1 }}>
                                {coursesInSlot.map((item, index) => {
                                  const status = getCourseStatus(item.course);
                                  return (
                                    <Box
                                      key={`${item.course.COURSEID}-${index}`}
                                      sx={{
                                        p: 1,
                                        mb: 0.5,
                                        borderRadius: 1,
                                        backgroundColor: status.color === 'success' ? 'success.light' : 
                                                       status.color === 'info' ? 'info.light' : 'grey.100',
                                        border: `1px solid ${status.color === 'success' ? 'success.main' : 
                                                           status.color === 'info' ? 'info.main' : 'grey.300'}`,
                                        fontSize: '0.75rem',
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                        {item.course.TITLE}
                                      </Typography>
                                      <Typography variant="caption" sx={{ display: 'block' }}>
                                        {formatTimeUserFriendly(item.scheduleItem.START_TIME)} - {formatTimeUserFriendly(item.scheduleItem.END_TIME)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ display: 'block' }}>
                                        {item.course.LOCATION}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Course Schedule List */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Course Schedule Details
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Schedule</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Instructor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrolledCourses.map((course) => {
                        const courseStatus = getCourseStatus(course);
                        const courseSchedule = courseSchedules[course.COURSEID] || [];
                        return (
                          <TableRow key={course.COURSEID}>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {course.TITLE}
                              </Typography>
                            </TableCell>
                            <TableCell>{course.LOCATION}</TableCell>
                            <TableCell>
                              {courseSchedule.length > 0 ? (
                                <Stack spacing={0.5}>
                                  {courseSchedule.map((scheduleItem, index) => (
                                    <Typography key={index} variant="body2">
                                      {shortenWeekday(scheduleItem.WEEKDAY)}: {formatTimeUserFriendly(scheduleItem.START_TIME)} - {formatTimeUserFriendly(scheduleItem.END_TIME)}
                                    </Typography>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No schedule set
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={courseStatus.label} 
                                color={courseStatus.color} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              {course.INSTRUCTOR_NAME || 'TBD'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Course Details Cards */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Course Details
              </Typography>
            </Grid>
            
            {enrolledCourses.map((course) => {
              const courseStatus = getCourseStatus(course);
              return (
                <Grid item xs={12} md={6} lg={4} key={course.COURSEID}>
                  <Card sx={{ p: 3, height: '100%' }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {course.TITLE}
                        </Typography>
                        <Chip 
                          label={courseStatus.label} 
                          color={courseStatus.color} 
                          size="small" 
                        />
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
                        {course.INSTRUCTOR_NAME && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Instructor:</strong> {course.INSTRUCTOR_NAME}
                          </Typography>
                        )}
                      </Box>
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
