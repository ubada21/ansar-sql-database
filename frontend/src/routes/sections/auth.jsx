import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

/** **************************************
 * Cookie
 *************************************** */
const Cookie = {
  SignInPage: lazy(() => import('src/pages/auth/cookie/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/cookie/sign-up')),
};

const authCookie = {
  path: '/',
  children: [
    {
      path: 'login',
      element: (
        <GuestGuard>
          <AuthSplitLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Cookie.SignInPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'register',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Cookie.SignUpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authCookie],
  },
];
