import { PASSWORD_REGEX } from '@boilerplate/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import {
  IsArray,
  IsEmail,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from '@shared/validators';

export class CreateUserDTO {
  @ApiProperty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: i18nValidationMessage('validation.passwordTooWeak') })
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ type: [String], description: 'Role UUIDs to assign to the user' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  roleUuids?: string[];
}
