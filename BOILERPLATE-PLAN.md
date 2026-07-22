# Plano de Refatoração Completa da Auditoria

# Objetivo

Este documento define a estratégia para construir **integralmente** o sistema de auditorias.

---

# Objetivos Arquiteturais

A nova arquitetura deve priorizar:

- escalabilidade;
- desacoplamento;
- simplicidade de evolução;
- alta legibilidade;
- consistência;
- baixo acoplamento;
- SOLID;
- Clean Architecture;
- Strategy Pattern;
- Registry Pattern;
- Pipeline Pattern;
- Open/Closed Principle.

Nenhuma decisão deve ser tomada apenas para manter compatibilidade com o código atual.

---

# Visão Geral

Fluxo proposto:

```text
Entidade Antes
        │
Entidade Depois
        │
Diff Engine
        │
Metadata Registry
        │
Normalization Pipeline
        │
Relation Resolution
        │
Translation
        │
Formatting
        │
Audit DTO
        │
Frontend React
```

Cada etapa possui responsabilidade única.

---

# Estrutura Sugerida

```text
(shared)/audit/
    decorators/
    metadata/
    registry/
    pipeline/
    diff/
    normalizers/
    formatters/
    translators/
    relation-resolvers/
    dtos/
    interfaces/
    services/
    events/
```

---

# Decorators

Utilizar apenas um decorator principal.

```ts
@Audit()
name: string;

@Audit({
    label: "Preço",
    formatter: CurrencyFormatter,
})
price: number;

@Audit({
    ignore: true
})
internalHash: string;
```

O decorator **não executa lógica**.

Ele apenas registra metadados.

---

# Metadata

Os decorators alimentam um Registry central.

Exemplo conceitual:

```ts
{
  entity: Product,
  fields: {
    price: {
      label: "Preço",
      formatter: CurrencyFormatter
    }
  }
}
```

Nenhum componente deve consultar reflection diretamente durante a execução.

---

# Pipeline

Sugestão de implementação:

1. Carregar Metadata
2. Normalizar valores
3. Calcular Diff
4. Resolver relacionamentos
5. Traduzir labels
6. Formatar valores
7. Gerar DTO final

Cada etapa deve implementar interfaces bem definidas.

---

# Diff Engine

Responsável exclusivamente por identificar mudanças.

Entrada:

```text
before
after
```

Saída:

```json
[
  {
    "field": "status",
    "old": "PENDING",
    "new": "APPROVED"
  }
]
```

Não deve conhecer tradução, frontend ou TypeORM.

---

# Normalização

Normalizar antes da comparação.

Exemplos:

- Arrays → ordenados
- Objetos → identificador
- Boolean → boolean
- Enums → valor interno

---

# Relacionamentos

A comparação deve ser semântica.

Em vez de:

```text
5 → 8
```

Exibir:

```text
Informática → Hardware
```

Criar resolvers especializados para cada agregado quando necessário.

---

# Formatação

Cada tipo deve possuir um formatter dedicado.

Exemplos:

- DateFormatter
- CurrencyFormatter
- EnumFormatter
- BooleanFormatter
- RelationFormatter

Todos registrados como providers do NestJS.

---

# Traduções

Separar completamente:

- tradução da entidade;
- tradução do campo;
- tradução de enum;
- tradução de valores.

Evitar strings hardcoded.

---

# DTO Final

O frontend nunca interpreta dados.

Exemplo:

```json
{
  "field": "status",
  "label": "Status",
  "old": {
    "value": "PENDING",
    "display": "Pendente"
  },
  "new": {
    "value": "APPROVED",
    "display": "Aprovado"
  }
}
```

---

# Extensibilidade

Adicionar uma nova entidade deve exigir apenas:

1. Decorar os campos.
2. Registrar formatter específico (quando necessário).
3. Registrar resolver de relacionamento (quando necessário).

Nenhuma alteração na infraestrutura existente.

---

# Plano de Implementação

## Fase 1

- Criar módulo audit.
- Metadata
- Registry
- Decorators

## Fase 2

- Diff Engine
- Normalizers

## Fase 3

- Relation Resolvers
- Translation
- Formatting

## Fase 4

- Pipeline
- DTO
- APIs

## Fase 5

- Identificar pontos de integração.
- Remover dependências da auditoria antiga.

## Fase 6

- Migração das entidades TypeORM

---

# Critérios de Aceitação

A solução final deve:

- permitir crescimento sem refatorações estruturais;
- minimizar duplicação;
- permitir customizações locais;
- manter baixo acoplamento;
- evitar condicionais por entidade;
- centralizar metadados;
- utilizar estratégias substituíveis;
- ser facilmente testável.

---

# Diretriz Final para a IA

Sempre que houver mais de uma solução possível, escolher a arquitetura mais robusta para longo prazo.

Não preservar implementações antigas apenas por compatibilidade.

Caso seja necessário remover, renomear, quebrar contratos, reorganizar módulos ou alterar entidades para alcançar uma arquitetura superior, isso deve ser feito.

O foco é construir uma nova fundação para a auditoria, e não adaptar a implementação existente.

Seu foco deve ser no app `api`, seguindo as práticas já existentes no projeto.
