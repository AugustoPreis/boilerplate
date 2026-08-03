import { RoleSummaryDTO } from '../../users/dtos/role-summary.dto';

export interface IAuthUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  status: string;
  roles: RoleSummaryDTO[];
  permissions: string[];
}
