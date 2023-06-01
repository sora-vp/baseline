FROM node:lts-alpine3.17 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate
COPY . .
RUN yarn dlx turbo prune --scope=@sora/web --docker

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

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ARG TURBO_API
ENV TURBO_API=$TURBO_API

RUN yarn db:generate

ENV SKIP_ENV_VALIDATION true
RUN yarn turbo run build --filter=@sora/web...

FROM node:lts-alpine3.17 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 web

RUN chown web:nodejs /app
RUN chmod g+w /app

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

USER web

COPY --from=installer /app/apps/web/next.config.mjs .
COPY --from=installer /app/apps/web/package.json .

COPY --from=installer --chown=web:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=web:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=web:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENTRYPOINT dockerize -wait tcp://rabbitmq:5672 -wait tcp://mariadb:3306 -timeout 100s node apps/web/server.js
