import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    service = new AuditService({ create: jest.fn() } as never, {
      generate: jest.fn().mockReturnValue('uuid'),
    });
  });

  describe('extractEntityName', () => {
    it('extracts entity from /api/v1/resources', () => {
      expect(service.extractEntityName('/api/v1/resources')).toBe('resources');
    });

    it('extracts entity from /api/v1/resources/uuid/items', () => {
      expect(service.extractEntityName('/api/v1/resources/abc-123/items')).toBe('resources');
    });

    it('returns unknown for unrecognized paths', () => {
      expect(service.extractEntityName('/health')).toBe('unknown');
    });

    it('extracts from /api/v1/audit/logs', () => {
      expect(service.extractEntityName('/api/v1/audit/logs')).toBe('audit');
    });
  });
});
