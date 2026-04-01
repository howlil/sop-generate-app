import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponsePayload<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponsePayload<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponsePayload<T>> {
    return next.handle().pipe(
      map((payload: any) => ({
        success: true,
        message: payload?.message ?? 'OK',
        data: payload?.data ?? payload,
      })),
    );
  }
}