import { ROLE_ADMIN } from '@boilerplate/shared';
import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

interface IIdRow {
  id: number;
}

export class RolesSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleId = await this.ensureAdminRole();
    await this.assignAllPermissions(roleId);

    console.log('RolesSeeder: completed');
  }

  private async ensureAdminRole(): Promise<number> {
    const existing = await this.dataSource.query<IIdRow[]>('SELECT id FROM roles WHERE name = $1', [
      ROLE_ADMIN,
    ]);

    if (existing.length) {
      return existing[0].id;
    }

    const inserted = await this.dataSource.query<IIdRow[]>(
      `INSERT INTO roles (uuid, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [uuidv7(), ROLE_ADMIN, 'Papel reservado com acesso total à plataforma.'],
    );

    return inserted[0].id;
  }

  private async assignAllPermissions(roleId: number): Promise<void> {
    const permissions = await this.dataSource.query<IIdRow[]>('SELECT id FROM permissions');

    for (const permission of permissions) {
      await this.dataSource.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [roleId, permission.id],
      );
    }
  }
}
