import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';



// ----------------------------------------------------------------------

export const UserQuickEditSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First Name is required!' }),
  middleName: zod.string().optional(),
  lastName: zod.string().min(1, { message: 'Last Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: zod.string().optional(),
  province: zod.string().optional(),
  city: zod.string().optional(),
  address: zod.string().optional(),
  postalCode: zod.string().optional(),
  DOB: zod.string().optional(),
  roles: zod.array(zod.any()).optional()
});
//
// ----------------------------------------------------------------------

export function UserQuickEditForm({ currentUser, open, onClose }) {
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = useMemo(() => ({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    province: '',
    city: '',
    postalCode: '',
    DOB: '',
    roles: [],
  }), []);

  const transformUserData = useCallback((user) => {
    if (!user) return defaultValues;
    console.log(user.DOB)
    return {
    firstName: user.FIRSTNAME || '',
    middleName: user.MIDDLENAME || '',
    lastName: user.LASTNAME || '',
    email: user.EMAIL || '',
    phoneNumber: user.PHONENUMBER || '',
    address: user.ADDRESS || '',
    province: user.PROVINCE || '',
    city: user.CITY || '',
    postalCode: user.POSTALCODE || '',
    DOB: user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '',
    roles: user.roles || []
    }
  }, [defaultValues]);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (!open) {
      setIsLoading(false)
    }
  }, [open]);

useEffect(() => {
  const fetchRoles = async () => {
    try {
      const response = await axios.get(endpoints.roles.list);
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    }
  };

  if (open && roles.length === 0) {
    fetchRoles();
  }
}, [open, roles.length]);

  useEffect(() => {
    if (open && currentUser?.UID) {
      const loadUserData = async () => {
        setIsLoading(true);
        try {

          const [, rolesResponse] = await Promise.all([
            axios.get(endpoints.users.details(currentUser.UID)),
            axios.get(endpoints.users.roles(currentUser.UID))
          ]);

          const userWithData = {
            ...currentUser,
            roles: rolesResponse.data.roles || []
          };
          
          const transformedData = transformUserData(userWithData);
          reset(transformedData)
        } catch (error) {
          console.error('Error fetching user details:', error);
          const transformedData = transformUserData(currentUser)
          reset(transformedData);
        } finally {
          setIsLoading(false)
        }
      }
  loadUserData();
  } else if (open) {
    setIsLoading(false)
  }
  }, [open, currentUser, transformUserData, reset]);




  const onSubmit = handleSubmit(async (data) => {
    try {
      // Separate user data from roles (following course pattern)
      const { roles: formRoles, ...userData } = data;
      
      // Transform field names to match backend expectations (UPPERCASE)
      const transformedUserData = {
        FIRSTNAME: userData.firstName,
        MIDDLENAME: userData.middleName,
        LASTNAME: userData.lastName,
        EMAIL: userData.email,
        PHONENUMBER: userData.phoneNumber,
        ADDRESS: userData.address,
        PROVINCE: userData.province,
        CITY: userData.city,
        POSTALCODE: userData.postalCode,
        DOB: userData.DOB
      };
      
      // Update user data
      await axios.put(endpoints.users.details(currentUser.UID), transformedUserData);
      
      // Handle role updates separately
      if (formRoles && Array.isArray(formRoles)) {
        const roleIds = formRoles.map(role => role.ROLEID || role.id).filter(Boolean);
        
        // Get current user roles to compare
        const currentRolesResponse = await axios.get(endpoints.users.roles(currentUser.UID));
        const currentRoleIds = (currentRolesResponse.data.roles || []).map(role => role.ROLEID);
        
        // Remove roles that are no longer selected
        for (const roleId of currentRoleIds) {
          if (!roleIds.includes(roleId)) {
            try {
              await axios.delete(endpoints.users.roles(currentUser.UID) + `/${roleId}`);
            } catch (error) {
              // Continue with other roles even if one fails
            }
          }
        }
        
        // Add new roles
        for (const roleId of roleIds) {
          if (!currentRoleIds.includes(roleId)) {
            try {
              await axios.post(endpoints.users.roles(currentUser.UID), { ROLEID: roleId });
            } catch (error) {
              // Continue with other roles even if one fails
            }
          }
        }
      }
      
      toast.success('User updated successfully!');
      onClose();
      reset();
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user!');
    }
  });

  if (isLoading) {
    return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading user data...</Typography>
      </DialogContent>
    </Dialog>
  );
}

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
            <Field.Text name="firstName" label="First Name" />

            <Field.Text name="middleName" label="Middle Name" />

            <Field.Text name="lastName" label="Last Name" />

            <Field.Text name="DOB" label="Date of Birth" type="date" />

            <Field.Text name="email" label="Email Address" />

            <Field.Text name="phoneNumber" label="Phone Number" />

            <Field.Text name="address" label="Address" />

            <Field.Text name="province" label="Province" />

            <Field.Text name="city" label="City" />

            <Field.Text name="postalCode" label="Postal Code" />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Roles
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Select one or more roles for this user
            </Typography>

            <Controller
              name="roles"
              control={methods.control}
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
                    setValue('roles', newValue, { shouldValidate: true });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Roles"
                      placeholder="Select roles..."
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
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
  );
}
