import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { HashService } from './hash.service';

describe('HashService', () => {
  let service: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(10) },
        },
      ],
    }).compile();

    service = module.get<HashService>(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should return a hashed string different from the input', async () => {
      const plain = 'my-password';
      const hashed = await service.hash(plain);
      expect(hashed).not.toBe(plain);
      expect(typeof hashed).toBe('string');
    });

    it('should produce different hashes for the same input', async () => {
      const plain = 'my-password';
      const hash1 = await service.hash(plain);
      const hash2 = await service.hash(plain);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching plain text and hash', async () => {
      const plain = 'my-password';
      const hashed = await service.hash(plain);
      expect(await service.compare(plain, hashed)).toBe(true);
    });

    it('should return false for non-matching plain text and hash', async () => {
      const hashed = await service.hash('correct-password');
      expect(await service.compare('wrong-password', hashed)).toBe(false);
    });
  });
});
