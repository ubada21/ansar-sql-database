import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Alert,
  Paper,
  Table,
  Button,
  Dialog,
  Select,
  Tooltip,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import axios, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CourseEnrollmentDialog({ open, onClose, course }) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const fetchEnrolledStudents = useCallback(async () => {
    if (!course?.COURSEID) return;
    
    try {
      setLoading(true);
      const response = await axios.get(endpoints.courses.students(course.COURSEID));
      setEnrolledStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast.error('Failed to fetch enrolled students');
    } finally {
      setLoading(false);
    }
  }, [course?.COURSEID]);

  const fetchAvailableStudents = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.users.list);
      const allUsers = response.data.users || [];
      
      // Filter to only show students (users with Student role)
      // For now, we'll show all users and let the backend handle role validation
      setAvailableStudents(allUsers);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast.error('Failed to fetch available students');
    }
  }, []);

  const handleEnrollStudent = useCallback(async () => {
    if (!selectedStudentId || !course?.COURSEID) return;

    try {
      setEnrolling(true);
      await axios.post(endpoints.courses.enroll(course.COURSEID, selectedStudentId));
      
      toast.success('Student enrolled successfully!');
      setSelectedStudentId('');
      fetchEnrolledStudents(); // Refresh the list
    } catch (error) {
      console.error('Error enrolling student:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to enroll student');
      }
    } finally {
      setEnrolling(false);
    }
  }, [selectedStudentId, course?.COURSEID, fetchEnrolledStudents]);

  const handleRemoveStudent = useCallback(async (studentId) => {
    if (!course?.COURSEID) return;

    try {
      await axios.delete(endpoints.courses.removeStudent(course.COURSEID, studentId));
      
      toast.success('Student removed from course successfully!');
      fetchEnrolledStudents(); // Refresh the list
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student from course');
    }
  }, [course?.COURSEID, fetchEnrolledStudents]);

  const handleUpdateEnrollmentStatus = useCallback(async (studentId, newStatus) => {
    if (!course?.COURSEID) return;

    try {
      await axios.patch(endpoints.courses.updateEnrollment(course.COURSEID, studentId), {
        STATUS: newStatus,
      });
      
      toast.success('Enrollment status updated successfully!');
      fetchEnrolledStudents(); // Refresh the list
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      toast.error('Failed to update enrollment status');
    }
  }, [course?.COURSEID, fetchEnrolledStudents]);

  useEffect(() => {
    if (open && course) {
      fetchEnrolledStudents();
      fetchAvailableStudents();
    }
  }, [open, course, fetchEnrolledStudents, fetchAvailableStudents]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (!course) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="mdi:account-group" />
          <Typography variant="h6">
            Manage Enrollments - {course.TITLE}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Course ID: {course.COURSEID} | Location: {course.LOCATION}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duration: {formatDate(course.STARTDATE)} - {formatDate(course.ENDDATE)}
          </Typography>
        </Box>

        {/* Enroll New Student Section */}
        <Box mb={3}>
          <Typography variant="h6" mb={2}>
            Enroll New Student
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Select Student</InputLabel>
              <Select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                label="Select Student"
                disabled={enrolling}
              >
                {availableStudents
                  .filter(student => !enrolledStudents.some(enrolled => enrolled.UID === student.UID))
                  .map((student) => (
                    <MenuItem key={student.UID} value={student.UID}>
                      {student.FIRSTNAME} {student.LASTNAME} ({student.EMAIL})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleEnrollStudent}
              disabled={!selectedStudentId || enrolling}
              startIcon={enrolling ? <CircularProgress size={16} /> : <Iconify icon="mdi:account-plus" />}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Student'}
            </Button>
          </Box>
        </Box>

        {/* Enrolled Students Section */}
        <Box>
          <Typography variant="h6" mb={2}>
            Enrolled Students ({enrolledStudents.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : enrolledStudents.length === 0 ? (
            <Alert severity="info">
              No students are currently enrolled in this course.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Enrollment Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Final Grade</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolledStudents.map((student) => (
                    <TableRow key={student.UID}>
                      <TableCell>
                        <Typography variant="body2">
                          {student.FIRSTNAME} {student.LASTNAME}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {student.EMAIL || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(student.ENROLL_DATE)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <Select
                            value={student.STATUS}
                            onChange={(e) => handleUpdateEnrollmentStatus(student.UID, e.target.value)}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="withdrawn">Withdrawn</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {student.FINAL_GRADE || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove from course">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveStudent(student.UID)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
