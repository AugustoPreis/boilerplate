import type { ErrorCode } from '@boilerplate/shared';

export interface IApiErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  code?: ErrorCode;
}

export interface IAppError {
  statusCode: number;
  message: string;
  code?: ErrorCode;
}
