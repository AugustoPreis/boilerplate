// Papéis de autorização são dirigidos a dados a partir da Fase 2 (módulo de auth/roles).
// Nesta fase o enum contém apenas o placeholder de administrador, usado pela
// infraestrutura de guards/decorators já presente (ex. proteção do endpoint de audit logs).
export enum ERoles {
  ADMIN = 'ADMIN',
}

export type RoleType = (typeof ERoles)[keyof typeof ERoles];
