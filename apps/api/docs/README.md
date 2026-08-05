# Documentação da API

Documentação de arquitetura e convenções, versionada junto do código que ela descreve. O
[README da raiz](../../../README.md) cobre só "como rodar o projeto"; aqui entra o "como o
projeto é organizado e por quê".

- **[architecture.md](./architecture.md)** — as camadas (controller → use-case → repository →
  entity), a diferença entre `core/`, `shared/` e `modules/`, e quando um use-case complexo deve
  delegar para colaboradores menores (usando o pipeline de auditoria como exemplo real).
- **[modules.md](./modules.md)** — como criar um módulo de domínio novo do zero: pastas, arquivo
  de módulo, registro em `AppModule`, convenção de nomes.
- **[configuration.md](./configuration.md)** — como adicionar uma variável de ambiente nova:
  `*.config.ts`, `config.validation.ts` e `.env.example`, e por que a validação fica centralizada.
- **[authorization.md](./authorization.md)** — RBAC: roles, permissions, effective permissions,
  `@RequirePermission`, `PermissionsGuard`.
- **[auditing.md](./auditing.md)** — o pipeline de trilha de auditoria: diff → normalize → format
  → translate; como adicionar um formatter/normalizer novo; `@AuditEntity`/`@Audit`.
- **[background-jobs.md](./background-jobs.md)** — BullMQ: como registrar uma queue, um
  processor, e a convenção de `defaultJobOptions`/retry.
- **[mailing.md](./mailing.md)** — como criar um template `.hbs` novo, partials/layout
  compartilhado, e a regra "`MailService` só é chamado pelo `MailProcessor`".
- **[storage.md](./storage.md)** — `StorageService`, convenção de key, e a diferença de política
  de bucket entre dev e produção.
- **[conventions.md](./conventions.md)** — nomenclatura, DTOs de entrada/saída, i18n de
  mensagens de erro, tratamento de erro via `AppException`, paginação.
