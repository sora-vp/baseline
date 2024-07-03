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
RUN turbo prune @sora-vp/client-attendance --docker

# Debugging purpose
RUN <<EOF
  apt-get install tree
  tree /app
EOF

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
RUN turbo run build --filter=@sora-vp/client-attendance...

# Debugging purpose
RUN <<EOF
  apt-get install tree
  tree /app
EOF

FROM nginx

COPY --from=builder /app/apps/clients/attendance/dist /usr/share/nginx/html

# FROM base AS runner
# # Don't run production as root
# RUN <<EOF 
#   addgroup --system --gid 1001 nodejs
#   adduser --system --uid 1001 attendance
# EOF

# USER attendance

# COPY --from=builder --chown=nextjs:nodejs /db-migrate /db-migrate

# WORKDIR /app

# EXPOSE 3000
# ENV PORT=3000
# ENV AUTH_TRUST_HOST=true

# ENV NODE_ENV=production

# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js .
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json .

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# COPY --from=pruned-repo /app/start-web.sh .

# RUN mkdir -p /app/apps/web/public/uploads/
# RUN chown -R ${USER}:${USER} /app/apps/web/public/uploads/

# CMD ["/bin/sh", "/app/start-web.sh"]
