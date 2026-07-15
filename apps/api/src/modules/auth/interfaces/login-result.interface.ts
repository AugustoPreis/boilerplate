import { MeResponseDto } from '../dtos/me-response.dto';

export interface ILoginResult {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSeconds: number;
  refreshExpiresInSeconds: number;
  user: MeResponseDto;
}
