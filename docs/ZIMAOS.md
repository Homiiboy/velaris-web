# Velaris Web — ZimaOS deployment

Velaris V1.0.0 includes a ZimaOS-compatible app package in `Apps/Velaris/`.

The package follows the ZimaOS/CasaOS app model: standard Docker Compose for runtime configuration plus a top-level `x-casaos` block for App Store metadata and launch information.

## Requirements

- ZimaOS with Docker/App Store support
- network access to GitHub Container Registry (`ghcr.io`)
- an existing Jellyfin server reachable by the browser that will open Velaris

Velaris does not replace the Jellyfin server. It is the viewer-facing web client; Jellyfin remains the backend for login, users, libraries, watch state, playback and transcoding.

## Install through ZimaOS Custom App

1. Open the ZimaOS web dashboard.
2. Open **App Store**.
3. Choose **Install a Custom App**.
4. Import or paste the contents of:

   ```text
   Apps/Velaris/docker-compose.yml
   ```

5. Confirm the app configuration and install it.
6. Open **Velaris** from the ZimaOS dashboard.
7. On first launch, enter your Jellyfin server URL, for example:

   ```text
   http://192.168.1.50:8096
   ```

## Image

The app package pins the stable image:

```text
ghcr.io/homiiboy/velaris-web:1.0.0
```

The image supports:

- `linux/amd64`
- `linux/arm64`

The GHCR package must be public for anonymous one-click installation. If the package is private, ZimaOS needs registry credentials with package-read permission.

## Web port

Velaris listens on container port `8080`.

The ZimaOS package uses:

```text
${WEBUI_PORT:-8097}
```

This lets ZimaOS assign a free Web UI port where supported. If `WEBUI_PORT` is not provided, host port `8097` is used.

The top-level `x-casaos.port_map` uses the same value, so the dashboard launch button opens the correct endpoint.

## Health check

Velaris exposes a lightweight health endpoint:

```text
/healthz
```

For the fallback port:

```text
http://ZIMAOS-IP:8097/healthz
```

Expected response:

```text
ok
```

## Storage and volumes

Velaris does not require a persistent Docker volume.

Velaris-specific client preferences remain in browser storage. Jellyfin remains the persistent backend for users, libraries, media metadata, watch state and playback information.

This also means the ZimaOS app does not need access to `/DATA/Media` or Jellyfin's configuration directory.

## Security defaults

The ZimaOS package mirrors the production Docker hardening already validated in Velaris CI:

- read-only root filesystem
- temporary writable `/tmp`
- `no-new-privileges:true`
- `cap_drop: ALL`
- restart policy `unless-stopped`
- container healthcheck

## App Store metadata

The app source lives at:

```text
Apps/Velaris/docker-compose.yml
```

Stable protocol identity:

```text
com.novarion.velaris
```

The package includes English and German metadata and declares the ZimaOS `Media` category plus `amd64` and `arm64` architectures.

The app icon is stored with the package at:

```text
Apps/Velaris/icon.svg
```

This structure is intentionally compatible with a future Novarion third-party ZimaOS App Store, where `Apps/Velaris/` can be reused as the source package without redesigning the runtime definition.

## Updating Velaris

For stable installations, keep semantic-version tags pinned.

When Velaris V1.0.1 or a later stable release is published:

1. update the image tag in `Apps/Velaris/docker-compose.yml`
2. update `x-casaos.version`
3. update `x-casaos.update_at` and release notes
4. validate the ZimaOS Compose package
5. install/update the package through the store or Custom App flow

Using `latest` is possible but intentionally not the default because it follows the newest successfully validated commit on the `velaris` branch rather than a fixed stable release.

## Troubleshooting

### App does not open

Check the selected host port and confirm that it matches the value shown by ZimaOS for the Velaris Web UI.

### Image cannot be pulled

Confirm that `ghcr.io/homiiboy/velaris-web:1.0.0` is publicly visible and that the ZimaOS host can reach `ghcr.io`.

### Velaris opens but Jellyfin cannot connect

The browser connects directly to the Jellyfin URL selected in Velaris. Use an address reachable from the client device opening Velaris, not `localhost` unless Jellyfin actually runs on that same client device.

Typical LAN example:

```text
Velaris:  http://192.168.1.50:8097
Jellyfin: http://192.168.1.50:8096
```

### HTTPS / reverse proxy

If Velaris is served over HTTPS through a reverse proxy, use an HTTPS-reachable Jellyfin URL as well. Browsers can block HTTP Jellyfin requests from an HTTPS Velaris page as mixed content.
