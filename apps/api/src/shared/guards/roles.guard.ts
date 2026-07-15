import { ROLE_ADMIN } from '@boilerplate/shared';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<{ user: { roles: string[] } }>();
    const userRoles: string[] = request.user?.roles ?? [];

    // Total bypass for ROLE_ADMIN
    if (userRoles.includes(ROLE_ADMIN)) return true;

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
