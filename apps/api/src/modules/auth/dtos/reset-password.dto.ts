import { PASSWORD_REGEX } from '@boilerplate/shared';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

import { IsString, Matches, MinLength } from '@shared/validators';

export class ResetPasswordDTO {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: i18nValidationMessage('validation.passwordTooWeak') })
  newPassword!: string;

  @ApiProperty()
  @IsString()
  confirmNewPassword!: string;
}
