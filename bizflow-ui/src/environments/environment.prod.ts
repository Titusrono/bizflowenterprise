// Get API URL from environment variable or use default
const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__ENVIRONMENT_API_URL__) {
    return (window as any).__ENVIRONMENT_API_URL__;
  }
  // Default API URL for production
  return 'https://bizflow-api.vercel.app/api';
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  apiTimeout: 30000,
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    expiresInKey: 'token_expires_in',
  },
  theme: {
    storageKey: 'theme_preference',
    defaultTheme: 'dark',
  },
  logging: {
    enabled: false,
    level: 'error',
  },
};
