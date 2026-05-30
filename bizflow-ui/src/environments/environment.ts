export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
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
    enabled: true,
    level: 'debug',
  },
};
