import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RoleSummaryDTO } from '../../users/dtos/role-summary.dto';

export class MeResponseDTO {
  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [RoleSummaryDTO] })
  roles!: RoleSummaryDTO[];

  @ApiProperty({ type: [String], description: 'Effective permissions, as "resource:action"' })
  permissions!: string[];
}
