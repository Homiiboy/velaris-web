# Velaris Web Changelog

## V0.0.2 — 2026-09-07 — Visual Foundation (development)

### Added

- native `velaris` theme as the default Velaris Web appearance
- centralized Velaris design tokens derived from the logo palette
- modular styling foundation for surfaces, buttons, forms, navigation, dialogs and accessibility
- cyan → blue → violet → magenta → pink accent gradient system
- dedicated MUI color scheme matching the legacy Jellyfin component palette
- reduced-motion support and consistent keyboard focus treatment

### Changed

- Velaris now defaults to its own theme while keeping upstream themes selectable
- dark surfaces use a near-black cinematic palette with subtle cyan and violet ambient lighting
- cards, lists, dialogs and drawers use a consistent radius, border, shadow and glass treatment
- form controls, interactive states and progress indicators now share the Velaris accent language

### Compatibility

- this version is still in development
- playback, authentication, server APIs and media handling remain intentionally unchanged
- the design system is isolated in Velaris-specific theme/style files to reduce upstream merge conflicts

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
