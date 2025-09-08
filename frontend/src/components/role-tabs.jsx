import { memo, useState, useEffect } from 'react';

import { Tab, Tabs, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useRoleContext } from 'src/contexts/role-context';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const ROLE_CONFIG = {
  Admin: {
    label: 'Admin',
    color: 'primary',
    path: paths.dashboard.root,
  },
  Student: {
    label: 'Student',
    color: 'success',
    path: paths.dashboard.student.courses,
  },
  Instructor: {
    label: 'Instructor',
    color: 'warning',
    path: paths.dashboard.instructor.courses,
  },
  Parent: {
    label: 'Parent',
    color: 'info',
    path: paths.dashboard.parent.children,
  },
  Donor: {
    label: 'Donor',
    color: 'secondary',
    path: paths.dashboard.donor.donations,
  },
};

function RoleTabsComponent({ sx }) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const { previewRole, setPreviewRole } = useRoleContext();
  
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user roles from auth context or fallback to single role
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    // Use roles from user.allRoles if available, otherwise use single role
    const roles = user.allRoles || (user.role ? [{ ROLENAME: user.role, ROLEID: 0 }] : []);
    
    // Transform roles to include role configuration
    const transformedRoles = roles.map(role => ({
      ROLEID: role.ROLEID,
      ROLENAME: role.ROLENAME,
      ...ROLE_CONFIG[role.ROLENAME]
    }));
    
    setUserRoles(transformedRoles);
    setLoading(false);
  }, [user]);

  // Don't show tabs if user has only one role or no roles
  if (loading || userRoles.length <= 1) {
    return null;
  }

  const currentRole = previewRole || user?.role || 'Admin';
  const currentRoleIndex = userRoles.findIndex(role => role.ROLENAME === currentRole);

  const handleRoleChange = (event, newValue) => {
    const selectedRole = userRoles[newValue];
    if (!selectedRole) return;

    // If selecting the user's actual role, clear preview
    if (selectedRole.ROLENAME === user?.role) {
      setPreviewRole(null);
    } else {
      // Set preview role for role switching
      setPreviewRole(selectedRole.ROLENAME);
    }

    // Navigate to the appropriate path for the selected role
    const targetPath = selectedRole.path || paths.dashboard.root;
    router.push(targetPath);
  };

  return (
    <Tabs
        value={currentRoleIndex >= 0 ? currentRoleIndex : 0}
        onChange={handleRoleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 'auto',
          '& .MuiTab-root': {
            minHeight: 36,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: 1,
            mx: 0.25,
            px: 1.5,
            py: 0.5,
            transition: theme.transitions.create(['background-color', 'color'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            },
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          ...sx,
        }}
      >
          {userRoles.map((role, index) => (
            <Tab
              key={role.ROLEID}
              label={
                <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                  {role.label}
                </Typography>
              }
            />
          ))}
        </Tabs>
  );
}

export const RoleTabs = memo(RoleTabsComponent);
