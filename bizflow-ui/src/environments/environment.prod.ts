export const environment = {
  production: true,
  apiUrl: 'https://api.bizflow.com/api',
  apiTimeout: 30000,
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    expiresInKey: 'token_expires_in',
  },
  theme: {
    storageKey: 'theme_preference',
    defaultTheme: 'light',
  },
  logging: {
    enabled: false,
    level: 'error',
  },
};
