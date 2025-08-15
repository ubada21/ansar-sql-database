import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Grid, Chip, Stack, Paper, Table, Button, TableRow, TableBody, TableCell, TableHead, Typography, TableContainer } from '@mui/material';

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
    
    const schedule = {};
    
    // Initialize schedule grid
    weekdays.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(time => {
        schedule[day][time] = [];
      });
    });

    // Populate with course schedules
    teachingCourses.forEach(course => {
      const courseSchedule = courseSchedules[course.COURSEID] || [];
      courseSchedule.forEach(scheduleItem => {
        const day = scheduleItem.WEEKDAY;
        const startTime = scheduleItem.START_TIME;
        const endTime = scheduleItem.END_TIME;
        
        // Find time slots that fall within this course time
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

  const getUpcomingCourses = () => teachingCourses.filter(course => {
      const startDate = new Date(course.STARTDATE);
      return startDate > new Date();
    });

  const getOngoingCourses = () => teachingCourses.filter(course => {
      const now = new Date();
      const startDate = new Date(course.STARTDATE);
      const endDate = new Date(course.ENDDATE);
      return startDate <= now && endDate >= now;
    });

  const getCompletedCourses = () => teachingCourses.filter(course => {
      const endDate = new Date(course.ENDDATE);
      return endDate < new Date();
    });

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

  const upcomingCourses = getUpcomingCourses();
  const ongoingCourses = getOngoingCourses();
  const completedCourses = getCompletedCourses();

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
            <Grid container spacing={3}>
              {/* Statistics Cards */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" gutterBottom>
                    {upcomingCourses.length}
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
                    {ongoingCourses.length}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Ongoing Courses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently teaching
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {completedCourses.length}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Completed Courses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Finished teaching
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Weekly Schedule Grid */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
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
          </Grid>

          {/* Course Cards */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {teachingCourses.map((course) => {
              const courseStatus = getCourseStatus(course);
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
                          onClick={() => router.push(paths.dashboard.instructor.students)}
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
      </DashboardContent>
    </>
  );
}
