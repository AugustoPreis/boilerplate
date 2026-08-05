# Boilerplate

Ponto de partida para novos projetos: uma API em NestJS com autenticação por
JWT (cookies httpOnly + refresh token), autorização por permissões (RBAC),
Postgres via TypeORM, Redis, i18n e trilha de auditoria já prontos.

## Como rodar

1. Copie o `.env.example` para `.env` na raiz do projeto.
2. Suba os containers:

   ```sh
   docker compose up
   ```

Isso builda a imagem, roda as migrations e os seeds, e deixa a API no ar em
`http://localhost:3000` (documentação Swagger em `/api/docs`).

Um usuário administrador já é criado pelo seed com as credenciais definidas
em `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env`.

Em desenvolvimento (`docker-compose.override.yml`, aplicado automaticamente),
o código roda com hot-reload e um [MailHog](http://localhost:8025) captura
qualquer e-mail enviado pela API, ao invés de entregá-lo de verdade.

Arquivos enviados pela API (ex.: avatar de usuário) vão para um
[MinIO](http://localhost:9001) local, compatível com S3.
