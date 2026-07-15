import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuditService } from '../../modules/audit/services/audit.service';
import { IJwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

const AUDITABLE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Optional() private readonly auditService?: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!AUDITABLE_METHODS.has(request.method) || !this.auditService) {
      return next.handle();
    }

    const userId = (request.user as IJwtPayload)?.sub ?? null;
    const entityName = this.auditService.extractEntityName(request.url);
    const contextOldData = request.auditContext?.oldData ?? null;

    return next.handle().pipe(
      tap((responseData) => {
        const svc = this.auditService!;
        const entityId = svc.extractEntityId(responseData) ?? null;
        const newEntity = svc.extractEntityData(responseData);

        let oldData;
        let newData;

        if (request.method === 'POST') {
          oldData = null;
          newData = newEntity;
        } else if (request.method === 'DELETE') {
          oldData = contextOldData;
          newData = null;
        } else {
          // PATCH / PUT
          if (contextOldData && newEntity) {
            const diff = svc.diffData(contextOldData, newEntity);

            oldData = Object.keys(diff.oldData).length ? diff.oldData : null;
            newData = Object.keys(diff.newData).length ? diff.newData : null;
          } else {
            oldData = null;
            newData = newEntity;
          }
        }

        void svc.log({
          userId,
          action: request.method,
          entityName,
          entityId,
          oldData,
          newData,
        });
      }),
    );
  }
}
