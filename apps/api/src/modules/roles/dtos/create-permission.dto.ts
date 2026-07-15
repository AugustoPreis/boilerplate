import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'users:read',
    description: 'Chave da permissão no formato recurso:ação',
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
