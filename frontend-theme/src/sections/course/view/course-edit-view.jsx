import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CourseCreateEditForm } from '../course-create-edit-form';

// ----------------------------------------------------------------------

export function CourseEditView({ courseId }) {
  const router = useRouter();
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(endpoints.courses.details(courseId));
        setCurrentCourse(response.data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course data');
        router.push(paths.dashboard.courses);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  if (loading) {
    return (
      <DashboardContent>
        <div>Loading course data...</div>
      </DashboardContent>
    );
  }

  if (!currentCourse) {
    return (
      <DashboardContent>
        <div>Course not found</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit course"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Courses', href: paths.dashboard.courses },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CourseCreateEditForm currentCourse={currentCourse} />
    </DashboardContent>
  );
} 