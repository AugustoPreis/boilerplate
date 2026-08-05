# Jobs em background (BullMQ)

Filas rodam sobre o Redis que já existe (`core/redis/`), via `@nestjs/bullmq`. Hoje só há uma
fila, a de e-mail (ver [mailing.md](./mailing.md)) — este documento descreve o padrão para
registrar uma nova.

## Conexão

`BullModule.forRootAsync` é registrado uma única vez em `AppModule`, reaproveitando as mesmas
variáveis de ambiente que `RedisModule` já usa (`REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/
`REDIS_DB`) — mesma infra, mesma conexão lógica, sem uma env var nova por fila:

```ts
BullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: {
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
      db: config.get<number>('REDIS_DB', 0),
    },
  }),
}),
```

## Registrando uma queue nova

Dentro do módulo dono da fila (ex. `core/mail/mail.module.ts`), registre a queue com seus
`defaultJobOptions`:

```ts
BullModule.registerQueue({
  name: MEU_QUEUE_NAME,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 100, // mantém as últimas 100 falhas pra inspeção manual via Redis/CLI
  },
}),
```

`defaultJobOptions` fica na queue, não em cada chamada de `.add()` — todo job herda a mesma
política de retry sem precisar repetir a configuração em cada `enqueue()`.

## Produzindo um job

Um serviço fino injeta a queue via `@InjectQueue(MEU_QUEUE_NAME)` e só chama `.add(...)` — sem
lógica de negócio:

```ts
@Injectable()
export class MailerService {
  constructor(@InjectQueue(MAIL_QUEUE_NAME) private readonly queue: Queue<IMailJob>) {}

  async enqueue(job: IMailJob): Promise<void> {
    await this.queue.add('send', job);
  }
}
```

## Consumindo um job

Um processor estende `WorkerHost` (não existe mais `@Process()` como método decorator na versão
atual do `@nestjs/bullmq` — o método de processamento é a implementação do método abstrato
`process`) e é decorado com `@Processor(MEU_QUEUE_NAME)`:

```ts
@Processor(MAIL_QUEUE_NAME)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(/* ... */) {
    super();
  }

  async process(job: Job<IMailJob>): Promise<void> {
    // ... trabalho real ...
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IMailJob>, error: Error): void {
    this.logger.error(`Failed job ${job.id}`, error.stack);
  }
}
```

## Convenção de erro

Sem alerta externo (fora de escopo). Uma falha após todas as tentativas de `attempts` é só logada
via `Logger` (padrão do projeto — ver [conventions.md](./conventions.md#logging)) no handler
`@OnWorkerEvent('failed')`, com o `job.data` relevante para diagnóstico manual. O endpoint HTTP que
enfileirou o job já respondeu antes disso (enfileirar é o último passo do use-case, depois de
qualquer efeito colateral síncrono necessário) — uma falha de processamento assíncrono nunca deve
quebrar a resposta original.
