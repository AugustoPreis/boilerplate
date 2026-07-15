import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_STRATEGY } from '@shared/constants';

import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(config: ConfigService) {
    super({
      // O access token nunca chega via header Authorization: sempre via
      // cookie httpOnly `access_token`, setado pelo backend no login/refresh.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => (req?.cookies?.access_token as string | undefined) ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.jwtSecret') ?? '',
    });
  }

  validate(payload: IJwtPayload): IJwtPayload & { uuid: string } {
    return { ...payload, uuid: payload.sub };
  }
}
