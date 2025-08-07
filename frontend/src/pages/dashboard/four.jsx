import { CONFIG } from 'src/global-config';

import { CourseListView } from '../../sections/course/view/'

// ----------------------------------------------------------------------

const metadata = { title: `Courses | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CourseListView />
    </>
  );
}
