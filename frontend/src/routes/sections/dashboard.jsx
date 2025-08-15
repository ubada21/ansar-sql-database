import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { RoleGuard } from 'src/components/role-guard';
import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';
import { studentRoutes } from './student';
import { instructorRoutes } from './instructor';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const UsersPage = lazy(() => import('src/pages/dashboard/users'));
const RolesPage = lazy(() => import('src/pages/dashboard/roles'));
const PageFour = lazy(() => import('src/pages/dashboard/four'));
const PageFive = lazy(() => import('src/pages/dashboard/five'));
const PageSix = lazy(() => import('src/pages/dashboard/six'));
const CourseNewPage = lazy(() => import('src/pages/dashboard/course/new'));
const CourseEditPage = lazy(() => import('src/pages/dashboard/course/edit'));
const TransactionsPage = lazy(() => import('src/pages/dashboard/transactions'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { 
        path: 'users', 
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <UsersPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'roles', 
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <RolesPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'courses', 
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <PageFour />
          </RoleGuard>
        ) 
      },
      {
        path: 'course',
        children: [
          { 
            path: 'new', 
            element: (
              <RoleGuard allowedRoles={['Admin']}>
                <CourseNewPage />
              </RoleGuard>
            ) 
          },
          { 
            path: ':id/edit', 
            element: (
              <RoleGuard allowedRoles={['Admin']}>
                <CourseEditPage />
              </RoleGuard>
            ) 
          },
        ],
      },
      { 
        path: 'transactions', 
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <TransactionsPage />
          </RoleGuard>
        ) 
      },
      // Student routes
      ...studentRoutes,
      // Instructor routes
      ...instructorRoutes,
      {
        path: 'group',
        children: [
          { 
            element: (
              <RoleGuard allowedRoles={['Admin']}>
                <PageFour />
              </RoleGuard>
            ), 
            index: true 
          },
          { 
            path: 'five', 
            element: (
              <RoleGuard allowedRoles={['Admin']}>
                <PageFive />
              </RoleGuard>
            ) 
          },
          { 
            path: 'six', 
            element: (
              <RoleGuard allowedRoles={['Admin']}>
                <PageSix />
              </RoleGuard>
            ) 
          },
        ],
      },
    ],
  },
];
