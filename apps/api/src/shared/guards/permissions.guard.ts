import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersRepository } from '@modules/users/repositories/users.repository';

import { IRequiredPermission, PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { AppException } from '../exceptions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<IRequiredPermission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const request = context.switchToHttp().getRequest<{ user?: { uuid: string } }>();
    const userUuid = request.user?.uuid;

    if (!userUuid) return false;

    const user = await this.usersRepository.findByUuid(userUuid);
    const permissions = user?.userRoles?.flatMap((userRole) => userRole.role.permissions) ?? [];

    const hasPermission = permissions.some(
      (permission) =>
        permission.resource === required.resource && permission.action === required.action,
    );

    if (!hasPermission) {
      throw AppException.from('errors.forbidden', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
