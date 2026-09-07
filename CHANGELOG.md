# Velaris Web Changelog

## V0.0.1 — 2026-09-07

### Added

- initial Velaris Web branding foundation
- official scalable Velaris logo asset
- dedicated scalable browser favicon and PWA icon
- Velaris splash-screen and default header logo treatment
- dedicated `VELARIS_VERSION` marker

### Changed

- initial browser title and application metadata from Jellyfin to Velaris
- web manifest name, short name, description, colors and icon references
- startup splash branding now uses the Velaris emblem on desktop, mobile and TV layouts
- default header branding now stays on Velaris even when Jellyfin theme styles are active
- modern toolbar and dashboard drawer fallbacks now use the Velaris emblem and Velaris name
- logo screensaver now renders the Velaris emblem on a black background
- README rewritten for the Velaris Web fork and upstream workflow

### Compatibility

- based on the current `jellyfin-web` fork state
- Jellyfin server/API terminology is intentionally retained where it describes the upstream backend or protocol
- no playback, authentication or server API behavior intentionally changed in V0.0.1
