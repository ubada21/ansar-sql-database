import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const provinces = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

export const UserCreateSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: zod.string().min(1, { message: 'Phone number is required!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  city: zod.string().min(1, { message: 'City is required!' }),
  province: zod.string().min(1, { message: 'Province is required!' }),
  postalCode: zod.string().min(1, { message: 'Postal code is required!' }),
  password: zod.string().min(8, { message: 'Password must be at least 8 characters!' }),
  confirmPassword: zod.string().min(1, { message: 'Please confirm your password!' }),
  roles: zod.array(zod.any()).min(1, { message: 'At least one role is required!' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ----------------------------------------------------------------------

export function UserCreateForm({ open, onClose, onSuccess }) {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    password: '',
    confirmPassword: '',
    roles: [],
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(UserCreateSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  // Fetch roles for selection
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(endpoints.roles.list);
        if (response.status === 200) {
          setRoles(response.data.roles || []);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load roles');
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      
      // Transform data to match backend expectations (uppercase field names)
      const userData = {
        FIRSTNAME: data.firstName,
        LASTNAME: data.lastName,
        EMAIL: data.email,
        PASSWORD: data.password,
        PHONENUMBER: data.phoneNumber,
        ADDRESS: data.address,
        CITY: data.city,
        PROVINCE: data.province,
        POSTALCODE: data.postalCode
      };

      const selectedRoles = data.roles.map(role => role.ROLEID);

      console.log('Creating user with data:', userData);
      console.log('Selected roles:', selectedRoles);
      console.log('API endpoint: /register');

      // First create the user using the register endpoint (which hashes the password)
      const response = await axios.post('/register', userData);
      
      console.log('User creation response:', response);
      
      const newUserId = response.data.UID;
      console.log('New user ID:', newUserId);

      // Then assign roles to the user
      if (selectedRoles.length > 0) {
        console.log('Assigning roles to user:', newUserId);
        
        for (const roleId of selectedRoles) {
          try {
            const roleResponse = await axios.post(`/users/${newUserId}/roles/`, {
              UID: newUserId,
              ROLEID: roleId
            });
            console.log(`Role ${roleId} assigned successfully:`, roleResponse.data);
          } catch (roleError) {
            console.error(`Error assigning role ${roleId}:`, roleError);
            console.error('Role error response:', roleError.response?.data);
          }
        }
      }
      
      toast.success('User created successfully!');
      reset();
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || 'Failed to create user!';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  });

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
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create New User</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Fill in the user information below. All required fields must be completed.
          </Alert>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="firstName" label="First Name" />
            <Field.Text name="lastName" label="Last Name" />
            <Field.Text name="email" label="Email Address" type="email" />
            <Field.Text name="phoneNumber" label="Phone Number" />
            <Field.Text name="address" label="Address" sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} />
            <Field.Text name="city" label="City" />
            
            <FormControl fullWidth>
              <InputLabel>Province</InputLabel>
              <Controller
                name="province"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Select
                    {...field}
                    label="Province"
                    error={!!error}
                  >
                    {provinces.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

            <Field.Text name="postalCode" label="Postal Code" />
            
            <Divider sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} />
            
            <Field.Text 
              name="password" 
              label="Password" 
              type="password"
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />
            <Field.Text 
              name="confirmPassword" 
              label="Confirm Password" 
              type="password"
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />

            <Divider sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} />

            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Roles
              </Typography>
              <Controller
                name="roles"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={roles}
                    getOptionLabel={(option) => option.ROLENAME}
                    isOptionEqualToValue={(option, value) => option.ROLEID === value.ROLEID}
                    value={field.value || []}
                    onChange={(event, newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Roles"
                        placeholder="Choose roles..."
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting || isLoading}
            startIcon={isLoading ? <Iconify icon="eva:loader-outline" /> : null}
          >
            {isLoading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
