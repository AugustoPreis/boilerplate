import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDTO {
  @ApiProperty({ type: [String], description: 'Permission keys to assign to the role' })
  @IsArray()
  @IsString({ each: true })
  permissionKeys!: string[];
}
