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

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ARG TURBO_API
ENV TURBO_API=$TURBO_API

RUN yarn generate

ENV SKIP_ENV_VALIDATION true
RUN yarn turbo run build --filter=sora...

FROM node:lts-alpine3.17 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sora

RUN chown sora:nodejs /app
RUN chmod g+w /app

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

USER sora

COPY --from=installer /app/apps/sora/next.config.mjs .
COPY --from=installer /app/apps/sora/package.json .

COPY --from=installer --chown=sora:nodejs /app/apps/sora/.next/standalone ./
COPY --from=installer --chown=sora:nodejs /app/apps/sora/.next/static ./apps/sora/.next/static
COPY --from=installer --chown=sora:nodejs /app/apps/sora/public ./apps/sora/public

EXPOSE 3000
ENTRYPOINT dockerize -wait tcp://rabbitmq:5672 -wait tcp://mariadb:3306 -timeout 100s node apps/sora/server.js
