FROM node:lts-alpine3.17 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate
COPY . .
RUN yarn dlx turbo prune --scope=sora --docker

FROM node:lts-alpine3.17 AS installer

RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY .yarnrc.yml .
RUN yarn install

COPY --from=builder /app/out/full .
COPY turbo.json turbo.json

RUN yarn generate

ENV SKIP_ENV_VALIDATION true
RUN yarn turbo run build --filter=sora...

FROM node:lts-alpine3.17 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sora
USER sora

COPY --from=installer /app/apps/sora/next.config.mjs .
COPY --from=installer /app/apps/sora/package.json .

COPY --from=installer --chown=sora:nodejs /app/apps/sora/.next/standalone ./
COPY --from=installer --chown=sora:nodejs /app/apps/sora/.next/static ./apps/sora/.next/static
COPY --from=installer --chown=sora:nodejs /app/apps/sora/public ./apps/sora/public

EXPOSE 3000
ENTRYPOINT node apps/sora/server.js
