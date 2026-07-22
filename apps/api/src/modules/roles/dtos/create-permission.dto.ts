import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePermissionDTO {
  @ApiProperty({
    example: 'users',
    description: 'Resource this permission applies to',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[a-z_]+$/, { message: 'resource must contain only lowercase letters and underscores' })
  resource!: string;

  @ApiProperty({
    example: 'read',
    description: 'Action allowed on the resource',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[a-z_]+$/, { message: 'action must contain only lowercase letters and underscores' })
  action!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
