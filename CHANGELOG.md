# Velaris Web Changelog

## V0.0.3 — 2026-09-07 — Navigation & App Shell (development)

### Added

- original Velaris app shell inspired by the strongest navigation patterns from major streaming services without copying a single service layout
- immersive translucent top navigation with a cinematic edge fade into page content
- dedicated desktop navigation treatment for Velaris branding, Home, Favorites, libraries and active sections
- dedicated mobile drawer treatment with stronger hierarchy and selected-state markers
- app-shell classes that keep the new layout scoped to Velaris-specific styling
- explicit Home destination in the desktop streaming navigation
- Velaris-specific library ordering for Movies, Series, Anime, Anime Movies and Collections
- shared library ordering between desktop navigation and the mobile drawer

### Changed

- normal navigation now presents the product as Velaris instead of exposing the Jellyfin server name or server version in primary chrome
- desktop navigation is now text-first with a restrained gradient active indicator instead of admin-style rounded controls
- the Velaris brand mark now links directly to Home and receives a stronger streaming-service wordmark treatment
- toolbar utility actions use lighter visual weight while the user avatar gets a subtle premium ring treatment
- core media libraries are prioritized ahead of custom links so the main streaming destinations remain easy to reach
- desktop navigation capacity was increased so Movies, Series, Anime, Anime Movies and Collections can remain visible on common desktop widths
- mobile drawer sections use clearer spacing, stronger selected states and a cinematic black surface
- the main application canvas now carries subtle cyan and violet ambient light from the Velaris palette

### Design direction

- Netflix contributes the content-first horizontal navigation idea
- Disney+ contributes clear brand-first hierarchy and restrained navigation density
- Paramount+ contributes the immersive relationship between navigation and cinematic content
- Velaris combines those ideas into an original cyan/violet visual system rather than reproducing any service one-to-one
- the normal viewer experience should feel like a standalone streaming service; Jellyfin terminology remains only where technically or legally appropriate
- Movies, Series, Anime, Anime Movies and Collections are treated as first-class destinations in future home, discovery and detail layouts

### Compatibility

- playback, authentication, Jellyfin server APIs and media handling remain unchanged
- navigation behavior and route structure are preserved while the presentation layer is redesigned
- library ordering recognizes common German and English names while preserving server order for unrelated custom libraries

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
