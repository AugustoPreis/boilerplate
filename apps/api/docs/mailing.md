# E-mail

## Regra central: `MailService` só é chamado pelo `MailProcessor`

Nenhum use-case deve injetar `core/mail/mail.service.ts` (`MailService`) diretamente, nem montar
HTML por concatenação de string. O único ponto de entrada para o resto da aplicação é
`MailerService.enqueue(job)` — ele apenas enfileira (ver [background-jobs.md](./background-jobs.md)
para o mecanismo de fila em si). Quem efetivamente chama `MailService.send()` é o `MailProcessor`,
ao processar o job.

Isso existe para garantir duas coisas ao mesmo tempo: (1) todo e-mail passa pela fila, nunca é
enviado de forma síncrona bloqueando uma resposta HTTP; (2) todo corpo de e-mail vem de um template
`.hbs` versionado, nunca de HTML montado na mão dentro de um use-case.

## Contrato do job

```ts
interface IMailJob {
  to: string;
  subject: string; // já traduzido pelo chamador
  template: string; // nome do arquivo em templates/, sem extensão
  context: Record<string, unknown>; // já com todo texto traduzido
}
```

Decisão de design importante: **o job carrega dados já resolvidos**, não chaves de tradução nem
`locale`. Quem enfileira (o use-case) já tem `I18nService` e o `locale` da request — é ele quem
resolve `i18n.translate(...)` para montar `subject` e `context`. Nem `MailProcessor` nem
`MailTemplateService` conhecem i18n: só recebem strings finais e um nome de template. Isso mantém
o job autocontido (não depende do catálogo de tradução não ter mudado entre enfileirar e
processar) e o processor simples.

## Criando um template novo

1. Crie `core/mail/templates/<nome>.hbs`. Para reaproveitar a casca comum (cabeçalho com o nome da
   aplicação, rodapé), envolva o conteúdo com o partial-block `base`:

   ```hbs
   {{#> base}}
     <p>{{saudacao}}</p>
     <p>{{corpo}}</p>
   {{/base}}
   ```

   `templates/layouts/base.hbs` é a casca — ela referencia `{{> @partial-block}}` no ponto onde o
   conteúdo específico do template entra. Esse é o mecanismo nativo do Handlebars para layouts
   (não existe herança de template como em Nunjucks/Twig; partial-block é o equivalente).

2. Nenhum registro manual é necessário além disso — `MailTemplateService` lê e compila o `.hbs`
   sob demanda (`fs.readFileSync` + `Handlebars.compile`), com cache em memória por nome de
   template (não recompila a cada envio). O partial `base` é registrado uma vez no boot do módulo
   (`onModuleInit`).

3. No use-case que enfileira o e-mail, resolva todo texto via `i18n.translate(...)` e monte o
   `context` com essas strings já traduzidas + qualquer dado dinâmico (ex. uma URL). Veja
   `ForgotPasswordUseCase` como referência completa.

4. **Importante para o build**: arquivos `.hbs` não são TypeScript — precisam estar listados em
   `apps/api/nest-cli.json` → `compilerOptions.assets` para serem copiados para `dist/` no build
   de produção (mesmo mecanismo já usado para os locales de i18n). Um template novo dentro de
   `core/mail/templates/` já é coberto pelo glob existente; só um diretório fora dessa árvore
   precisaria de uma entrada nova.

## Por que a fila, não envio síncrono

Enviar e-mail é uma chamada de rede para um serviço externo (SMTP) fora do controle da aplicação —
pode ser lento ou falhar transitoriamente. Enfileirar significa que a resposta HTTP do endpoint que
disparou o e-mail nunca espera por isso, e uma falha de SMTP não vira um erro 500 para o usuário.
A política de retry (`attempts: 3`, backoff exponencial) e o log de falha final ficam documentados
em [background-jobs.md](./background-jobs.md).

## Ambiente de desenvolvimento

Em dev, `MAIL_HOST`/`MAIL_PORT` apontam para o MailHog do `docker-compose.override.yml` — todo
e-mail enviado é capturado ali (`http://localhost:8025`), nunca entregue de verdade.
