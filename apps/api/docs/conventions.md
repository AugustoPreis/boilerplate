# Convenções gerais

## Nomenclatura de arquivos e classes

| Peça             | Arquivo                        | Classe                                  |
| ---------------- | ------------------------------ | --------------------------------------- |
| Controller       | `<recurso>.controller.ts`      | `<Recurso>Controller`                   |
| Use-case         | `<ação>-<recurso>.use-case.ts` | `<Ação><Recurso>UseCase`                |
| Repository       | `<recurso>s.repository.ts`     | `<Recurso>sRepository`                  |
| Entity           | `<recurso>.entity.ts`          | `<Recurso>Entity`                       |
| DTO de entrada   | `<ação>-<recurso>.dto.ts`      | `<Ação><Recurso>DTO`                    |
| DTO de saída     | `<recurso>-response.dto.ts`    | `<Recurso>ResponseDTO`                  |
| Enum             | `<recurso>-<campo>.enum.ts`    | `E<Recurso><Campo>` (ex. `EUserStatus`) |
| Util/helper puro | `<algo>.util.ts`               | função exportada, não classe            |
| Interface        | `<algo>.interface.ts`          | `I<Algo>`                               |

Um use-case por operação (nunca um service genérico com todos os métodos de um recurso) — ver
[architecture.md](./architecture.md).

## DTOs

- **Entrada** (`create-x.dto.ts`, `update-x.dto.ts`, `x-query.dto.ts`): `@ApiProperty`/
  `@ApiPropertyOptional` do Swagger, e validadores de `@shared/validators` sempre que existir um
  wrapper para o validador usado (`IsString`, `IsEmail`, `IsEnum`, `IsUUID`, `IsArray`,
  `MinLength`, `MaxLength`, `Matches`, `Length`, `IsNotEmpty`, `IsUrl`, `IsCpf`) — são finos
  wrappers sobre os decorators equivalentes de `class-validator`, já pré-configurados com a
  mensagem de erro traduzida (`i18nValidationMessage('validation.<chave>')`), então importe de lá,
  não direto de `class-validator`, para não hardcodar uma mensagem em inglês. Decorators sem
  wrapper (ex. `IsOptional`, que não falha sozinho — só pula o resto das validações quando o
  campo é `undefined`, logo não tem mensagem de erro própria para traduzir) são importados direto
  de `class-validator`. Ao adicionar um validador novo que ainda não tem wrapper e que gera uma
  mensagem de erro, crie o wrapper em `shared/validators/i18n-validators.ts` seguindo o mesmo
  padrão, em vez de importar direto de `class-validator` com mensagem hardcoded. DTOs de listagem
  estendem `PaginationQueryDTO` (`shared/dtos/pagination-query.dto.ts`) para herdar
  `page`/`perPage`.
- **Saída** (`x-response.dto.ts`): um `static from(entity): XResponseDTO` que mapeia a entidade —
  nunca serializa a entidade do TypeORM diretamente na resposta HTTP. Exceção: quando montar o DTO
  exige uma dependência injetada e assíncrona (ex. `AuditLogResponseMapper`, que precisa do
  `AuditPipelineService` para traduzir/formatar o diff) — nesse caso um mapper `@Injectable()` com
  um método de instância assíncrono substitui o `static from()` síncrono.

## Erros: `AppException`

Toda regra de negócio que falha lança `AppException.from(i18nKey, httpStatus, options?)`, nunca um
`HttpException`/`BadRequestException` genérico do Nest com uma string hardcoded:

```ts
throw AppException.from('users.errors.notFound', HttpStatus.NOT_FOUND);
throw AppException.from('users.errors.emailTaken', HttpStatus.CONFLICT, { args: { email } });
```

`i18nKey` é resolvido para a mensagem final pelo `HttpExceptionFilter` global (`shared/filters/`),
usando o locale da requisição atual — o use-case nunca chama `i18n.translate(...)` para montar uma
mensagem de erro de resposta (isso é diferente de montar o corpo de um e-mail, onde o use-case
_precisa_ resolver o texto antes de enfileirar — ver [mailing.md](./mailing.md)). `options.args` são
os parâmetros de interpolação da mensagem traduzida; `options.code` é um código de erro estável
opcional, para o frontend distinguir cenários sem parsear a mensagem traduzida.

Toda chave de erro nova vai no arquivo de locale do módulo dono
(`core/i18n/locales/pt-BR/<módulo>.json`, dentro do bloco `errors`), nunca hardcoded em inglês nem
português dentro do código.

## Paginação

Listagens usam paginação por offset (`skip`/`take`), não cursor:

```ts
const [data, total] = await this.repo.findAndCount({
  where, skip: buildSkip(page, perPage), take: perPage, order: { ... },
});
return buildPaginatedResult(data, total, page, perPage);
```

`buildSkip`/`buildPaginatedResult` (`shared/utils/pagination.util.ts`) e `IPaginatedResult<T>`
(`{ data, meta: { total, page, perPage, lastPage } }`) são os únicos pontos de montagem desse
formato — não recalcule `lastPage` manualmente em outro lugar.

## Logging

Logging é feito com o `Logger` nativo do `@nestjs/common`, instanciado por classe:

```ts
private readonly logger = new Logger(MinhaClasse.name);
```

Não use `console.log`/`console.error` em código de aplicação, nem tente usar `shared/logger/`
(esse serviço existe no código mas não está registrado em nenhum módulo importado — não o
referencie até que alguém efetivamente o conecte ao DI).

## UUIDs

Toda entidade tem `id` (incremental, `PrimaryGeneratedColumn`, uso interno/joins) e `uuid` (exposto
externamente — rotas, DTOs, chaves de storage/Redis). Nunca exponha `id` numérico numa rota ou
resposta. Novos UUIDs são gerados via `UuidService.generate()` (`shared/services/uuid.service.ts`),
que usa UUID v7 por padrão (ordenável, melhor para índices de banco) — só peça `v4` explicitamente
se houver um motivo concreto para não ordenável.
