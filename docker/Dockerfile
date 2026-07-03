# Shared image for apps/api and apps/workers — the compose service picks the
# entrypoint via `command`. Build context is the repo root.
#
# ponytail: single-stage build ships the full workspace (~large image) — split
# into multi-stage with `pnpm deploy` when image size starts to matter.
FROM node:22-alpine

RUN corepack enable
WORKDIR /repo

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=api --filter=workers

ENV NODE_ENV=production

CMD ["node", "apps/api/dist/main.js"]
