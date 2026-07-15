import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { XSRF_COOKIE_NAME } from '@shared/guards/csrf.guard';

import { ILoginResult } from '../interfaces/login-result.interface';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Escopo do cookie de refresh restrito à própria rota de refresh — reduz a
// superfície de roubo do token via outros endpoints (ele nunca é enviado
// automaticamente pelo browser em nenhuma outra chamada).
export function getRefreshCookiePath(config: ConfigService): string {
  const prefix = config.get<string>('app.prefix', 'api');

  return `/${prefix}/v1/auth/refresh`;
}

export function setAuthCookies(
  res: Response,
  config: ConfigService,
  result: ILoginResult,
  xsrfToken: string,
): void {
  const secure = config.get<boolean>('auth.cookieSecure', false);
  const refreshPath = getRefreshCookiePath(config);

  res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: result.accessExpiresInSeconds * 1000,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: refreshPath,
    maxAge: result.refreshExpiresInSeconds * 1000,
  });

  // Não-httpOnly de propósito: o frontend lê esse valor para ecoar no header
  // X-XSRF-TOKEN (double-submit). Nunca contém informação de sessão.
  res.cookie(XSRF_COOKIE_NAME, xsrfToken, {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: result.refreshExpiresInSeconds * 1000,
  });
}

export function clearAuthCookies(res: Response, config: ConfigService): void {
  const secure = config.get<boolean>('auth.cookieSecure', false);
  const refreshPath = getRefreshCookiePath(config);

  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/', httpOnly: true, secure, sameSite: 'lax' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: refreshPath,
    httpOnly: true,
    secure,
    sameSite: 'lax',
  });
  res.clearCookie(XSRF_COOKIE_NAME, { path: '/', secure, sameSite: 'lax' });
}
