import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

// Lista mínima para o RBAC funcionar de ponta a ponta — sem nada de negócio.
// Qualquer módulo novo adiciona suas próprias chaves aqui ou via migration própria.
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
