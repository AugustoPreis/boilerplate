import { HttpException, HttpStatus } from '@nestjs/common';

export interface IAppExceptionOptions {
  args?: Record<string, unknown>;
  code?: string;
}

export class AppException extends HttpException {
  public readonly i18nKey: string;
  public readonly args?: Record<string, unknown>;
  public readonly code?: string;

  constructor(i18nKey: string, status: HttpStatus, options?: IAppExceptionOptions) {
    super({ i18nKey, code: options?.code }, status);

    this.i18nKey = i18nKey;
    this.args = options?.args;
    this.code = options?.code;
  }

  static from(i18nKey: string, status: HttpStatus, options?: IAppExceptionOptions): AppException {
    return new AppException(i18nKey, status, options);
  }
}
