
import { memo } from 'react';

import { Box, Chip, Select, MenuItem, InputLabel, Typography, FormControl } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useRoleContext } from 'src/contexts/role-context';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const AVAILABLE_ROLES = [
  { value: 'Admin', label: 'Admin', color: 'primary' },
  { value: 'Student', label: 'Student', color: 'success' },
  { value: 'Instructor', label: 'Instructor', color: 'warning' },
  { value: 'Parent', label: 'Parent', color: 'info' },
  { value: 'Donor', label: 'Donor', color: 'secondary' },
];

function RoleSelectorComponent({ sx }) {
  const { user } = useAuthContext();
  const { previewRole, setPreviewRole } = useRoleContext();
  const router = useRouter();
  
  const selectedRole = previewRole || user?.role || 'Admin';

  // Function to get default path for a role
  const getDefaultPathForRole = (role) => {
    switch (role) {
      case 'Student':
        return paths.dashboard.student.courses;
      case 'Instructor':
        return paths.dashboard.instructor.courses;
      case 'Parent':
        return paths.dashboard.parent.children;
      case 'Donor':
        return paths.dashboard.donor.donations;
      case 'Admin':
      default:
        return paths.dashboard.root;
    }
  };

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    if (newRole === user?.role) {
      setPreviewRole(null); // Clear preview if selecting actual role
      // Redirect to admin dashboard
      router.push(paths.dashboard.root);
    } else {
      setPreviewRole(newRole);
      // Redirect to appropriate page for the selected role
      const defaultPath = getDefaultPathForRole(newRole);
      router.push(defaultPath);
    }
  };

  // Only show for admin users (check actual user role, not preview role)
  if (user?.role !== 'Admin') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ...sx }}>
      <Typography variant="body2" color="text.secondary">
        {previewRole ? 'Preview as:' : 'Role:'}
      </Typography>
      
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={selectedRole}
          label="Role"
          onChange={handleRoleChange}
          sx={{ 
            height: 40,
            ...(previewRole && {
              '& .MuiSelect-select': {
                backgroundColor: 'warning.lighter',
                border: '1px solid',
                borderColor: 'warning.main',
              }
            })
          }}
        >
          {AVAILABLE_ROLES.map((role) => (
            <MenuItem key={role.value} value={role.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={role.label}
                  color={role.color}
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
                {previewRole && previewRole === role.value && (
                  <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
                    (Preview)
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {previewRole && (
        <Chip
          label="Preview Mode"
          color="warning"
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      )}
    </Box>
  );
}

export const RoleSelector = memo(RoleSelectorComponent);
