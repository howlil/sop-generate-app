import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCodes, ErrorCode } from '../constants/error-codes';
import { AuthMessages, GenericMessages, OpdMessages, UserMessages } from '../messages';

interface ExceptionResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

const CONFLICT_MESSAGE_CODE_MAP: Record<string, ErrorCode> = {
  [UserMessages.EMAIL_EXISTS]: ErrorCodes.USER_EMAIL_EXISTS,
  [UserMessages.NIP_EXISTS]: ErrorCodes.USER_NIP_EXISTS,
  [OpdMessages.OPD_HAS_ACTIVE_EVALUATION]: ErrorCodes.CONFLICT,
};

const NOT_FOUND_MESSAGE_CODE_MAP: Record<string, ErrorCode> = {
  [UserMessages.USER_NOT_FOUND]: ErrorCodes.USER_NOT_FOUND,
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Terjadi kesalahan pada server';
    let errors: string[] | null = null;
    let code: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const res = exceptionResponse as ExceptionResponse;
      message = Array.isArray(res.message)
        ? 'Validasi gagal'
        : (res.message ?? message);
      errors = Array.isArray(res.message) ? res.message : null;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Error: ${exception.message}`, exception.stack);
    }

    // Map error messages to structured error codes
    code = this.mapErrorCode(message, status);

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapErrorCode(message: string, status: number): ErrorCode {
    const normalizedMessage = message.trim();

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCodes.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        if (NOT_FOUND_MESSAGE_CODE_MAP[normalizedMessage]) {
          return NOT_FOUND_MESSAGE_CODE_MAP[normalizedMessage];
        }
        return ErrorCodes.NOT_FOUND;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCodes.TOO_MANY_REQUESTS;
      case HttpStatus.CONFLICT:
        if (CONFLICT_MESSAGE_CODE_MAP[normalizedMessage]) {
          return CONFLICT_MESSAGE_CODE_MAP[normalizedMessage];
        }
        if (
          normalizedMessage.startsWith('OPD ini sudah memiliki') &&
          (normalizedMessage.includes('KEPALA_OPD') ||
            normalizedMessage.includes('KOORDINATOR_TIM_PENYUSUN'))
        ) {
          return ErrorCodes.SINGLETON_CONSTRAINT_VIOLATION;
        }
        if (
          normalizedMessage === GenericMessages.CONFLICT ||
          normalizedMessage.includes('sudah ada')
        ) {
          return ErrorCodes.TIM_ALREADY_EXISTS;
        }
        return ErrorCodes.CONFLICT;
      default:
        return status >= 500
          ? ErrorCodes.INTERNAL_SERVER_ERROR
          : ErrorCodes.CONFLICT;
    }
  }
}
