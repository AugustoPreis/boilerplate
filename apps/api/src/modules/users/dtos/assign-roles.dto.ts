import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ type: [String], description: 'UUIDs dos papéis a atribuir' })
  @IsArray()
  @IsUUID('all', { each: true })
  roleUuids!: string[];
}
