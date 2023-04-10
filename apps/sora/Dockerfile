FROM node:lts-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate
COPY . .
RUN yarn dlx turbo prune --scope=sora --docker

FROM node:lts-alpine AS installer

RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --immutable --inline-builds

COPY --from=builder /app/out/full .
COPY turbo.json turbo.json

ENV SKIP_ENV_VALIDATION true

RUN yarn turbo run build --filter=sora...

FROM node:lts-alpine AS runner
WORKDIR /app

ARG AMQP_URL
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG SETTINGS_SECRET

ENV AMQP_URL $AMQP_URL
ENV DATABASE_URL $DATABASE_URL
ENV NEXTAUTH_SECRET $NEXTAUTH_SECRET
ENV NEXTAUTH_URL $NEXTAUTH_URL
ENV SETTINGS_SECRET $SETTINGS_SECRET

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sora
USER sora

COPY --from=installer /app/apps/sora/next.config.mjs .
COPY --from=installer /app/apps/sora/package.json .

COPY --from=installer --chown=sora:nodejs /app/apps/sora/.next/standalone ./
COPY --from=installer --chown=sora:nodejs /app/apps/sora/.next/static ./apps/sora/.next/static
COPY --from=installer --chown=sora:nodejs /app/apps/sora/public ./apps/sora/public

EXPOSE 3000
CMD node apps/sora/server.js
