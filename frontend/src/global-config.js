import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'Al Ansaar Portal',
  appVersion: packageJson.version,
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  auth: {
    method: 'cookie',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
};
