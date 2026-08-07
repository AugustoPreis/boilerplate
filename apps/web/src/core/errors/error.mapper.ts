import type { AxiosError } from 'axios';

import { AppError } from './app.error';
import type { IApiErrorResponse } from './error.types';

export function mapAxiosErrorToAppError(error: AxiosError<IApiErrorResponse>): AppError {
  const response = error.response?.data;

  if (response) {
    return new AppError(response.message, response.statusCode, response.code);
  }

  return new AppError(error.message, 0);
}
