import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../http/api-response.types';
import { RequestWithId } from '../middleware/request-id.middleware';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let error = HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
    let errors: string[] | undefined;

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const body = exceptionResponse as Record<string, unknown>;
        const rawMessage = body.message;
        error =
          typeof body.error === 'string'
            ? body.error
            : HttpStatus[statusCode] ?? 'HttpException';

        if (Array.isArray(rawMessage)) {
          message = 'Validation failed';
          errors = rawMessage.filter(
            (item): item is string => typeof item === 'string',
          );
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else if (typeof exception.message === 'string') {
          message = exception.message;
        }
      }
    }

    const logContext = {
      requestId: request.requestId,
      method: request.method,
      path: this.getPath(request),
      statusCode,
    };

    if (statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;

      this.logger.error(JSON.stringify(logContext), stack);
    } else {
      this.logger.warn(JSON.stringify(logContext));
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: this.getPath(request),
      requestId: request.requestId,
    };

    if (errors?.length) {
      errorResponse.errors = errors;
    }

    if (!response.headersSent) {
      response.status(statusCode).json(errorResponse);
    }
  }

  private getPath(request: RequestWithId): string {
    return request.originalUrl?.split('?')[0] ?? request.url;
  }
}
