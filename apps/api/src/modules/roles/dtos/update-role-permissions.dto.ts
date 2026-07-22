import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class PermissionKeyDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action!: string;
}

export class UpdateRolePermissionsDTO {
  @ApiProperty({ type: [PermissionKeyDTO], description: 'Permissions to assign to the role' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionKeyDTO)
  permissions!: PermissionKeyDTO[];
}
