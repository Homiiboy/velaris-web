# Velaris for ZimaOS

This directory contains the ZimaOS-compatible app definition for Velaris Web V1.0.0.

## Container image

```text
ghcr.io/homiiboy/velaris-web:1.0.0
```

Supported architectures:

- `amd64`
- `arm64`

Velaris is a web client. Jellyfin remains responsible for authentication, users, libraries, playback, media management and transcoding.

## Install as a Custom App

1. Open the ZimaOS **App Store**.
2. Choose **Install a Custom App**.
3. Paste/import the contents of `Apps/Velaris/docker-compose.yml`.
4. Install the app.
5. Open the Velaris icon from the ZimaOS dashboard.
6. On first launch, enter the address of your Jellyfin server, for example `http://192.168.1.50:8096`.

ZimaOS can provide `WEBUI_PORT` automatically. If it does not, the app uses host port `8097` and container port `8080`.

## Persistence

No Docker volume is required for Velaris itself. Velaris-specific browser preferences are stored by the browser. Jellyfin remains the source of truth for users, libraries, watch state and playback data.

## Health check

The container exposes:

```text
/healthz
```

With the fallback port, open:

```text
http://ZIMAOS-IP:8097/healthz
```

Expected response:

```text
ok
```

## Security defaults

The app definition keeps the production Docker hardening used by Velaris CI:

- read-only root filesystem
- writable temporary `/tmp`
- `no-new-privileges`
- all additional Linux capabilities dropped
- automatic restart unless stopped
- container healthcheck

## Updating

The ZimaOS package intentionally pins the stable semantic-version image. When a new stable Velaris version is released, update both the image tag and the top-level `x-casaos.version` value together.

Do not replace the stable tag with `latest` unless you explicitly want the newest successfully validated `velaris` branch build rather than a fixed release.
