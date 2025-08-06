import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ScheduleDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

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

export const CourseCreateSchema = zod.object({
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

// ----------------------------------------------------------------------

export function CourseCreateEditForm({ currentCourse }) {
  const router = useRouter();
  const [instructors, setInstructors] = useState([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(CourseCreateSchema),
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

  // Fetch instructors and course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch instructors
        const instructorsResponse = await axios.get(endpoints.roles.byName('Instructor'));
        setInstructors(instructorsResponse.data.users || []);

        // If editing, fetch course details including instructors and schedule
        if (currentCourse?.COURSEID) {
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
          }
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast.error('Failed to load instructors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentCourse, transformCourseData, reset]);

  const handleScheduleSave = (newSchedule) => {
    setValue('schedule', newSchedule, { shouldValidate: true, shouldDirty: true });
  };

  const formatScheduleDisplay = (schedule) => {
    if (!schedule || schedule.length === 0) return 'No schedule set';
    return schedule.map(s => `${s.WEEKDAY} ${s.START_TIME}-${s.END_TIME}`).join(', ');
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Extract UIDs from instructor objects for API
      const courseData = {
        ...data,
        instructors: data.instructors.map(instructor => instructor.UID)
      };

      if (currentCourse) {
        // Update existing course
        await axios.put(endpoints.courses.details(currentCourse.COURSEID), courseData);
        toast.success('Course updated successfully!');
      } else {
        // Create new course with full data
        await axios.post(endpoints.courses.list, courseData);
        toast.success('Course created successfully!');
      }
      
      reset();
      router.push(paths.dashboard.courses);
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(currentCourse ? 'Failed to update course!' : 'Failed to create course!');
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading course data...</Typography>
      </Box>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Course Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Fill in the course details below. All required fields must be completed.
              </Typography>
            </Box>

            {currentCourse && (
              <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Button 
                  variant="soft" 
                  color="error"
                  onClick={async () => {
                    try {
                      await axios.delete(endpoints.courses.details(currentCourse.COURSEID));
                      toast.success('Course deleted successfully!');
                      router.push(paths.dashboard.courses);
                    } catch (error) {
                      console.error('Error deleting course:', error);
                      toast.error('Failed to delete course!');
                    }
                  }}
                >
                  Delete course
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
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

            {/* Instructors Section */}
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

            {/* Schedule Section */}
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

              <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatScheduleDisplay(currentSchedule)}
                </Typography>
              </Card>
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                loading={isSubmitting}
                disabled={currentCourse && !isDirty}
              >
                {!currentCourse ? 'Create course' : (isDirty ? 'Save changes' : 'No changes made')}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <ScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSave={handleScheduleSave}
        initialSchedule={currentSchedule}
      />
    </Form>
  );
} 