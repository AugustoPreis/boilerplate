import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [String], description: 'Chaves das permissões a atribuir ao papel' })
  @IsArray()
  @IsString({ each: true })
  permissionKeys!: string[];
}
