import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { IPaginatedResult } from '@shared/interfaces';
import { buildPaginatedResult, buildSkip } from '@shared/utils/pagination.util';

import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repo: Repository<PermissionEntity>,
  ) {}

  findById(id: number): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUuid(uuid: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { uuid } });
  }

  findByKey(key: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { key } });
  }

  findByKeys(keys: string[]): Promise<PermissionEntity[]> {
    if (!keys.length) return Promise.resolve([]);

    return this.repo.findBy({ key: In(keys) });
  }

  async findAll(page: number, perPage: number): Promise<IPaginatedResult<PermissionEntity>> {
    const [data, total] = await this.repo.findAndCount({
      skip: buildSkip(page, perPage),
      take: perPage,
      order: { key: 'ASC' },
    });

    return buildPaginatedResult(data, total, page, perPage);
  }

  create(data: Partial<PermissionEntity>): Promise<PermissionEntity> {
    const entity = this.repo.create(data);

    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<PermissionEntity>): Promise<PermissionEntity> {
    await this.repo.update(id, data);

    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
