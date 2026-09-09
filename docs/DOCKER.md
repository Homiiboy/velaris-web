# Velaris Web — Docker deployment

Velaris V1.0.0 is distributed as a production container through GitHub Container Registry (GHCR). The container serves only the Velaris web client; authentication, users, libraries, playback and transcoding remain on the Jellyfin server.

## Published image

Stable release:

```text
ghcr.io/homiiboy/velaris-web:1.0.0
```

Additional tags:

```text
ghcr.io/homiiboy/velaris-web:1.0
ghcr.io/homiiboy/velaris-web:latest
ghcr.io/homiiboy/velaris-web:sha-<commit>
```

`latest` tracks the latest successfully validated `velaris` branch commit. Semantic version tags are only published from explicit `release(velaris): ...` commits, so normal maintenance pushes do not overwrite an existing release tag.

Images are built for:

- `linux/amd64`
- `linux/arm64`

## Docker Desktop

Open **Images** in Docker Desktop and pull:

```text
ghcr.io/homiiboy/velaris-web:1.0.0
```

Then create a container from that image and map:

```text
Host port:      8097
Container port: 8080
```

No persistent volume is required. Velaris-specific browser preferences stay in the browser; users, media libraries, watch state and playback data remain in Jellyfin.

Recommended container settings:

- name: `velaris`
- restart policy: `unless-stopped`
- read-only root filesystem when supported
- temporary writable `/tmp`
- no additional Linux capabilities
- no-new-privileges enabled

After startup open:

```text
http://SERVER-IP:8097
```

On first launch, enter the address of the Jellyfin server, for example:

```text
http://JELLYFIN-IP:8096
```

## Docker Compose — registry image

The repository's default `docker-compose.yml` uses the published GHCR image instead of building locally.

```sh
git clone -b velaris https://github.com/Homiiboy/velaris-web.git
cd velaris-web
docker compose pull
docker compose up -d
```

Default image and port:

```text
ghcr.io/homiiboy/velaris-web:1.0.0
8097 -> 8080
```

Check status:

```sh
docker compose ps
```

Logs:

```sh
docker compose logs -f velaris
```

Health endpoint:

```sh
curl http://SERVER-IP:8097/healthz
```

Expected response:

```text
ok
```

## Update the container

For the pinned stable tag, change `VELARIS_VERSION` when a newer stable version is released.

For `latest`, use:

```sh
docker compose pull
docker compose up -d
```

## Environment settings

Copy the example environment file when you want to override defaults:

```sh
cp .env.example .env
```

Available values:

```text
VELARIS_IMAGE=ghcr.io/homiiboy/velaris-web
VELARIS_VERSION=1.0.0
VELARIS_PORT=8097
VELARIS_COMMIT=local
```

`VELARIS_COMMIT` is only used by the optional local-build override.

## Local build fallback

The normal Compose file pulls GHCR. To build from source locally instead:

```sh
docker compose \
  -f docker-compose.yml \
  -f docker-compose.build.yml \
  up -d --build
```

This keeps local development separate from the normal registry-based deployment path.

## Run directly with Docker

Pull the stable image:

```sh
docker pull ghcr.io/homiiboy/velaris-web:1.0.0
```

Run it:

```sh
docker run -d \
  --name velaris \
  --restart unless-stopped \
  -p 8097:8080 \
  --read-only \
  --tmpfs /tmp:size=64m,mode=1777 \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  ghcr.io/homiiboy/velaris-web:1.0.0
```

## GHCR visibility

The first GHCR publication can initially inherit a private package visibility depending on GitHub account/package settings. For one-click pulls from Docker Desktop without authentication, set the Velaris container package to **Public** once in GitHub:

1. Open the Velaris package under the GitHub account's **Packages** section.
2. Open **Package settings**.
3. Use **Change visibility** and select **Public**.

If the package remains private, authenticate Docker/Desktop to GHCR with a GitHub token that has package read permission before pulling.

## Automated publishing

The Velaris CI validates the application and local Docker runtime first. Only after the `validate` job succeeds does the GHCR publishing job run on pushes to `velaris`.

The publish job:

- logs in to `ghcr.io` using GitHub Actions' repository token
- builds `linux/amd64` and `linux/arm64`
- pushes `latest` and a commit-specific SHA tag for every green `velaris` push
- adds semantic version tags only for explicit `release(velaris): ...` commits

This prevents a failed CI state from becoming the registry's `latest` image.

## Reverse proxy / HTTPS

A reverse proxy such as Caddy, Nginx Proxy Manager or Traefik can point to:

```text
http://VELARIS-SERVER-IP:8097
```

The Velaris container itself does not terminate TLS. If Velaris is exposed over HTTPS, use an HTTPS-reachable Jellyfin address as well to avoid browser mixed-content blocking.

## Jellyfin connectivity

The Docker container does not proxy Jellyfin API traffic. The browser connects directly to the Jellyfin server selected in Velaris. Make sure the device opening Velaris can reach that Jellyfin URL.

Typical LAN setup:

```text
Velaris:  http://192.168.1.50:8097
Jellyfin: http://192.168.1.50:8096
```
