import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignRolesDTO {
  @ApiProperty({ type: [String], description: 'Role UUIDs to assign to the user' })
  @IsArray()
  @IsUUID('all', { each: true })
  roleUuids!: string[];
}
