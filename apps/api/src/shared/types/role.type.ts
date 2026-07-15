// Papéis de autorização são 100% dirigidos a dados (entidades Role/Permission,
// Fase 2) — não existe enum fixo de papéis de negócio no código. O único
// valor especial é ROLE_ADMIN (bypass total), importado de @boilerplate/shared
// para que backend e frontend nunca divirjam sobre esse nome reservado.
export type RoleType = string;
