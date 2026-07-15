export interface IAuthUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
}
