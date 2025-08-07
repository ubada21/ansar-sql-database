import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const ProfilePage = lazy(() => import('src/pages/account'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const accountLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const accountRoutes = [
  {
    path: 'account',
    element: accountLayout(),
    children: [
      { element: <ProfilePage />, index: true },
    ],
  },
];
