// Configuration for Ansar SQL Database Frontend Theme
export const config = {
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  
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

// Debug logging to help identify environment variable issues
console.log('Environment check:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  API_URL: config.API_URL
});

export default config;
