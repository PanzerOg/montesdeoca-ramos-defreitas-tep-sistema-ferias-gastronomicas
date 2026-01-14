import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

interface UserPayload {
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user?: UserPayload;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;

        const userLog = user
          ? `User: ${user.email} (${user.role})`
          : 'User: Anonymous';

        this.logger.log(`${method} ${url} - ${userLog} - ${delay}ms`);
      }),
    );
  }
}
