import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePermissionDTO {
  @ApiProperty({
    example: 'users:read',
    description: 'Permission key in resource:action format',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  @Matches(/^[a-z_]+:[a-z_]+$/, { message: 'key must be in resource:action format' })
  key!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
