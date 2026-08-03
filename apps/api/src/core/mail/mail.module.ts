import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

import { MAIL_TRANSPORTER } from './mail.constants';
import { MailService } from './mail.service';

const mailTransporterProvider = {
  provide: MAIL_TRANSPORTER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Transporter =>
    createTransport({
      host: config.get<string>('mail.host'),
      port: config.get<number>('mail.port'),
      secure: config.get<boolean>('mail.secure'),
      auth: config.get<string>('mail.user')
        ? { user: config.get<string>('mail.user'), pass: config.get<string>('mail.password') }
        : undefined,
    }),
};

@Global()
@Module({
  providers: [mailTransporterProvider, MailService],
  exports: [MailService],
})
export class MailModule {}
