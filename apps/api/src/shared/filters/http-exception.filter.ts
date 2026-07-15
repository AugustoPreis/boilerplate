import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

import { AppException } from '../exceptions/app.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const i18n = I18nContext.current(host);

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: unknown;
    let code: string | undefined;

    if (exception instanceof AppException) {
      message = i18n
        ? i18n.translate(exception.i18nKey, { args: exception.args })
        : exception.i18nKey;
      code = exception.code;
    } else {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const body = exceptionResponse as Record<string, unknown>;
        message = body.message ?? body;
        code = body.code as string | undefined;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(code ? { code } : {}),
    });
  }
}
