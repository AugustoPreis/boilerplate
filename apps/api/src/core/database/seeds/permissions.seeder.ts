import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

import { PermissionEntity } from '@modules/roles/entities/permission.entity';

const DEFAULT_RESOURCES = ['users', 'roles', 'permissions', 'audit'];
const DEFAULT_ACTIONS = ['create', 'read', 'update', 'delete'];

export class PermissionsSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(PermissionEntity);

    for (const resource of DEFAULT_RESOURCES) {
      for (const action of DEFAULT_ACTIONS) {
        const exists = await repository.exists({
          where: { resource, action },
        });

        if (!exists) {
          await repository.save({
            uuid: uuidv7(),
            resource,
            action,
          });
        }
      }
    }

    console.log('PermissionsSeeder: completed');
  }
}
