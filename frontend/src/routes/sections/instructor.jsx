import { lazy } from 'react';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/instructor/courses'));
const InstructorCoursesPage = lazy(() => import('src/pages/dashboard/instructor/courses'));
const InstructorStudentsPage = lazy(() => import('src/pages/dashboard/instructor/students'));
const InstructorGradesPage = lazy(() => import('src/pages/dashboard/instructor/grades'));

// ----------------------------------------------------------------------

export const instructorRoutes = [
  {
    path: 'instructor',
    children: [
      { element: <IndexPage />, index: true },
      { path: 'courses', element: <InstructorCoursesPage /> },
      { path: 'students', element: <InstructorStudentsPage /> },
      { path: 'grades', element: <InstructorGradesPage /> },
    ],
  },
];
