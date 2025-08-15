'use client';


import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { usePathname, useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';

const NAV_ITEMS = [
  {
    value: '',
    label: 'Profile',
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
  },
];

const TAB_PARAM = 'tab';

export function UserProfileView({ user }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTab = searchParams.get(TAB_PARAM) ?? '';

  const createRedirectPath = (currentPath, query) => {
    const queryString = new URLSearchParams({ [TAB_PARAM]: query }).toString();
    return query ? `${currentPath}?${queryString}` : currentPath;
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: user?.FIRSTNAME ? `${user.FIRSTNAME} ${user.LASTNAME}` : 'Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ height: 290 }}>
        <ProfileCover
          role="User"
          name={user?.FIRSTNAME ? `${user.FIRSTNAME} ${user.LASTNAME}` : 'User'}
          avatarUrl={user?.avatarUrl}
          coverUrl="/assets/images/cover/cover_1.jpg"
        />

        <Box
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            display: 'flex',
            position: 'absolute',
            bgcolor: 'background.paper',
            justifyContent: { xs: 'center', md: 'flex-end' },
          }}
        >
          <Tabs value={selectedTab}>
            {NAV_ITEMS.map((tab) => (
              <Tab
                component={RouterLink}
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                label={tab.label}
                href={createRedirectPath(pathname, tab.value)}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {selectedTab === '' && <ProfileHome user={user} sx={{ mt: 3 }} />}
    </DashboardContent>
  );
} 