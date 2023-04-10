FROM node:lts-alpine AS builder

RUN yarn set version stable

WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=sora --docker

FROM node:lts-alpine AS installer

WORKDIR /app

RUN yarn set version stable
COPY .gitignore .gitignore
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

COPY --from=builder /app/out/full .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=sora...

FROM node:lts-alpine AS runner

WORKDIR /app

COPY --from=installer /app .

WORKDIR /app/apps/sora
RUN npx prisma generate

EXPOSE 3000
CMD ["yarn", "start"]

# # Set working directory
# WORKDIR /app
#
# # Copy package.json and yarn.lock to the container
# COPY package.json yarn.lock ./
#
# # Install dependencies with Yarn
# RUN corepack prepare yarn@3.5.0 --activate \
#     && yarn install --frozen-lockfile --non-interactive
#
# # Copy the rest of the application code to the container
# COPY . .
#
# # Build the application
# RUN yarn build
#
# # Expose the application port
# EXPOSE 3000
#
# # Start the application
# CMD ["yarn", "start"]
