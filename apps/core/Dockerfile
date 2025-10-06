ARG NODE_VERSION=24
ARG PNPM_VERSION=latest
ARG TURBO_VERSION=latest


FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/home/node/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN pnpm add -g turbo@${TURBO_VERSION}


FROM base AS preparer
WORKDIR /workspace
COPY . .
RUN turbo telemetry disable
RUN turbo prune --docker space-core


FROM base AS installer
WORKDIR /install
COPY --from=preparer /workspace/out/json/ .
RUN pnpm install --frozen-lockfile


FROM base AS builder
WORKDIR /build
COPY --from=preparer /workspace/out/full/ .
COPY --from=installer /install .
RUN pnpm build --filter space-core
RUN pnpm deploy --filter space-core --prod --legacy /prod


FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY --from=builder /prod /app
ARG PORT=3334
EXPOSE ${PORT}
CMD ["pnpm", "start"]
