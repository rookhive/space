ARG NODE_VERSION=24
ARG PNPM_VERSION=latest
ARG TURBO_VERSION=latest


FROM node:${NODE_VERSION}-slim AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/home/node/.local/share/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate


FROM base AS preparer
WORKDIR /workspace
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} telemetry disable
RUN pnpm dlx turbo@${TURBO_VERSION} prune --docker space-client


FROM base AS installer
WORKDIR /install
COPY --from=preparer /workspace/out/json/ .
RUN pnpm install --frozen-lockfile


FROM base AS builder
WORKDIR /build
COPY --from=preparer /workspace/out/full/ .
COPY --from=installer /install .
ARG VITE_API_URL
ARG VITE_CORE_URL
ARG VITE_SFU_URL
ARG VITE_REPOSITORY_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CORE_URL=${VITE_CORE_URL}
ENV VITE_SFU_URL=${VITE_SFU_URL}
ENV VITE_REPOSITORY_URL=${VITE_REPOSITORY_URL}
RUN pnpm build --filter space-client
RUN pnpm deploy --filter space-client --prod --legacy /prod


FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
COPY --from=builder /prod /app
ARG PORT=3333
EXPOSE ${PORT}
CMD ["node", ".output/server/index.mjs"]
