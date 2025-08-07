import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { CourseEditView } from 'src/sections/course/view';

// ----------------------------------------------------------------------

const metadata = { title: `Course edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <CourseEditView courseId={id} />
    </>
  );
} 