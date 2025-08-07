import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CourseDetailsDialog({ open, onClose, courseId }) {
  const [course, setCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch course details
      const courseResponse = await axios.get(endpoints.courses.details(courseId));
      setCourse(courseResponse.data.course);

      // Fetch instructors
      try {
        const instructorsResponse = await axios.get(endpoints.courses.instructors(courseId));
        setInstructors(instructorsResponse.data.instructors || []);
      } catch (error) {
        console.error('Error fetching instructors:', error);
        setInstructors([]);
      }

      // Fetch students
      try {
        const studentsResponse = await axios.get(endpoints.courses.students(courseId));
        setStudents(studentsResponse.data.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }

      // Fetch schedule
      try {
        const scheduleResponse = await axios.get(endpoints.courses.schedule(courseId));
        setSchedule(scheduleResponse.data.schedule || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setSchedule([]);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (open && courseId) {
      fetchCourseDetails();
    }
  }, [open, courseId, fetchCourseDetails]);

  const handleClose = () => {
    setCourse(null);
    setInstructors([]);
    setStudents([]);
    setSchedule([]);
    onClose();
  };

  const getCourseStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > now) {
      return { label: 'Upcoming', color: 'info' };
    } else if (start <= now && end >= now) {
      return { label: 'Ongoing', color: 'success' };
    } else {
      return { label: 'Completed', color: 'default' };
    }
  };

  const status = course ? getCourseStatus(course.STARTDATE, course.ENDDATE) : null;

  return (
    <Dialog 
      fullWidth 
      maxWidth="md" 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Course Details</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : course ? (
          <Stack spacing={3}>
            {/* Course Information */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                {course.TITLE}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Course ID
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {course.COURSEID}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Status
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 2,
                      color: status?.color === 'success' ? 'success.main' : 
                             status?.color === 'info' ? 'info.main' : 'text.secondary'
                    }}
                  >
                    {status?.label}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {course.LOCATION}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Capacity
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {course.CAPACITY || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Start Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(course.STARTDATE).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    End Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(course.ENDDATE).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                {course.DESCRIPTION && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {course.DESCRIPTION}
                    </Typography>
                  </Grid>
                )}
                
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Instructors
                  </Typography>
                  {instructors.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {instructors.map((instructor) => (
                        <Typography 
                          key={instructor.UID} 
                          variant="body1" 
                          sx={{ 
                            color: 'primary.main',
                            fontWeight: 500,
                            '&:not(:last-child)': { '&::after': { content: '","', color: 'text.secondary' } }
                          }}
                        >
                          {instructor.FIRSTNAME} {instructor.LASTNAME}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      No instructors assigned
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Card>

            {/* Schedule */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Schedule ({schedule.length} sessions)
              </Typography>
              
              {schedule.length > 0 ? (
                <Grid container spacing={2}>
                  {schedule.map((session) => (
                    <Grid key={session.SCHEDULEID} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>
                          {session.WEEKDAY}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {session.START_TIME} - {session.END_TIME}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No schedule set for this course.
                </Typography>
              )}
            </Card>

            <Divider />

            {/* Enrolled Students */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Enrolled Students ({students.length})
              </Typography>
              
              {students.length > 0 ? (
                <Grid container spacing={2}>
                  {students.map((student) => (
                    <Grid key={student.UID} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Typography variant="subtitle2">
                          {student.FIRSTNAME} {student.LASTNAME}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          ID: {student.UID}
                        </Typography>
                        {student.ENROLLMENT_DATE && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Enrolled: {new Date(student.ENROLLMENT_DATE).toLocaleDateString()}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No students enrolled in this course.
                </Typography>
              )}
            </Card>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Course not found.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 