FROM node:lts-alpine3.17 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate
COPY . .
RUN yarn dlx turbo prune --scope=vote-processoar --docker

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

RUN yarn generate
RUN yarn turbo run build --filter=vote-processor

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vote

ENTRYPOINT yarn db:migrate:deploy && node apps/vote-processor
