import { getAvatarStorageKey } from '../avatar-storage-key.util';

describe('getAvatarStorageKey', () => {
  it('builds a deterministic key from the user uuid and extension', () => {
    expect(getAvatarStorageKey('user-uuid', 'png')).toBe('users/avatars/user-uuid.png');
  });

  it('reflects the extension for a different mimetype-derived value', () => {
    expect(getAvatarStorageKey('user-uuid', 'jpg')).toBe('users/avatars/user-uuid.jpg');
  });

  it('produces the same key for the same uuid and extension', () => {
    const first = getAvatarStorageKey('same-uuid', 'webp');
    const second = getAvatarStorageKey('same-uuid', 'webp');

    expect(first).toBe(second);
  });
});
