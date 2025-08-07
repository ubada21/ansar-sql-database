import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CourseCreateEditForm } from '../course-create-edit-form';

// ----------------------------------------------------------------------

export function CourseCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new course"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Courses', href: paths.dashboard.courses },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CourseCreateEditForm />
    </DashboardContent>
  );
} 