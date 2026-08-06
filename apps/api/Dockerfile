# Build context is the root of the monorepo (needed for pnpm workspace):
#   docker build -f apps/api/Dockerfile .

FROM node:25-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps

COPY . .
RUN corepack prepare --activate $(node -p "require('./package.json').packageManager")
RUN pnpm install --frozen-lockfile

RUN pnpm --filter=@boilerplate/shared build
RUN pnpm --filter=@boilerplate/api build

FROM deps AS builder

RUN pnpm --filter=@boilerplate/api deploy --legacy --prod /prod/api

# --- Production image ---
FROM node:25-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /prod/api ./

EXPOSE 3000

USER node

CMD ["node", "dist/main"]
