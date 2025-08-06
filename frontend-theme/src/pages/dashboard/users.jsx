import { CONFIG } from 'src/global-config';

import { UserListView } from 'src/sections/user';

// ----------------------------------------------------------------------

const metadata = { title: `Users | Dashboard - ${CONFIG.appName}` };

export default function UsersPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <UserListView />
    </>
  );
}
