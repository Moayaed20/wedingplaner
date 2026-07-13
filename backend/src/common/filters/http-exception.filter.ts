import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const res: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: res?.message || exception.message || 'Internal server error',
      errors: res?.message && Array.isArray(res.message) ? res.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
