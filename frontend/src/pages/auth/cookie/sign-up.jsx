import { CONFIG } from 'src/global-config';

import { CookieSignUpView } from 'src/auth/view/cookie';

// ----------------------------------------------------------------------

const metadata = { title: `Sign up | Cookie - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CookieSignUpView />
    </>
  );
}
