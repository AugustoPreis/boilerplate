import { MigrationInterface, QueryRunner } from 'typeorm';

export class Rbac1752600000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGSERIAL PRIMARY KEY,
        uuid UUID NOT NULL,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id BIGSERIAL PRIMARY KEY,
        uuid UUID NOT NULL,
        key VARCHAR(150) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS ux_roles_uuid ON roles(uuid)`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_permissions_uuid ON permissions(uuid)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
  }
}
