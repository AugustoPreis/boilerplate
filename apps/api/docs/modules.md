# Criando um módulo novo

Passo a passo para adicionar um recurso de domínio novo (ex. um módulo `products`), replicando a
estrutura já usada por `users`/`roles`/`audit`.

## Estrutura de pastas

```
modules/products/
  controllers/products.controller.ts
  dtos/
    create-product.dto.ts
    update-product.dto.ts
    product-query.dto.ts
    product-response.dto.ts
  entities/product.entity.ts
  enums/product-status.enum.ts        # se houver um enum de domínio
  repositories/products.repository.ts
  use-cases/
    create-product.use-case.ts
    update-product.use-case.ts
    delete-product.use-case.ts
    find-product.use-case.ts
    list-products.use-case.ts
  utils/                                # helpers puros específicos do módulo, se necessário
  products.module.ts
  products.constants.ts                 # constantes do módulo (ex. limites), se necessário
```

Um use-case por operação, nunca um "ProductsService" genérico com todos os métodos — isso mantém
cada operação testável isoladamente e o diff de uma mudança de regra de negócio pequeno.

## `products.module.ts`

```ts
@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    ProductsRepository,
    ListProductsUseCase,
    FindProductUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: [ProductsRepository], // só o repository, se outro módulo precisar consultar dados
})
export class ProductsModule {}
```

`SharedModule` é importado explicitamente por convenção mesmo sendo `@Global()` — deixa claro, ao
ler o módulo, que ele depende de peças de `shared/` (guards, exceptions, etc.), embora tecnicamente
não seja necessário para a injeção funcionar.

## Registro em `AppModule`

Adicione o import e a entrada em `imports: [...]` de `apps/api/src/app.module.ts`, junto dos
outros módulos de domínio (`UsersModule`, `RolesModule`, `AuthModule`, `AuditModule`).

## Entidade

Estenda `shared/entities/base.entity.ts` (`BaseEntity`) — já traz `id` (incremental, uso interno),
`uuid` (público), `createdAt`/`updatedAt`/`deletedAt`. Se a entidade precisa aparecer na trilha de
auditoria, decore com `@AuditEntity({ name: '...', module: '...' })` e cada campo relevante com
`@Audit()` — ver [auditing.md](./auditing.md). Gere a migration correspondente (ver
`core/database/migrations/`, convenção de nome por timestamp).

## Repository

Um método por operação de acesso a dados, sempre devolvendo a entidade (nunca o DTO — o mapeamento
para DTO acontece no use-case ou no `static from()` do DTO de resposta). Para escrita, sempre
`repo.save()`/`repo.remove()`/`repo.softRemove()`, nunca `repo.update()`/`repo.delete()` — ver a
explicação em [architecture.md](./architecture.md#camadas). Para listagem paginada, siga o padrão
`buildSkip`/`buildPaginatedResult` de `shared/utils/pagination.util.ts`.

## Controller

Fino: injeta os use-cases do módulo, um método por rota, delega direto (`return
this.xUseCase.execute(...)`). Aplique `@RequirePermission('<resource>', '<action>')` em toda rota
que exige autorização granular; omita apenas para os poucos casos de "ação sobre o próprio
usuário autenticado" (ex. `PUT /users/me/password`) — nesse caso adicione um comentário de uma
linha explicando por quê, seguindo o padrão já usado em `UsersController`.

## Nomenclatura

Veja [conventions.md](./conventions.md) para convenção de nomes de arquivo/classe, DTOs e
mensagens de erro i18n.
