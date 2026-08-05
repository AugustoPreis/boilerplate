export function getAvatarStorageKey(uuid: string, extension: string): string {
  return `users/avatars/${uuid}.${extension}`;
}
