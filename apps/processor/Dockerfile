FROM node:lts-alpine3.17 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate
COPY . .
RUN yarn dlx turbo prune --scope=vote-processor --docker

FROM node:lts-alpine3.17 AS installer-n-runner

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
RUN yarn turbo run build --filter=vote-processor

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vote

RUN chown vote:nodejs /app/apps/vote-processor
RUN chmod g+w /app/apps/vote-processor

RUN apk add --no-cache openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

USER vote

ENTRYPOINT dockerize -wait tcp://rabbitmq:5672 -wait tcp://mariadb:3306 -timeout 100s node apps/vote-processor/dist/index.js
