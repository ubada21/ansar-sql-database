import { lazy } from 'react';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/student/courses'));
const StudentCoursesPage = lazy(() => import('src/pages/dashboard/student/courses'));
const StudentSchedulePage = lazy(() => import('src/pages/dashboard/student/schedule'));
const StudentGradesPage = lazy(() => import('src/pages/dashboard/student/grades'));
const StudentProfilePage = lazy(() => import('src/pages/dashboard/student/profile'));

// ----------------------------------------------------------------------

export const studentRoutes = [
  {
    path: 'student',
    children: [
      { element: <IndexPage />, index: true },
      { path: 'courses', element: <StudentCoursesPage /> },
      { path: 'schedule', element: <StudentSchedulePage /> },
      { path: 'grades', element: <StudentGradesPage /> },
      { path: 'profile', element: <StudentProfilePage /> },
    ],
  },
];
