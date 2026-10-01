import { ArrayNormalizer } from '../array.normalizer';

describe('ArrayNormalizer', () => {
  const normalizer = new ArrayNormalizer();

  it('returns null for null/undefined', () => {
    expect(normalizer.normalize(null)).toBeNull();
    expect(normalizer.normalize(undefined)).toBeNull();
  });

  it('returns non-array values untouched', () => {
    expect(normalizer.normalize('foo')).toBe('foo');
    expect(normalizer.normalize(42)).toBe(42);
  });

  it('reduces objects with an id to that id and sorts the result', () => {
    const result = normalizer.normalize([{ id: 3 }, { id: 1 }, { id: 2 }]);

    expect(result).toEqual([1, 2, 3]);
  });

  it('prefers id over uuid when both are present', () => {
    const result = normalizer.normalize([{ id: 1, uuid: 'a' }]);

    expect(result).toEqual([1]);
  });

  it('falls back to uuid when there is no id', () => {
    const result = normalizer.normalize([{ uuid: 'b' }, { uuid: 'a' }]);

    expect(result).toEqual(['a', 'b']);
  });

  // UserRoleEntity-shaped: composite primary key, no own id/uuid. Without
  // this fallback, two independently loaded (but otherwise identical)
  // snapshots normalize to mismatching JSON blobs and register as a
  // false-positive diff instead of comparing equal.
  it('falls back to roleId for join-row-shaped values with no id/uuid', () => {
    const result = normalizer.normalize([
      { userId: 4, roleId: 13 },
      { userId: 4, roleId: 7, role: { id: 7, name: 'Editor' } },
    ]);

    expect(result).toEqual([13, 7]);
  });

  it('two independently loaded snapshots of the same role set now compare equal', () => {
    const before = normalizer.normalize([{ userId: 4, roleId: 13 }]);
    const after = normalizer.normalize([
      { userId: 4, roleId: 13, role: { id: 13, name: 'Admin', permissions: [] } },
    ]);

    expect(before).toEqual(after);
  });

  it('falls back to a JSON string when none of id/uuid/roleId are present', () => {
    const result = normalizer.normalize([{ foo: 'bar' }]);

    expect(result).toEqual([JSON.stringify({ foo: 'bar' })]);
  });
});
