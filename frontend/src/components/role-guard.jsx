import { memo } from 'react';

import { Box, Card, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useRoleContext } from 'src/contexts/role-context';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------



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

function RoleGuardComponent({ children, allowedRoles = ['Admin'], fallbackPath }) {
  const { user } = useAuthContext();
  const { previewRole } = useRoleContext();
  const router = useRouter();

  const currentRole = previewRole || user?.role || 'Admin';
  const hasPermission = allowedRoles.includes(currentRole);

  if (!hasPermission) {
    const defaultPath = fallbackPath || getDefaultPathForRole(currentRole);
    
    // Redirect to appropriate page for the current role
    setTimeout(() => {
      router.push(defaultPath);
    }, 100);

    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Card sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You don&apos;t have permission to access this page. Redirecting you to your dashboard...
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(defaultPath)}
          >
            Go to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  return children;
}

export const RoleGuard = memo(RoleGuardComponent);
