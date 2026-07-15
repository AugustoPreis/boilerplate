import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';
import { AppException } from '../exceptions';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
export const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_HEADER_NAME = 'x-xsrf-token';

/**
 * Double-submit cookie: o backend seta um cookie XSRF-TOKEN legível por
 * JavaScript (não é o token de sessão) no login/refresh. Toda rota mutante
 * exige que o mesmo valor volte no header X-XSRF-TOKEN — um atacante que só
 * consegue disparar o cookie automaticamente (CSRF cross-site) não consegue
 * ler o cookie para replicar o header.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) return true;

    const request = context.switchToHttp().getRequest<Request>();

    if (!MUTATING_METHODS.has(request.method)) return true;

    const cookieToken = (request.cookies as Record<string, string> | undefined)?.[XSRF_COOKIE_NAME];
    const headerToken = request.headers[XSRF_HEADER_NAME];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw AppException.from('auth.CSRF_INVALID', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
