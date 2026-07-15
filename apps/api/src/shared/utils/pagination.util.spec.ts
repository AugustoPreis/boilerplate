import { buildPaginatedResult, buildSkip } from './pagination.util';

describe('buildPaginatedResult', () => {
  it('should build a paginated result with correct meta', () => {
    const data = [1, 2, 3];
    const result = buildPaginatedResult(data, 30, 2, 10);

    expect(result.data).toEqual(data);
    expect(result.meta.total).toBe(30);
    expect(result.meta.page).toBe(2);
    expect(result.meta.perPage).toBe(10);
    expect(result.meta.lastPage).toBe(3);
  });

  it('should compute lastPage as ceil(total / perPage)', () => {
    const result = buildPaginatedResult([], 25, 1, 10);
    expect(result.meta.lastPage).toBe(3);
  });

  it('should set lastPage to 1 when total is 0', () => {
    const result = buildPaginatedResult([], 0, 1, 10);
    expect(result.meta.lastPage).toBe(0);
  });

  it('should preserve exact data reference', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = buildPaginatedResult(data, 2, 1, 10);
    expect(result.data).toBe(data);
  });
});

describe('buildSkip', () => {
  it('should return 0 for page 1', () => {
    expect(buildSkip(1, 10)).toBe(0);
  });

  it('should return perPage for page 2', () => {
    expect(buildSkip(2, 10)).toBe(10);
  });

  it('should compute skip correctly for arbitrary pages', () => {
    expect(buildSkip(5, 20)).toBe(80);
  });
});
