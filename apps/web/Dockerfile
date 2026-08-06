# Build context is the root of the monorepo (needed for pnpm workspace):
#   docker build -f apps/web/Dockerfile .

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps

COPY . .
RUN corepack prepare --activate $(node -p "require('./package.json').packageManager")
RUN pnpm install --frozen-lockfile

RUN pnpm --filter=@boilerplate/web build

# --- Production image ---
FROM nginx:1.29-alpine AS production

COPY --from=deps /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
