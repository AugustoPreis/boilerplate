# Trilha de auditoria

Toda mudança em um campo decorado com `@Audit()` de uma entidade decorada com `@AuditEntity()` é
capturada automaticamente, sem nenhum código explícito no use-case que fez a mudança — desde que a
escrita passe por `repo.save()`/`repo.remove()`/`repo.softRemove()` (nunca pelo estilo
query-builder `repo.update()`/`repo.delete()`/`repo.softDelete()`, que nunca carrega o valor
"antes" da mudança).

## Duas partes: motor genérico vs. módulo de persistência

- **`shared/audit/`** — o motor: decorators, registry de metadata, pipeline de estágios,
  formatters/normalizers/tradutor. Não conhece TypeORM nem HTTP; é reutilizável por qualquer
  entidade de qualquer módulo.
- **`modules/audit/`** — a parte concreta: o subscriber do TypeORM, o listener de evento, a
  entidade `AuditLogEntity` (schema `audit`, tabela `audit_logs`), o repository, os use-cases de
  leitura/escrita e o controller (`GET /v1/audit-logs`, `GET /v1/audit-logs/:uuid`, ambos atrás de
  `RequirePermission('audit', 'read')`).

## Decorando uma entidade

```ts
@AuditEntity({ name: 'user', module: 'users' })
@Entity('users')
export class UserEntity extends BaseEntity {
  @Audit()
  @Column({ length: 255, unique: true })
  email!: string;

  // Nunca auditado: é um segredo, não só um dado pessoal.
  @Audit({ ignore: true })
  @Column({ name: 'password_hash', type: 'text', select: false })
  passwordHash!: string;

  @Audit({ formatter: EnumFormatter })
  @Column({ type: 'enum', enum: EUserStatus, ... })
  status!: EUserStatus;
}
```

- `name` é a chave usada para buscar a entidade de novo depois (na leitura); `module` é o
  namespace de i18n onde os rótulos/traduções desse tipo de entidade vivem (ver abaixo).
- Todo campo que deve aparecer no diff precisa de `@Audit()`. Campo sem o decorator é
  simplesmente ignorado (não gera erro) — mas prefira `@Audit({ ignore: true })` com um comentário
  explicando o motivo quando a omissão não é óbvia (segredo, relação estruturalmente inobservável
  pelo subscriber, etc.), para deixar claro que foi uma decisão e não um esquecimento.

## Traduzindo rótulos e valores de enum

Cada módulo dono da entidade adiciona um bloco `audit` no seu próprio arquivo de locale
(`core/i18n/locales/pt-BR/<módulo>.json`):

```json
{
  "audit": {
    "entities": {
      "user": {
        "label": "Usuário",
        "fields": { "name": "Nome", "email": "E-mail", "status": "Status" },
        "enums": { "status": { "ACTIVE": "Ativo", "INACTIVE": "Inativo" } }
      }
    }
  }
}
```

`I18nAuditTranslator` busca essas chaves como `<module>.audit.entities.<name>.label` /
`.fields.<campo>` / `.enums.<campo>.<valor>`. Ao criar uma entidade nova auditável, adicione o
bloco correspondente no locale do módulo — sem ele, o rótulo cai no fallback (nome técnico do
campo, sem tradução).

## Adicionando um formatter ou normalizer novo

- **Normalizer** (`shared/audit/normalizers/`) — normaliza o valor _antes_ do diff, para que
  diferenças de representação (ordem de array, `undefined` vs `null`, tipo de data) não gerem um
  diff falso-positivo. Implemente `IAuditNormalizer` e referencie no campo:
  `@Audit({ normalizer: MeuNormalizer })`.
- **Formatter** (`shared/audit/formatters/`) — formata o valor _na leitura_, para exibição
  (ex. `EnumFormatter` traduz o valor do enum; `CurrencyFormatter`/`DateFormatter` usam `Intl`
  localizado). Implemente `IAuditFormatter` e referencie: `@Audit({ formatter: MeuFormatter })`.
- **Relation resolver** (ex. `PermissionsRelationResolver`) — quando o campo é uma relação e o
  diff bruto (ids) não é útil para exibição, um `IAuditRelationResolver` busca os registros reais
  para formatar (ex. transformar uma lista de ids de permissão em `"users:read,
users:write"`). Some sempre com `normalizer: ArrayNormalizer` se o campo for uma relação
  to-many, para que a ordem não afete o diff.

Registre a classe nova nos `providers` de `AuditEngineModule` (`shared/audit/audit-engine.module.ts`)
— é isso que permite que qualquer `FormatStage`/`NormalizeStage`/`ResolveRelationsStage` a resolva
dinamicamente via `ModuleRef.get(Tipo, { strict: false })`, sem que o motor genérico precise
importar o módulo de domínio dono do resolver.

## O pipeline, em duas metades

**Escrita** (`AuditPipelineService.recordChange`, chamado por `RecordAuditLogUseCase` a partir do
evento emitido pelo `AuditSubscriber`): `LoadMetadataStage → NormalizeStage → DiffStage`. Produz o
`IFieldDiff[]` (`{ field, old, new }`) que é persistido como `jsonb` em `audit.audit_logs`. Se o
diff vier vazio (nada realmente mudou depois da normalização), **nenhuma linha é gravada**.

**Leitura** (`AuditPipelineService.buildChangeSet`, chamado por `AuditLogResponseMapper` ao montar
a resposta HTTP): `ResolveRelationsStage → TranslateStage → FormatStage → BuildDtoStage`. Pega o
diff bruto já persistido e o transforma, para o locale da requisição atual, num
`AuditFieldChangeDTO[]` com rótulo traduzido e valores `{ value, display }` (valor cru + valor
formatado) tanto para o "antes" quanto para o "depois".

Falhas degradam com segurança em qualquer ponto: entidade sem `@AuditEntity()` cai num diff bruto
sem tradução; um relation resolver que falha mantém o valor cru; e qualquer erro em
`RecordAuditLogUseCase` é capturado e logado por `AuditChangeListener` sem afetar a
transação/resposta da operação original que disparou a auditoria.

## Ponta a ponta (exemplo real)

`UserEntity.status` muda de `ACTIVE` para `INACTIVE` via `UsersRepository.update()` (que faz
`repo.save()`):

1. `AuditSubscriber.afterUpdate` dispara (ouve todas as entidades; ignora as que não têm
   `@AuditEntity()`), monta `before`/`after` restritos aos campos com `@Audit()`, e emite
   `AUDIT_CHANGE_REQUESTED_EVENT` via `EventEmitter2` com o ator atual (`RequestContextService`).
2. `AuditChangeListener` recebe o evento (assíncrono) e chama `RecordAuditLogUseCase`, que roda o
   pipeline de escrita: `status` não muda de normalizer (usa o `DefaultNormalizer`), e
   `DiffEngine` detecta `'ACTIVE' !== 'INACTIVE'` → gera `{ field: 'status', old: 'ACTIVE', new:
'INACTIVE' }`. Grava uma linha em `audit.audit_logs`.
3. Depois, `GET /v1/audit-logs/:uuid` busca essa linha e roda o pipeline de leitura: `status` tem
   `formatter: EnumFormatter`, que traduz `ACTIVE`/`INACTIVE` via
   `users.audit.entities.user.enums.status.*` → `"Ativo"`/`"Inativo"`. A resposta final inclui
   `{ field: "status", label: "Status", old: { value: "ACTIVE", display: "Ativo" }, new: { value:
"INACTIVE", display: "Inativo" } }`.
