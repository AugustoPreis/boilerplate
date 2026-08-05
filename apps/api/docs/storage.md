# Storage (S3-compatible)

`StorageService` (`core/storage/`) fala o protocolo S3 via `@aws-sdk/client-s3` — funciona contra
MinIO em desenvolvimento e qualquer provedor S3-compatible em produção (AWS S3, Cloudflare R2,
etc.), configurado só por `endpoint` + `forcePathStyle`. Deliberadamente não usa o SDK proprietário
do MinIO, para não prender o projeto a um único provedor.

## API

- `upload(key, buffer, contentType): Promise<string>` — `PutObjectCommand`, retorna a URL pública
  do objeto. Não define `ACL` por objeto — a política de acesso vem da policy do bucket (ver
  abaixo), não de cada upload individual.
- `delete(key): Promise<void>` — `DeleteObjectCommand`.
- `publicUrl(key): string` — `${S3_PUBLIC_URL}/${bucket}/${key}` (path-style, coerente com
  `S3_FORCE_PATH_STYLE=true`).

## `S3_ENDPOINT` vs `S3_PUBLIC_URL`

São propositalmente variáveis separadas: `S3_ENDPOINT` é o endpoint que a própria API usa para
falar com o storage (em dev, `http://minio:9000` — nome do serviço na rede interna do Docker
Compose); `S3_PUBLIC_URL` é o que o navegador do usuário final consegue alcançar (em dev,
`http://localhost:9000`). Em produção, tipicamente também são hosts diferentes — endpoint privado
de VPC vs. domínio público/CDN na frente do bucket.

## Convenção de key

Cada recurso que faz upload define sua própria convenção de key, refletindo se o objeto deve ser
substituído ou acumulado. Exemplo, avatar de usuário
(`modules/users/utils/avatar-storage-key.util.ts`):

```ts
export function getAvatarStorageKey(uuid: string, extension: string): string {
  return `users/avatars/${uuid}.${extension}`;
}
```

A key é **determinística** (baseada só no uuid do usuário, sem timestamp/uuid aleatório) — o
próximo upload do mesmo usuário sobrescreve o objeto anterior no bucket. Isso é proposital: evita
precisar de uma rotina de limpeza separada para apagar avatares antigos. Use esse mesmo raciocínio
para qualquer upload novo: se o recurso é "um arquivo por entidade, substituível", a key
determinística evita lixo acumulado; se o histórico de versões importa, a key precisa de um
componente único (uuid gerado, timestamp) e uma rotina de limpeza é responsabilidade de quem
introduzir esse caso.

## Bucket e policy: dev vs. produção

No boot (`StorageService.onModuleInit`), se `storage.autoConfigureBucket`
(`S3_AUTO_CONFIGURE_BUCKET=true`) estiver ligado: `HeadBucket` → se não existir, `CreateBucket` →
`PutBucketPolicy` aplicando leitura pública (`s3:GetObject`) só para esse bucket.

Isso só deve rodar em desenvolvimento. Em produção, contra um S3 real, a policy do bucket é
responsabilidade da infraestrutura/IaC — e a IAM role da aplicação tipicamente **não tem**
permissão de `PutBucketPolicy` (por design de segurança: a aplicação deve poder ler/escrever
objetos, não redefinir quem mais pode acessá-los). Por isso `S3_AUTO_CONFIGURE_BUCKET` deve ser
`false` em produção — a env var default do `.env.example` (`true`) é só para o ambiente de
desenvolvimento contra o MinIO local.

## Credenciais: MinIO (dev) vs. AWS S3 real (produção)

Em dev, `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` e `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` têm o
mesmo valor, porque o MinIO usa as credenciais root como única credencial válida por padrão. Em
produção (AWS S3 real), isso vira uma IAM policy com permissão restrita só ao bucket usado pela
aplicação — nunca as credenciais root/administrativas da conta AWS.

## Validação em produção

`config.validation.ts` exige, quando `NODE_ENV=production`, que `S3_ACCESS_KEY_ID`,
`S3_SECRET_ACCESS_KEY` e `S3_BUCKET` estejam presentes — mesmo padrão já usado para os secrets de
JWT (ver [configuration.md](./configuration.md)).
