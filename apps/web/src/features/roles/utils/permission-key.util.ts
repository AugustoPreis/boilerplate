export function permissionKey(resource: string, action: string): string {
  return `${resource}:${action}`;
}
