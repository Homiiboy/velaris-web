# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build:production

FROM nginxinc/nginx-unprivileged:alpine AS runtime

ARG VELARIS_VERSION=1.0.0
ARG VELARIS_COMMIT=unknown

LABEL org.opencontainers.image.title="Velaris Web" \
      org.opencontainers.image.description="Velaris Web - cinematic Jellyfin-compatible frontend" \
      org.opencontainers.image.version="${VELARIS_VERSION}" \
      org.opencontainers.image.revision="${VELARIS_COMMIT}" \
      org.opencontainers.image.source="https://github.com/Homiiboy/velaris-web" \
      org.opencontainers.image.licenses="GPL-2.0-or-later"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
