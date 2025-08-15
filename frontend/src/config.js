// Configuration for Ansar SQL Database Frontend Theme
export const config = {
  
  // API Configuration
  API_URL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // App Configuration
  appName: 'Ansar SQL Database',
  appVersion: '1.0.0',

  // Auth Configuration
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: '/profile',
  },
};

export default config;
