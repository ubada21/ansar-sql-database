import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));

const ProfilePage = lazy(() => import('src/pages/account'));

export const routesSection = [
  {
    path: '/',
    element: <Navigate to={CONFIG.auth.redirectPath} replace />,
  },

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // Account
  {
    path: 'account',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <DashboardLayout>
          <ProfilePage />
        </DashboardLayout>
      </Suspense>
    ),
  },

  // No match
  { path: '*', element: <Page404 /> },
];
