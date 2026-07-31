import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

import { IsString, Matches, MinLength } from '@shared/validators';

import { PASSWORD_REGEX } from './create-user.dto';

export class UpdateUserPasswordDTO {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: i18nValidationMessage('validation.passwordTooWeak') })
  newPassword!: string;

  @ApiProperty()
  @IsString()
  confirmNewPassword!: string;
}
