# Velaris Web — Docker deployment

Velaris V1.0.0 can run as a standalone production container next to Jellyfin. The container serves only the Velaris web client; authentication, users, libraries, playback and transcoding remain on the Jellyfin server.

## Requirements

- Docker Engine
- Docker Compose v2 (`docker compose`)

## Quick start

```sh
git clone -b velaris https://github.com/Homiiboy/velaris-web.git
cd velaris-web
docker compose up -d --build
```

Open Velaris in a browser:

```text
http://SERVER-IP:8097
```

On first launch, enter the address of your Jellyfin server, for example:

```text
http://JELLYFIN-IP:8096
```

Velaris does not require a persistent Docker volume. Viewer state stays in Jellyfin or in the browser's Velaris preferences.

## Container layout

- Host port: `8097` by default
- Container port: `8080`
- Runtime: unprivileged Nginx
- Restart policy: `unless-stopped`
- Health endpoint: `/healthz`
- Root filesystem: read-only
- Writable temporary path: `/tmp`
- Linux capabilities: dropped
- `no-new-privileges`: enabled

## Check status

```sh
docker compose ps
```

A healthy container should show `healthy` after startup.

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

## Stop and start

```sh
docker compose stop
docker compose start
```

Remove the running container while keeping the locally built image:

```sh
docker compose down
```

## Update Velaris

```sh
git switch velaris
git pull
docker compose up -d --build
```

Docker Compose will rebuild the production bundle and recreate the container when necessary.

## Change the port

Copy the example environment file:

```sh
cp .env.example .env
```

Then change:

```text
VELARIS_PORT=8097
```

For example, to use port 8088:

```text
VELARIS_PORT=8088
```

Then recreate the container:

```sh
docker compose up -d
```

## Run without Compose

Build the image:

```sh
docker build \
  --build-arg VELARIS_VERSION=1.0.0 \
  --build-arg VELARIS_COMMIT=local \
  -t velaris-web:1.0.0 .
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
  velaris-web:1.0.0
```

## Reverse proxy / HTTPS

A reverse proxy such as Caddy, Nginx Proxy Manager or Traefik can point to:

```text
http://VELARIS-SERVER-IP:8097
```

The Velaris container itself does not terminate TLS. This keeps certificates and public routing in the same reverse-proxy layer as the rest of the homelab.

## Jellyfin connectivity

The Docker container does not proxy Jellyfin API traffic. The browser connects directly to the Jellyfin server selected in Velaris. Make sure the device opening Velaris can reach that Jellyfin URL.

For LAN use, a typical pair is:

```text
Velaris:  http://192.168.1.50:8097
Jellyfin: http://192.168.1.50:8096
```

If Velaris is exposed over HTTPS, use an HTTPS-reachable Jellyfin address as well to avoid browser mixed-content blocking.
