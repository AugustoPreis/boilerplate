import { ROLE_ADMIN } from '@boilerplate/shared';
import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

import { PermissionEntity } from '@modules/roles/entities/permission.entity';
import { RoleEntity } from '@modules/roles/entities/role.entity';

export class RolesSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(RoleEntity);
    const permissionRepository = this.dataSource.getRepository(PermissionEntity);

    let role = await roleRepository.findOne({
      where: { name: ROLE_ADMIN },
      relations: {
        permissions: true,
      },
    });

    if (!role) {
      role = roleRepository.create({
        uuid: uuidv7(),
        name: ROLE_ADMIN,
        description: 'Reserved role with full access to the platform.',
      });

      role = await roleRepository.save(role);
    }

    const permissions = await permissionRepository.find();

    role.permissions = permissions;

    await roleRepository.save(role);

    console.log('RolesSeeder: completed');
  }
}
