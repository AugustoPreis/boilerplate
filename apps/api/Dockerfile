# Build context é a raiz do monorepo (necessário para acessar o pnpm workspace):
#   docker build -f apps/api/Dockerfile .

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

# Estágio com node_modules completo (dev+prod) e dist/ já buildado — usado
# tanto pelo serviço `migrate` (precisa de ts-node/tsconfig-paths para rodar
# migration:run/seed) quanto como base do estágio `builder` abaixo. Não roda
# `pnpm deploy` aqui: esse passo, se rodado na mesma imagem depois reusada
# para outro comando `pnpm --filter`, deixa o estado do pnpm inconsistente.
FROM base AS deps

COPY . .
RUN corepack prepare --activate $(node -p "require('./package.json').packageManager")
RUN pnpm install --frozen-lockfile

RUN pnpm --filter=@boilerplate/shared build
RUN pnpm --filter=@boilerplate/api build

FROM deps AS builder

RUN pnpm --filter=@boilerplate/api deploy --legacy --prod /prod/api

# --- Production image ---
FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /prod/api ./

EXPOSE 3000

USER node

CMD ["node", "dist/main"]
