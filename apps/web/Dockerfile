FROM node:20 AS base
# LABEL fly_launch_runtime="Next.js"
ENV NEXT_TELEMETRY_DISABLED=1
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
RUN turbo prune @sora-vp/web @sora-vp/db @sora-vp/db-migrate --docker

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
RUN CI=true SKIP_ENV_VALIDATION=true DB_HOST="something" DB_NAME="something" DB_USERNAME="something" DB_PASSWORD="something" turbo run build --filter=@sora-vp/web... --filter=@sora-vp/db-migrate...

# Debugging purpose
# RUN <<EOF
#   apt-get install tree
#   tree /app
# EOF

WORKDIR /app/packages/db-migrate
RUN <<EOF
  mkdir -p /db-migrate
  yarn set version stable
  yarn pack -o /db-migrate/out.tgz
  cd /db-migrate
  echo '{ "name": "db-migrate", "type": "module" }' > package.json
  echo "nodeLinker: node-modules" > .yarnrc.yml
  yarn set version stable
  yarn add ./out.tgz
EOF

# This is the fly.io release_command that performs a migration
COPY <<EOF /db-migrate/db-migrate-release-command.sh 
  #!/bin/bash
  set -e
  cd /db-migrate
  node node_modules/@sora-vp/db-migrate/dist/index.js 
EOF

FROM base AS runner
# Don't run production as root
RUN <<EOF 
  addgroup --system --gid 1001 nodejs
  adduser --system --uid 1001 nextjs
EOF

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /db-migrate /db-migrate

WORKDIR /app

EXPOSE 3000
ENV PORT=3000
ENV AUTH_TRUST_HOST=true

ENV NODE_ENV=production

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js .
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

COPY --from=pruned-repo /app/start-web.sh .

RUN mkdir -p /app/apps/web/public/uploads/
RUN chown -R ${USER}:${USER} /app/apps/web/public/uploads/

CMD ["/bin/sh", "/app/start-web.sh"]
