import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: CACHE_MANAGER, useValue: cacheManager }],
    }).compile();

    service = module.get(CacheService);
  });

  describe('get', () => {
    it('returns value on cache hit', async () => {
      cacheManager.get.mockResolvedValue({ data: 'test' });

      const result = await service.get('key');

      expect(result).toEqual({ data: 'test' });
    });

    it('returns null on cache miss', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.get('key');

      expect(result).toBeNull();
    });

    it('returns null on error', async () => {
      cacheManager.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.get('key');

      expect(result).toBeNull();
    });
  });

  describe('del', () => {
    it('calls cache del', async () => {
      cacheManager.del.mockResolvedValue(undefined);

      await service.del('key');

      expect(cacheManager.del).toHaveBeenCalledWith('key');
    });
  });
});
