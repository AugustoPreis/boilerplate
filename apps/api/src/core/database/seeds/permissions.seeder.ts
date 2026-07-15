import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

const DEFAULT_PERMISSIONS = ['users:read', 'users:write', 'roles:read', 'roles:write'];

export class PermissionsSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    for (const key of DEFAULT_PERMISSIONS) {
      const existing = await this.dataSource.query<unknown[]>(
        'SELECT id FROM permissions WHERE key = $1',
        [key],
      );

      if (!existing.length) {
        await this.dataSource.query('INSERT INTO permissions (uuid, key) VALUES ($1, $2)', [
          uuidv7(),
          key,
        ]);
      }
    }

    console.log('PermissionsSeeder: completed');
  }
}
