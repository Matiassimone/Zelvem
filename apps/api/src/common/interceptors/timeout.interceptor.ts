import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { catchError, type Observable, throwError, timeout, TimeoutError } from 'rxjs'

/** Requests that exceed this window are cut off — nothing in the API should run this long. */
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Global request timeout: converts a hung handler into a 408 instead of an
 * open socket. Long work belongs in BullMQ jobs, never in a request.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((error: unknown) =>
        throwError(() => (error instanceof TimeoutError ? new RequestTimeoutException() : error)),
      ),
    )
  }
}
