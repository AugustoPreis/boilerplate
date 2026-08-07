import { getAuth } from '@core/api/generated/auth/auth';
import type {
  ForgotPasswordDTO,
  LoginDTO,
  LoginResponseDTO,
  MeResponseDTO,
  ResetPasswordDTO,
} from '@core/api/generated/boilerplateAPI.schemas';

export function login(dto: LoginDTO): Promise<LoginResponseDTO> {
  return getAuth().authControllerLoginV1(dto);
}

export function logout(): Promise<void> {
  return getAuth().authControllerLogoutV1();
}

export function getMe(): Promise<MeResponseDTO> {
  return getAuth().authControllerMeV1();
}

export function forgotPassword(dto: ForgotPasswordDTO): Promise<void> {
  return getAuth().authControllerForgotPasswordV1(dto);
}

export function resetPassword(dto: ResetPasswordDTO): Promise<void> {
  return getAuth().authControllerResetPasswordV1(dto);
}

export function refresh(): Promise<LoginResponseDTO> {
  return getAuth().authControllerRefreshV1();
}
