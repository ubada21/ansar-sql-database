import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { USER_STATUS_OPTIONS } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const UserQuickEditSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: zod.string().optional(),
  country: zod.string().optional(),
  state: zod.string().optional(),
  city: zod.string().optional(),
  address: zod.string().optional(),
  zipCode: zod.string().optional(),
  company: zod.string().optional(),
  role: zod.string().optional(),
  // Not required
  status: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function UserQuickEditForm({ currentUser, open, onClose }) {
  const defaultValues = {
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    status: '',
    company: '',
    role: '',
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
    values: currentUser,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const promise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      reset();
      onClose();

      toast.promise(promise, {
        loading: 'Loading...',
        success: 'Update success!',
        error: 'Update error!',
      });

      await promise;

      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: {
          maxWidth: 720,
        },
      }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Update the information below and we will update you when changes are made.
          </Alert>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <Field.Text name="name" label="Full Name" />

            <Field.Text name="email" label="Email Address" />

            <Field.Text name="phoneNumber" label="Phone Number" />

            <Field.Text name="address" label="Address" />

            <Field.Text name="country" label="Country" />

            <Field.Text name="state" label="State/Region" />

            <Field.Text name="city" label="City" />

            <Field.Text name="zipCode" label="Zip/Code" />

            <Field.Text name="company" label="Company" />

            <Field.Select name="role" label="Role">
              <MenuItem value="leader"> Leader </MenuItem>
              <MenuItem value="hr"> HR </MenuItem>
              <MenuItem value="ui designer"> UI Designer </MenuItem>
              <MenuItem value="ux designer"> UX Designer </MenuItem>
              <MenuItem value="ui/ux designer"> UI/UX Designer </MenuItem>
              <MenuItem value="project manager"> Project Manager </MenuItem>
              <MenuItem value="backend developer"> Backend Developer </MenuItem>
              <MenuItem value="full stack designer"> Full Stack Designer </MenuItem>
              <MenuItem value="front end developer"> Front End Developer </MenuItem>
              <MenuItem value="full stack developer"> Full Stack Developer </MenuItem>
            </Field.Select>

            <Field.Select name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Update
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
} 