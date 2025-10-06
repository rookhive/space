ARG NODE_VERSION=24
ARG PNPM_VERSION=latest
ARG TURBO_VERSION=latest


FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/home/node/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip make g++ build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN pnpm add -g turbo@${TURBO_VERSION}


FROM base AS preparer
WORKDIR /workspace
COPY . .
RUN turbo telemetry disable
RUN turbo prune --docker space-sfu


FROM base AS installer
WORKDIR /install
COPY --from=preparer /workspace/out/json/ .
ENV MEDIASOUP_SKIP_WORKER_PREBUILT_DOWNLOAD=true
RUN pnpm install --frozen-lockfile


FROM base AS builder
WORKDIR /build
COPY --from=preparer /workspace/out/full/ .
COPY --from=installer /install .
RUN pnpm build --filter space-sfu
RUN pnpm deploy --filter space-sfu --prod --legacy /prod


FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY --from=builder /prod /app
ARG PORT=3335
ARG MEDIASOUP_MIN_PORT=10000
ARG MEDIASOUP_MAX_PORT=10099
EXPOSE ${PORT}
EXPOSE ${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}/udp
EXPOSE ${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}/tcp
CMD ["pnpm", "start"]
