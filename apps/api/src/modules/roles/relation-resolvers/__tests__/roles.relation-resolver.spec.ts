import { mockDeep } from 'jest-mock-extended';

import { RoleEntity } from '../../entities/role.entity';
import { RolesRepository } from '../../repositories/roles.repository';
import { RolesRelationResolver } from '../roles.relation-resolver';

describe('RolesRelationResolver', () => {
  const rolesRepository = mockDeep<RolesRepository>();
  const resolver = new RolesRelationResolver(rolesRepository);
  const locale = 'pt-BR';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves to an empty string when the id list is empty, since that is a valid "no roles" state', async () => {
    const result = await resolver.resolve([], locale);

    expect(result).toBe('');
    expect(rolesRepository.findByIds).not.toHaveBeenCalled();
  });

  it('resolves numeric ids into a comma-joined list of role names', async () => {
    const roles = [{ id: 1, name: 'Admin' } as RoleEntity, { id: 2, name: 'Editor' } as RoleEntity];

    rolesRepository.findByIds.mockResolvedValue(roles);

    const result = await resolver.resolve([1, 2], locale);

    expect(rolesRepository.findByIds).toHaveBeenCalledWith([1, 2]);
    expect(result).toBe('Admin, Editor');
  });

  it('wraps a single non-array value into a one-element id list', async () => {
    const role = { id: 3, name: 'Viewer' } as RoleEntity;

    rolesRepository.findByIds.mockResolvedValue([role]);

    const result = await resolver.resolve(3, locale);

    expect(rolesRepository.findByIds).toHaveBeenCalledWith([3]);
    expect(result).toBe('Viewer');
  });

  it('filters out non-finite values before querying the repository', async () => {
    rolesRepository.findByIds.mockResolvedValue([{ id: 1, name: 'Admin' } as RoleEntity]);

    await resolver.resolve(['1', 'not-a-number', undefined], locale);

    expect(rolesRepository.findByIds).toHaveBeenCalledWith([1]);
  });

  it('returns the raw value untouched when no matching roles are found', async () => {
    rolesRepository.findByIds.mockResolvedValue([]);

    const value = [999];
    const result = await resolver.resolve(value, locale);

    expect(result).toBe(value);
  });
});
