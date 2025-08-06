import { CONFIG } from 'src/global-config';

import { CourseCreateView } from 'src/sections/course/view';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new course | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CourseCreateView />
    </>
  );
} 