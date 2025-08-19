import { CONFIG } from 'src/global-config';

import { CookieSignInView } from 'src/auth/view/cookie';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in | Cookie - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CookieSignInView />
    </>
  );
}
