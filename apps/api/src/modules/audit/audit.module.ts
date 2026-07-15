import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@shared/shared.module';

import { AuditController } from './controllers/audit.controller';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { AuditService } from './services/audit.service';
import { FindAuditLogUseCase } from './use-cases/find-audit-log.use-case';
import { ListAuditLogsUseCase } from './use-cases/list-audit-logs.use-case';

@Global()
@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([AuditLogEntity])],
  controllers: [AuditController],
  providers: [AuditLogsRepository, AuditService, ListAuditLogsUseCase, FindAuditLogUseCase],
  exports: [AuditService],
})
export class AuditModule {}
