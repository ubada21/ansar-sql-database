import { z as zod } from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm , FormProvider, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

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

const scheduleArraySchema = zod.object({
  schedule: zod.array(scheduleSchema).min(1, { message: 'At least one schedule entry is required!' }),
}).refine((data) => {
  const weekdays = data.schedule.map(s => s.WEEKDAY);
  const uniqueWeekdays = [...new Set(weekdays)];
  return weekdays.length === uniqueWeekdays.length;
}, {
  message: "Each day of the week can only appear once in the schedule",
  path: ["schedule"],
});

// ----------------------------------------------------------------------

export function ScheduleDialog({ open, onClose, onSave, initialSchedule = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    schedule: initialSchedule.length > 0 ? initialSchedule : [
      {
        WEEKDAY: 'Monday',
        START_TIME: '09:00',
        END_TIME: '10:00',
      }
    ],
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(scheduleArraySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control,
    name: 'schedule',
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSave(data.schedule);
      onClose();
      reset();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
          <Typography variant="h6">Course Schedule</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Set the schedule for each day independently. Each day can have different start and end times.
          </Typography>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => appendSchedule({
                WEEKDAY: 'Monday',
                START_TIME: '09:00',
                END_TIME: '10:00',
              })}
            >
              Add Schedule
            </Button>
          </Box>

          {scheduleFields.map((field, index) => (
            <Card key={field.id} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Field.Select
                    name={`schedule.${index}.WEEKDAY`}
                    label="Day of Week"
                  >
                    <MenuItem value="Monday">Monday</MenuItem>
                    <MenuItem value="Tuesday">Tuesday</MenuItem>
                    <MenuItem value="Wednesday">Wednesday</MenuItem>
                    <MenuItem value="Thursday">Thursday</MenuItem>
                    <MenuItem value="Friday">Friday</MenuItem>
                    <MenuItem value="Saturday">Saturday</MenuItem>
                    <MenuItem value="Sunday">Sunday</MenuItem>
                  </Field.Select>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Field.Text
                    name={`schedule.${index}.START_TIME`}
                    label="Start Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <Field.Text
                      name={`schedule.${index}.END_TIME`}
                      label="End Time"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    {scheduleFields.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeSchedule(index)}
                        sx={{ ml: 1, mb: 0.5 }}
                      >
                        <Iconify icon="eva:trash-2-fill" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))}

          {errors.schedule && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.schedule.message}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Save Schedule
          </Button>
                  </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
} 