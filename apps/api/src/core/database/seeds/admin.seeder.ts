import { ROLE_ADMIN } from '@boilerplate/shared';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

interface IIdRow {
  id: number;
}

const DEFAULT_ADMIN_EMAIL = 'admin@boilerplate.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';
const BCRYPT_ROUNDS = 12;

export class AdminSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;

    const existing = await this.dataSource.query<IIdRow[]>(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [adminEmail],
    );

    if (existing.length) {
      console.log('AdminSeeder: admin user already exists, skipping');
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
    const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

    const userRows = await this.dataSource.query<IIdRow[]>(
      `INSERT INTO users (uuid, email, password_hash, name, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
       RETURNING id`,
      [uuidv7(), adminEmail, passwordHash, 'Administrador'],
    );
    const userId = userRows[0].id;

    const roleRows = await this.dataSource.query<IIdRow[]>(
      'SELECT id FROM roles WHERE name = $1 LIMIT 1',
      [ROLE_ADMIN],
    );

    if (roleRows.length) {
      await this.dataSource.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
        userId,
        roleRows[0].id,
      ]);
    }

    console.log(`AdminSeeder: admin user created — ${adminEmail}`);
  }
}
