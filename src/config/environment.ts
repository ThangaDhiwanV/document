export const config = {
  isDevelopment: import.meta.env.VITE_IS_DEVELOPMENT === 'true',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Pharma LIMS'
};