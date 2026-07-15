import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPaginatedResult } from '@shared/interfaces';
import { buildPaginatedResult, buildSkip } from '@shared/utils/pagination.util';

import { AuditLogEntity } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogsRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  async findByUuid(uuid: string): Promise<AuditLogEntity | null> {
    return this.repo.findOne({ where: { uuid } });
  }

  async search(
    page: number,
    perPage: number,
    filters: {
      userId?: string;
      entityName?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<IPaginatedResult<AuditLogEntity>> {
    const qb = this.repo.createQueryBuilder('log');

    if (filters.userId) {
      qb.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.entityName) {
      qb.andWhere('log.entityName = :entityName', { entityName: filters.entityName });
    }

    if (filters.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: `${filters.endDate} 23:59:59` });
    }

    qb.orderBy('log.createdAt', 'DESC').skip(buildSkip(page, perPage)).take(perPage);

    const [data, total] = await qb.getManyAndCount();

    return buildPaginatedResult(data, total, page, perPage);
  }

  async create(data: Partial<AuditLogEntity>): Promise<void> {
    const entity = this.repo.create(data);

    await this.repo.save(entity);
  }
}
