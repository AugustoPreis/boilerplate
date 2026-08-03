import { createHash } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

import { MailService } from '@core/mail/mail.service';
import { REDIS_CLIENT } from '@core/redis/redis.constants';

import { TimeUnitHelper } from '@shared/helpers';

import { EUserStatus } from '../../users/enums/user-status.enum';
import { UsersRepository } from '../../users/repositories/users.repository';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email.toLowerCase());

    // Same response regardless of whether the e-mail is registered, so this
    // endpoint never reveals which addresses exist in the system.
    if (!user || user.status !== EUserStatus.ACTIVE) {
      return;
    }

    const expiresInSeconds = TimeUnitHelper.durationToSeconds(
      this.config.get<string>('auth.passwordResetExpiresIn', '30m'),
    );

    const token = this.jwtService.sign(
      { sub: user.uuid },
      {
        secret: this.config.get<string>('auth.passwordResetSecret'),
        expiresIn: expiresInSeconds,
      },
    );

    const hash = createHash('sha256').update(token).digest('hex');

    await this.redis.set(`auth:password-reset:${user.uuid}`, hash, 'EX', expiresInSeconds);

    await this.mailService.send({
      to: user.email,
      subject: 'Redefinição de senha',
      html: this.buildEmailHtml(user.name, token),
    });
  }

  private buildEmailHtml(name: string, token: string): string {
    const resetUrl = `${this.config.get<string>('app.frontendUrl')}/reset-password?token=${token}`;

    return [
      `<p>Olá, ${name}.</p>`,
      '<p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para continuar:</p>',
      `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
      '<p>Se você não solicitou isso, ignore este e-mail — sua senha permanece a mesma.</p>',
    ].join('\n');
  }
}
