import { Test, TestingModule } from '@nestjs/testing';
import { validate as isUuid } from 'uuid';

import { UuidService } from './uuid.service';

describe('UuidService', () => {
  let service: UuidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidService],
    }).compile();

    service = module.get<UuidService>(UuidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should return a valid UUID v7 by default', () => {
      const id = service.generate();
      expect(isUuid(id)).toBe(true);
    });

    it('should return a valid UUID when version is v7', () => {
      const id = service.generate('v7');
      expect(isUuid(id)).toBe(true);
    });

    it('should return a valid UUID when version is v4', () => {
      const id = service.generate('v4');
      expect(isUuid(id)).toBe(true);
    });

    it('should produce unique UUIDs on each call', () => {
      const id1 = service.generate();
      const id2 = service.generate();
      expect(id1).not.toBe(id2);
    });
  });
});
