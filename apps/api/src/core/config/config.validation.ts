export function validateConfig(config: Record<string, unknown>): Record<string, unknown> {
  const errors: string[] = [];
  const env = config.NODE_ENV as string | undefined;

  const port = parseInt((config.PORT as string) || '3000', 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    errors.push('PORT must be a number between 1024 and 65535');
  }

  if (env === 'production') {
    const jwtSecret = (config.JWT_SECRET as string) || '';
    if (jwtSecret.length < 32) {
      errors.push('JWT_SECRET must have at least 32 characters in production');
    }

    const jwtRefreshSecret = (config.JWT_REFRESH_SECRET as string) || '';
    if (jwtRefreshSecret.length < 32) {
      errors.push('JWT_REFRESH_SECRET must have at least 32 characters in production');
    }

    if (config.COOKIE_SECURE !== 'true') {
      errors.push('COOKIE_SECURE must be "true" in production (cookies require HTTPS)');
    }
  }

  const bcryptRounds = parseInt((config.BCRYPT_ROUNDS as string) || '12', 10);
  if (isNaN(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 14) {
    errors.push('BCRYPT_ROUNDS must be a number between 10 and 14');
  }

  const poolSize = parseInt((config.DB_POOL_SIZE as string) || '10', 10);
  if (isNaN(poolSize) || poolSize < 2 || poolSize > 50) {
    errors.push('DB_POOL_SIZE must be a number between 2 and 50');
  }

  if (errors.length > 0) {
    throw new Error(`Config validation errors:\n  - ${errors.join('\n  - ')}`);
  }

  return config;
}
