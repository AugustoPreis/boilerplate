# Autorização (RBAC)

## Modelo

- **`PermissionEntity`** — um par `resource:action` (ex. `users:read`), com unicidade garantida
  por um índice composto único `(resource, action)` no banco. Recursos e ações hoje seguem um
  produto cartesiano fixo, semeado por `PermissionsSeeder`: recursos `users`, `roles`,
  `permissions`, `audit`; ações `create`, `read`, `update`, `delete`.
- **`RoleEntity`** — um nome, uma descrição opcional, e uma relação `ManyToMany` com
  `PermissionEntity` (`role_permissions`). O campo `isReserved` marca papéis geridos pelo sistema
  (hoje só o `admin`, criado por `RolesSeeder` com todas as permissões existentes) — nunca
  editável via DTO, e `DeleteRoleUseCase` recusa deletar um papel reservado.
- **`UserRoleEntity`** — tabela de junção `user ↔ role`. Um usuário pode ter múltiplos papéis.

## Permissões efetivas

`getEffectivePermissions(userRoles)` (`modules/users/utils/effective-permissions.util.ts`) achata
todos os papéis de um usuário num `Set<string>` de chaves `resource:action`, deduplicado:

```ts
export function getEffectivePermissions(userRoles: UserRoleEntity[]): string[] {
  const keys = new Set<string>();
  for (const userRole of userRoles) {
    for (const permission of userRole.role.permissions) {
      keys.add(`${permission.resource}:${permission.action}`);
    }
  }
  return [...keys];
}
```

Essa é a função central: qualquer lugar que precise saber "o que este usuário pode fazer" (o guard,
e o endpoint `GET /auth/me`) passa pelos mesmos dados de entrada e produz a mesma lista.

## Protegendo um endpoint

```ts
@Get()
@RequirePermission('users', 'read')
findAll(@Query() query: UserQueryDTO) { ... }
```

`@RequirePermission(resource, action)` só grava metadata (`SetMetadata`) — quem interpreta é o
`PermissionsGuard`, registrado globalmente em `AppModule` (depois de `JwtAuthGuard`, antes de
`CsrfGuard`). Se o handler/controller **não** tem `@RequirePermission`, o guard não bloqueia nada
(`if (!required) return true`) — mas o endpoint continua exigindo autenticação, porque
`JwtAuthGuard` roda antes na cadeia. Use essa omissão apenas para ações sobre o próprio usuário
autenticado (ex. `PUT /users/me/password`, `POST /users/me/avatar`), sempre com um comentário de
uma linha explicando o motivo — nunca por esquecimento.

O guard **não confia em nada cacheado no JWT**: em toda requisição protegida, ele busca o
`UserEntity` (com `userRoles` — carregado eager) de novo no banco e recalcula as permissões
efetivas. Isso é proposital — uma mudança de papel/permissão feita agora tem efeito imediato na
próxima requisição, sem precisar invalidar tokens.

## Endpoint público

Para um endpoint que não exige autenticação nenhuma (não passa nem pelo `JwtAuthGuard`), use
`@Public()` (`shared/decorators/public.decorator.ts`) — é isso, não a ausência de
`@RequirePermission`, que remove a exigência de token. Único uso hoje: `GET /health`.

## Gerenciando papéis e permissões

`RolesModule` expõe CRUD completo de `roles` e `permissions`, mais dois endpoints especiais:

- `PUT /v1/roles/:uuid/permissions` (`UpdateRolePermissionsUseCase`) — **substitui** o conjunto de
  permissões de um papel por inteiro (não é incremental; envie a lista completa desejada).
- `POST /v1/roles/:uuid/clone` (`CloneRoleUseCase`) — cria um papel novo copiando as permissões do
  papel de origem por referência; recebe o mesmo DTO de criação (`nome`/`descrição` novos
  obrigatórios).

Como em qualquer outro módulo, `RolesRepository`/`PermissionsRepository` escrevem via
`save()`/`remove()`, nunca `update()`/`delete()` — necessário para a trilha de auditoria capturar o
estado "antes" (ver [auditing.md](./auditing.md)).
