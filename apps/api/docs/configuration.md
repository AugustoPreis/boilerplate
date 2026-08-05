# Configuração

## Adicionando uma variável de ambiente nova

1. **`.env.example`** — adicione a variável com um valor de exemplo/seguro, agrupada com as
   variáveis relacionadas (ex. um bloco `# Storage` novo). Se a variável tem uma contraparte
   sensível real usada em produção, deixe claro no comentário (ex. `# true em produção, false em
desenvolvimento`).
2. **`core/config/<algo>.config.ts`** — exponha a variável via `registerAs('<namespace>', () =>
({ ... }))`, lendo de `process.env.MINHA_VAR` com um default sensato para desenvolvimento:

   ```ts
   import { registerAs } from '@nestjs/config';

   export default registerAs('minhaFeature', () => ({
     algumaCoisa: process.env.MINHA_VAR || 'default-dev',
   }));
   ```

   Acesso depois em qualquer serviço via `ConfigService.get<string>('minhaFeature.algumaCoisa')`,
   não `process.env` direto — mantém a leitura de env centralizada e testável nesse serviço. As
   exceções reais do projeto são código que roda fora do grafo de DI do Nest (o data source de CLI
   do TypeORM em `core/database/data-source.ts`, os seeders em `core/database/seeds/`) e checagens
   pontuais de `NODE_ENV` feitas antes do `ConfigService` estar disponível (dentro de factories de
   módulo, como em `LoggerModule.forRootAsync` e `I18nModule`) — não replique esse padrão para uma
   env var de feature nova; ele só se justifica nesses dois casos específicos.

3. **`core/config/index.ts`** — exporte o novo config (`export { default as minhaFeatureConfig }
from './minha-feature.config';`).
4. **`app.module.ts`** — adicione ao array `load: [...]` do `ConfigModule.forRoot(...)`.
5. **`config.validation.ts`**, se a variável é obrigatória em produção — adicione uma checagem
   dentro do bloco `if (env === 'production')`, seguindo o padrão já usado para os secrets de JWT
   e para as credenciais de S3 (presença/tamanho mínimo, empurrando um erro para a lista `errors`).
   Isso faz o boot falhar cedo (com uma mensagem clara) em vez de a aplicação subir "quebrada" em
   produção por falta de uma env var.

### Exceção: Redis

`core/redis/redis.module.ts` lê `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_DB` diretamente
do `ConfigService` sem um `redis.config.ts` via `registerAs` — isso é uma inconsistência histórica
do módulo mais antigo do projeto, não o padrão a seguir. `BullModule.forRootAsync` (ver
[background-jobs.md](./background-jobs.md)) reaproveita essas mesmas variáveis pelo mesmo motivo
(a mesma conexão Redis é compartilhada). Para qualquer configuração nova, siga o padrão
`registerAs` (passos acima), não o do Redis.

## Atualizando as imagens do `docker-compose.yml`

O Dependabot cuida das dependências npm, das GitHub Actions e da imagem base de
`apps/api/Dockerfile` (ver `.github/dependabot.yml`) — mas ele não lê `docker-compose.yml`. As
imagens de infraestrutura de desenvolvimento (`postgres`, `redis:7-alpine`, `minio/minio`) ficam
de fora da automação e precisam de atualização manual ocasional, verificando a tag pinada em cada
serviço contra a última release estável.

## Por que a validação fica centralizada em um único arquivo

`config.validation.ts` é passado como `validate` para `ConfigModule.forRoot(...)` e roda uma única
vez, no boot. Ter todas as regras de "isso é obrigatório/precisa ter esse formato em produção" num
único lugar (em vez de espalhadas em cada `*.config.ts` ou verificadas lazy em cada serviço que usa
a variável) significa: (1) a aplicação nunca sobe num estado parcialmente configurado — ou todas as
regras passam, ou o processo nem inicia; (2) para saber tudo que é exigido em produção, um único
arquivo responde a pergunta, sem precisar grep-ar o projeto inteiro.
