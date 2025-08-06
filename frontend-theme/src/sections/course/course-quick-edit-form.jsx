import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ScheduleDialog } from 'src/components/custom-dialog';

const scheduleSchema = zod.object({
  WEEKDAY: zod.string().min(1, { message: 'Weekday is required!' }),
  START_TIME: zod.string().min(1, { message: 'Start time is required!' }),
  END_TIME: zod.string().min(1, { message: 'End time is required!' }),
}).refine((data) => {
  const startTime = new Date(`2000-01-01T${data.START_TIME}`);
  const endTime = new Date(`2000-01-01T${data.END_TIME}`);
  return endTime > startTime;
}, {
  message: "End time must be after start time",
  path: ["END_TIME"],
});

export const CourseQuickEditSchema = zod.object({
  title: zod.string().min(1, { message: 'Course title is required!' }),
  location: zod.string().min(1, { message: 'Location is required!' }),
  startDate: zod.string().min(1, { message: 'Start date is required!' }),
  endDate: zod.string().min(1, { message: 'End date is required!' }),
  description: zod.string().optional(),
  capacity: zod.number().min(1, { message: 'Capacity must be at least 1' }),
  instructors: zod.array(zod.any()).min(1, { message: 'At least one instructor is required!' }),
  schedule: zod.array(scheduleSchema).min(1, { message: 'At least one schedule entry is required!' }),
}).refine((data) => {
  const weekdays = data.schedule.map(s => s.WEEKDAY);
  const uniqueWeekdays = [...new Set(weekdays)];
  return weekdays.length === uniqueWeekdays.length;
}, {
  message: "Each day of the week can only appear once in the schedule",
  path: ["schedule"],
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export function CourseQuickEditForm({ currentCourse, open, onClose }) {
  const [instructors, setInstructors] = useState([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = useMemo(() => ({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    capacity: 20,
    instructors: [],
    schedule: [
      {
        WEEKDAY: 'Monday',
        START_TIME: '09:00',
        END_TIME: '10:00',
      }
    ],
  }), []);

  // Transform course data from API format to form format
  const transformCourseData = useCallback((course) => {
    if (!course) return defaultValues;
    
    return {
      title: course.TITLE || '',
      location: course.LOCATION || '',
      startDate: course.STARTDATE ? course.STARTDATE.split('T')[0] : '',
      endDate: course.ENDDATE ? course.ENDDATE.split('T')[0] : '',
      description: course.DESCRIPTION || '',
      capacity: course.CAPACITY || 20,
      instructors: course.instructors || [],
      schedule: course.schedule || [
        {
          WEEKDAY: 'Monday',
          START_TIME: '09:00',
          END_TIME: '10:00',
        }
      ],
    };
  }, [defaultValues]);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(CourseQuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isDirty },
  } = methods;

  const currentSchedule = watch('schedule') || [];

  useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(endpoints.roles.byName('Instructor'));
        setInstructors(response.data.users || []);
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast.error('Failed to load instructors');
      }
    };

    if (open && instructors.length === 0) {
      fetchInstructors();
    }
  }, [open, instructors.length]);

  useEffect(() => {
    if (open && currentCourse?.COURSEID) {
      const loadCourseData = async () => {
        setIsLoading(true);
        try {
          const [courseInstructorsResponse, scheduleResponse] = await Promise.all([
            axios.get(endpoints.courses.instructors(currentCourse.COURSEID)),
            axios.get(endpoints.courses.schedule(currentCourse.COURSEID))
          ]);

          const courseWithData = {
            ...currentCourse,
            instructors: courseInstructorsResponse.data.instructors || [],
            schedule: scheduleResponse.data.schedule || []
          };

          const transformedData = transformCourseData(courseWithData);
          reset(transformedData);
        } catch (error) {
          console.error('Error fetching course details:', error);
          const transformedData = transformCourseData(currentCourse);
          reset(transformedData);
        } finally {
          setIsLoading(false);
        }
      };

      loadCourseData();
    } else if (open) {
      // If dialog is open but no course ID, just set loading to false
      setIsLoading(false);
    }
  }, [open, currentCourse, transformCourseData, reset]);

  const handleScheduleSave = (newSchedule) => {
    setValue('schedule', newSchedule, { shouldValidate: true, shouldDirty: true });
  };

  const formatScheduleDisplay = (schedule) => {
    if (!schedule || schedule.length === 0) return 'No schedule set';
    return schedule.map(s => `${s.WEEKDAY} ${s.START_TIME}-${s.END_TIME}`).join(', ');
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const courseData = {
        ...data,
        instructors: data.instructors.map(instructor => instructor.UID || instructor.uid || instructor.id).filter(Boolean)
      };

      await axios.put(endpoints.courses.details(currentCourse.COURSEID), courseData);
      toast.success('Course updated successfully!');
      onClose();
      reset();
      window.location.reload();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course!');
    }
  });

  const handleClose = () => {
    reset();
    setIsLoading(false);
    onClose();
  };

  if (isLoading) {
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
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading course data...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Edit Course</Typography>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Update the course information below. All required fields must be completed.
            </Alert>

            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="title" label="Course Title" />
              <Field.Text name="location" label="Location" />
              <Field.Text 
                name="startDate" 
                label="Start Date" 
                type="date" 
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text 
                name="endDate" 
                label="End Date" 
                type="date" 
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text name="capacity" label="Capacity" type="number" />
              <Field.Text 
                name="description" 
                label="Description" 
                multiline 
                rows={4}
                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Instructors
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Select one or more instructors for this course
              </Typography>
              
              <Controller
                name="instructors"
                control={methods.control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={instructors}
                    getOptionLabel={(option) => `${option.FIRSTNAME} ${option.LASTNAME}`}
                    isOptionEqualToValue={(option, value) => option.UID === value.UID}
                    value={field.value || []}
                    onChange={(event, newValue) => {
                      field.onChange(newValue);
                      setValue('instructors', newValue, { shouldValidate: true });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Instructors"
                        placeholder="Select instructors..."
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                    slotProps={{
                      chip: {
                        size: 'small',
                        variant: 'soft',
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Schedule
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:edit-fill" />}
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  {currentSchedule.length > 0 ? 'Edit Schedule' : 'Set Schedule'}
                </Button>
              </Box>
              
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Set the schedule for each day independently
              </Typography>

              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatScheduleDisplay(currentSchedule)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button variant="outlined" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {isDirty ? 'Save changes' : 'No changes made'}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>

      <ScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSave={handleScheduleSave}
        initialSchedule={currentSchedule}
      />
    </>
  );
} 