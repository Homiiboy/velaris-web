# Velaris Web Changelog

## V0.0.3 — 2026-09-07 — Navigation & App Shell (development)

### Added

- original Velaris app shell inspired by the strongest navigation patterns from major streaming services without copying a single service layout
- immersive translucent top navigation with a cinematic edge fade into page content
- dedicated desktop navigation treatment for server branding, libraries and active sections
- dedicated mobile drawer treatment with stronger hierarchy and selected-state markers
- app-shell classes that keep the new layout scoped to Velaris-specific styling

### Changed

- desktop navigation now uses compact rounded controls, restrained glass surfaces and a gradient active indicator
- toolbar utility actions use lighter visual weight so content remains the focus
- mobile drawer sections use clearer spacing, stronger selected states and a cinematic black surface
- the main application canvas now carries subtle cyan and violet ambient light from the Velaris palette

### Design direction

- Netflix contributes the content-first horizontal navigation idea
- Disney+ contributes clear brand-first hierarchy and restrained navigation density
- Paramount+ contributes the immersive relationship between navigation and cinematic content
- Velaris combines those ideas into an original cyan/violet visual system rather than reproducing any service one-to-one

### Compatibility

- playback, authentication, Jellyfin server APIs and media handling remain unchanged
- navigation behavior and route structure are preserved while the presentation layer is redesigned

## V0.0.2 — 2026-09-07 — Visual Foundation

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

### Validation

- V0.0.2 development commits are validated by Velaris CI with TypeScript, ESLint, Stylelint, unit tests and a production build

### Compatibility

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
