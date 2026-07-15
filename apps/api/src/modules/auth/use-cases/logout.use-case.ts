import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '@core/redis/redis.constants';

@Injectable()
export class LogoutUseCase {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async execute(userUuid: string): Promise<void> {
    await this.redis.del(`auth:refresh:${userUuid}`);
  }
}
