import { BadRequestException } from '@nestjs/common';

import { ParseUuidPipe } from './parse-uuid.pipe';

describe('ParseUuidPipe', () => {
  let pipe: ParseUuidPipe;

  beforeEach(() => {
    pipe = new ParseUuidPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return the value unchanged when it is a valid UUID v4', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      expect(pipe.transform(id)).toBe(id);
    });

    it('should return the value unchanged when it is a valid UUID v7', () => {
      const id = '01956eb8-1234-7abc-8def-123456789012';
      expect(pipe.transform(id)).toBe(id);
    });

    it('should throw BadRequestException for a non-UUID string', () => {
      expect(() => pipe.transform('not-a-uuid')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for an empty string', () => {
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for a numeric string', () => {
      expect(() => pipe.transform('12345')).toThrow(BadRequestException);
    });
  });
});
