# Arquitetura

## Camadas

Todo recurso HTTP segue o mesmo caminho:

```
Controller → Use-case → Repository → Entity (TypeORM)
```

- **Controller** — fino. Só extrai dados da request (`@Body`, `@Param`, `@Query`,
  `@CurrentUser`), aplica os decorators de autorização (`@RequirePermission` ou nenhum, ver
  [authorization.md](./authorization.md)) e delega para um use-case. Nunca contém regra de
  negócio.
- **Use-case** — uma classe por operação (`CreateUserUseCase`, `UpdateUserPasswordUseCase`,
  `UploadUserAvatarUseCase`...), cada uma com um único método público `execute(...)`. É aqui que
  mora a regra de negócio: validações, decisões, orquestração de repositories/serviços externos,
  chamadas a `AppException` em caso de erro.
- **Repository** — uma classe por entidade (`UsersRepository`, `RolesRepository`...), encapsula
  todo acesso ao TypeORM `Repository<T>`. Métodos de escrita usam `repo.save()`/`repo.remove()`/
  `repo.softRemove()` — nunca `repo.update()`/`repo.delete()`/`repo.softDelete()` (estilo
  query-builder) — porque só a forma baseada em instância popula `event.databaseEntity` no
  subscriber do TypeORM, que é o que a trilha de auditoria depende para saber o valor "antes" de
  uma mudança (ver [auditing.md](./auditing.md)).
- **Entity** — mapeamento TypeORM. Toda entidade de domínio estende `shared/entities/base.entity`
  (`id` incremental interno, `uuid` público, `createdAt`/`updatedAt`/`deletedAt`). UUIDs usados
  externamente (rotas, DTOs) são sempre `uuid`, nunca o `id` numérico — o `id` é um detalhe interno
  do banco.

DTOs de entrada (`CreateUserDTO`, etc.) e de saída (`UserResponseDTO`, com um `static from(entity)`)
ficam em `dtos/` dentro de cada módulo — ver [conventions.md](./conventions.md).

## `core/` vs `shared/` vs `modules/`

- **`core/`** — infraestrutura da aplicação: configuração (`core/config/*.config.ts` +
  `config.validation.ts`), banco (`core/database/`), i18n (`core/i18n/`), e integrações externas
  encapsuladas em módulos `@Global()` — `core/redis/`, `core/mail/`, `core/storage/`. Um módulo
  `core/` normalmente expõe um único serviço (ou um client cru atrás de um DI token, como
  `REDIS_CLIENT`) e é importado uma vez em `AppModule`; qualquer outro módulo o injeta livremente
  sem precisar reimportá-lo, por ser global.
- **`shared/`** — código de aplicação reutilizável entre módulos de domínio, mas que não é
  infraestrutura externa: guards (`JwtAuthGuard`, `PermissionsGuard`, `CsrfGuard`), decorators
  (`@CurrentUser`, `@RequirePermission`), exceptions (`AppException`), pipes, interceptors,
  serviços puros (`HashService`, `UuidService`), utils (`pagination.util.ts`,
  `object.util.ts`) e o motor de auditoria (`shared/audit/`, ver [auditing.md](./auditing.md)).
  Tudo em `SharedModule` é `@Global()`.
- **`modules/`** — os recursos de domínio propriamente ditos (`users`, `roles`, `auth`, `audit`).
  Cada um segue a estrutura descrita em [modules.md](./modules.md) e só depende de `core/`,
  `shared/` e, ocasionalmente, de outro módulo de domínio (import direto do repository/entity,
  nunca do controller).

Regra prática para decidir onde um arquivo novo entra: se ele fala com um sistema externo (SMTP,
S3, Redis, Postgres), é `core/`. Se é lógica de aplicação sem dono de domínio único, é `shared/`.
Se pertence a um recurso de negócio específico, é `modules/<recurso>/`.

## Quando delegar para colaboradores menores dentro de um use-case complexo

A maioria dos use-cases é uma classe só, com um `execute()` direto (ver o padrão em
[modules.md](./modules.md)). Quando um use-case cresce até o ponto de coordenar várias etapas
independentes — cada uma testável isoladamente, cada uma podendo variar por tipo de dado — vale a
pena quebrá-lo em colaboradores menores em vez de um método gigante com vários `if`.

O exemplo real disso no código é o **pipeline de auditoria**
(`shared/audit/pipeline/`, detalhado em [auditing.md](./auditing.md)): em vez de um único
`AuditPipelineService` com toda a lógica de diff/normalização/formatação/tradução misturada, cada
etapa é uma classe `@Injectable()` própria (`LoadMetadataStage`, `NormalizeStage`, `DiffStage`,
`ResolveRelationsStage`, `TranslateStage`, `FormatStage`, `BuildDtoStage`), com uma assinatura
uniforme `execute(context) → context`, e o serviço orquestrador só encadeia as chamadas — nenhuma
lógica de campo mora nele.

A parte mais importante do padrão: quando o comportamento de uma etapa precisa variar por campo
(cada campo de uma entidade pode ter seu próprio formatter/normalizer/relation-resolver, definidos
via `@Audit({ formatter: EnumFormatter })`), a etapa resolve a classe certa em tempo de execução via
`ModuleRef.get(TipoResolvido, { strict: false })`, em vez de um `switch` gigante. Isso permite que
um módulo de domínio (ex. `roles`) registre seu próprio `PermissionsRelationResolver` sem que o
motor genérico (`AuditEngineModule`) precise conhecer `roles` — o motor só sabe resolver "algum
`Type<IAuditFormatter>`", quem ele é fica a cargo de quem decorou o campo.

Use esse padrão quando: (1) a lógica tem etapas sequenciais e independentes o suficiente para
testar cada uma isoladamente, e (2) parte do comportamento precisa ser plugável por quem consome o
mecanismo, sem que o orquestrador precise conhecer cada variação de antemão. Para o caso comum (um
use-case com uma sequência linear de passos que não precisa ser plugável por terceiros), um
método privado por passo já é suficiente — não introduza uma classe/arquivo novo para isso (ver
`UpdateUserPasswordUseCase`, que resolve isso com métodos privados simples).

## Requisição HTTP: o que acontece antes do controller

`main.ts` registra, nesta ordem: `helmet()`, `compression()`, `cookieParser()`, CORS
(`app.corsOrigin`), prefixo global (`api`) + versionamento por URI (`/v1/...`), um
`ValidationPipe` global (`whitelist`, `transform`, mensagens de erro traduzidas via
`i18nFieldValidationExceptionFactory`) e um `HttpExceptionFilter` global que serializa toda
`HttpException` (incluindo `AppException` e erros de validação) num envelope de resposta único.

Guards globais (`AppModule`, ordem importa — são executados na ordem em que aparecem em
`providers`): `AppThrottlerGuard` → `JwtAuthGuard` → `PermissionsGuard` → `CsrfGuard`. Um endpoint
público precisa do decorator `@Public()`; um endpoint que não exige RBAC granular (mas ainda exige
autenticação) simplesmente omite `@RequirePermission` (ver [authorization.md](./authorization.md)).
