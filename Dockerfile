ARG DUFS_IMAGE=sigoden/dufs:latest

FROM node:22-alpine AS assets-builder
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY assets ./assets
COPY scripts ./scripts
RUN npm run build:assets

FROM ${DUFS_IMAGE}

LABEL org.opencontainers.image.title="dufs-tabler-web"
LABEL org.opencontainers.image.description="Dufs with local Tabler-based web assets"
LABEL org.opencontainers.image.source="https://github.com/sigoden/dufs"

COPY --from=assets-builder /build/dist/assets /assets

EXPOSE 5000
VOLUME ["/data"]

CMD ["/data", "-A", "--assets", "/assets", "-b", "0.0.0.0", "-p", "5000"]
