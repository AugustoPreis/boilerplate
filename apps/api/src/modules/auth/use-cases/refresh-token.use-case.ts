import { createHash } from 'crypto';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '@core/redis/redis.constants';

import { AppException } from '@shared/exceptions';

import { EUserStatus } from '../../users/enums/user-status.enum';
import { UsersRepository } from '../../users/repositories/users.repository';
import { ILoginResult } from '../interfaces/login-result.interface';

import { LoginUseCase } from './login.use-case';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly loginUseCase: LoginUseCase,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async execute(refreshToken: string): Promise<ILoginResult> {
    const payload = this.verifyToken(refreshToken);

    const storedHash = await this.getStoredHash(payload.sub);

    this.validateIncomingHash(refreshToken, storedHash);

    const user = await this.usersRepository.findByUuid(payload.sub);

    if (!user || user.status !== EUserStatus.ACTIVE) {
      throw AppException.from('auth.invalidCredentials', HttpStatus.UNAUTHORIZED);
    }

    return this.loginUseCase.execute({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.userRoles.map((ur) => ur.role.name),
    });
  }

  private verifyToken(refreshToken: string): { sub: string } {
    if (!refreshToken) {
      throw AppException.from('auth.refreshTokenNotFound', HttpStatus.UNAUTHORIZED);
    }

    try {
      return this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>('auth.jwtRefreshSecret'),
      });
    } catch {
      throw AppException.from('auth.refreshTokenInvalid', HttpStatus.UNAUTHORIZED);
    }
  }

  private async getStoredHash(sub: string): Promise<string> {
    const storedHash = await this.redis.get(`auth:refresh:${sub}`);

    if (!storedHash) {
      throw AppException.from('auth.refreshTokenNotFound', HttpStatus.UNAUTHORIZED);
    }

    return storedHash;
  }

  private validateIncomingHash(refreshToken: string, storedHash: string): void {
    const incomingHash = createHash('sha256').update(refreshToken).digest('hex');

    if (storedHash !== incomingHash) {
      throw AppException.from('auth.refreshTokenInvalid', HttpStatus.UNAUTHORIZED);
    }
  }
}
