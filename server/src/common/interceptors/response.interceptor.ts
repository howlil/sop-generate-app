import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface ApiResponse<T> {
    success : boolean;
    message : string;
    data : T;
}

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> 
{
 
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<ApiResponse<T>> | 
       Promise<Observable<ApiResponse<T>>>
    {
        return next.handle().pipe(
            map((data: any) => ({
                success : true,
                message: data?.message ?? 'OK',
                data: data?.data ?? data
            })),
        );
    }
}