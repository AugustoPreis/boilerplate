import type { ErrorCode } from '@boilerplate/shared';
import type { AxiosError } from 'axios';

export interface IApiErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  // Validation errors (422) come back as a flat string[] — the API's
  // exception filter never attaches which field each message belongs to,
  // so there's no way to route them into individual form fields yet.
  message: string | string[];
  code?: ErrorCode;
}

export interface IAppError {
  statusCode: number;
  message: string;
  code?: ErrorCode;
}

export type ApiError = AxiosError<IApiErrorResponse>;
