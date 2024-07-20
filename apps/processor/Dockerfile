FROM node:20 AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN <<EOF 
  apt-get update -y
  apt-get install libc6 libc++1 bash -y
  corepack enable
EOF

FROM base AS with-turbo
RUN npm install -g turbo

FROM with-turbo AS pruned-repo
WORKDIR /app

COPY . .
RUN turbo prune @sora-vp/processor --docker

FROM with-turbo as builder
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned-repo /app/out/json/ .
COPY --from=pruned-repo /app/out/yarn.lock ./yarn.lock
RUN yarn install --immutable

# Build the project and its dependencies
COPY --from=pruned-repo /app/out/full/ .
COPY turbo.json turbo.json

## This would be useful for browser environment variables that are actually baked at build time and you aren't passing them in otherwise.
# COPY .env.production .env.production  
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build --filter=@sora-vp/processor...

WORKDIR /app/apps/processor
RUN <<EOF
  mkdir -p /vote-processor
  yarn set version stable
  yarn pack -o /vote-processor/out.tgz
  cd /vote-processor
  echo '{ "name": "vote-processor", "type": "module" }' > package.json
  echo "nodeLinker: node-modules" > .yarnrc.yml
  yarn set version stable
  yarn add ./out.tgz
EOF

# Debugging purpose
# RUN <<EOF
#   apt-get install tree
#   tree /vote-processor
# EOF

FROM base AS runner
# Don't run production as root
RUN <<EOF 
  addgroup --system --gid 1001 nodejs
  adduser --system --uid 1001 processor
EOF

USER processor

COPY --from=builder --chown=processor:nodejs /vote-processor /vote-processor

WORKDIR /vote-processor

COPY <<EOF /vote-processor/index.js
"use strict";

import path from "path";
import { fileURLToPath } from "url";

import { consumeMessagesFromQueue } from "@sora-vp/processor";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDirectory = path.join(__dirname, "logs");

void consumeMessagesFromQueue(logsDirectory);
EOF

RUN mkdir -p /vote-processor/logs
RUN chown -R ${USER}:${USER} /vote-processor/logs

CMD ["node", "index.js"]
