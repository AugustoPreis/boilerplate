import { mockDeep } from 'jest-mock-extended';

import { I18nAuditTranslator } from '@shared/audit/translators/i18n-audit.translator';

import { PermissionEntity } from '../../entities/permission.entity';
import { PermissionsRepository } from '../../repositories/permissions.repository';
import { PermissionsRelationResolver } from '../permissions.relation-resolver';

describe('PermissionsRelationResolver', () => {
  const permissionsRepository = mockDeep<PermissionsRepository>();
  const translator = mockDeep<I18nAuditTranslator>();
  const resolver = new PermissionsRelationResolver(permissionsRepository, translator);
  const locale = 'pt-BR';

  beforeEach(() => {
    jest.clearAllMocks();
    translator.translateEnum.mockImplementation((_module, _entity, _field, value) => value);
  });

  it('resolves to an empty string when the id list is empty, since that is a valid "no permissions" state', async () => {
    const result = await resolver.resolve([], locale);

    expect(result).toBe('');
    expect(permissionsRepository.findByIds).not.toHaveBeenCalled();
  });

  it('groups permissions by resource, with actions in a fixed order, one line per resource', async () => {
    const permissions = [
      { id: 1, resource: 'users', action: 'delete' } as PermissionEntity,
      { id: 2, resource: 'users', action: 'read' } as PermissionEntity,
    ];

    permissionsRepository.findByIds.mockResolvedValue(permissions);

    const result = await resolver.resolve([1, 2], locale);

    expect(permissionsRepository.findByIds).toHaveBeenCalledWith([1, 2]);
    expect(result).toBe('users: read, delete');
    expect(translator.translateEnum).toHaveBeenCalledWith(
      'roles',
      'permission',
      'resource',
      'users',
      locale,
    );
    expect(translator.translateEnum).toHaveBeenCalledWith(
      'roles',
      'permission',
      'action',
      'read',
      locale,
    );
  });

  it('sorts resource groups and joins them with a newline, one group per line', async () => {
    const permissions = [
      { id: 1, resource: 'users', action: 'read' } as PermissionEntity,
      { id: 2, resource: 'audit', action: 'read' } as PermissionEntity,
    ];

    permissionsRepository.findByIds.mockResolvedValue(permissions);

    const result = await resolver.resolve([1, 2], locale);

    expect(result).toBe('audit: read\nusers: read');
  });

  it('wraps a single non-array value into a one-element id list', async () => {
    const permission = { id: 3, resource: 'roles', action: 'delete' } as PermissionEntity;

    permissionsRepository.findByIds.mockResolvedValue([permission]);

    const result = await resolver.resolve(3, locale);

    expect(permissionsRepository.findByIds).toHaveBeenCalledWith([3]);
    expect(result).toBe('roles: delete');
  });

  it('filters out non-finite values before querying the repository', async () => {
    permissionsRepository.findByIds.mockResolvedValue([
      { id: 1, resource: 'users', action: 'read' } as PermissionEntity,
    ]);

    await resolver.resolve(['1', 'not-a-number', undefined], locale);

    expect(permissionsRepository.findByIds).toHaveBeenCalledWith([1]);
  });

  it('returns the raw value untouched when no matching permissions are found', async () => {
    permissionsRepository.findByIds.mockResolvedValue([]);

    const value = [999];
    const result = await resolver.resolve(value, locale);

    expect(result).toBe(value);
  });
});
