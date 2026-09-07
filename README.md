<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic Jellyfin Web fork with its own visual identity.</strong></p>
<p align="center">Current Velaris version: <strong>V0.0.4</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's media platform and compatibility while evolving the web client into a distinct Velaris experience with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Product direction

Velaris is designed as a standalone modern streaming experience, not as a visible Jellyfin skin. Jellyfin remains the technical foundation for server APIs, playback and media management, while the normal viewer-facing interface is progressively replaced by Velaris-specific branding, navigation, layouts and interaction patterns.

The design language combines useful ideas found across modern streaming services — content-first navigation, strong cinematic artwork, restrained chrome and responsive horizontal discovery — while keeping the resulting interface original to Velaris.

Velaris treats the core media destinations as first-class streaming categories. The intended primary order is Movies, Series, Anime, Anime Movies and Collections, followed by any additional custom libraries. The interface does not require those exact names to exist, but it recognizes common German and English variants and prioritizes them when present.

## V0.0.4 — Dynamic Franchise Hubs

V0.0.4 introduces the first Velaris-native universe and franchise layer. Hubs are generated from media that actually exists in the signed-in user's library, so empty franchise pages are never advertised in the normal viewer experience.

The current development scope includes:

- dynamic franchise discovery from Movies and Series already available to the current user
- automatic suppression of empty hubs and empty sub-groups
- a new Home shelf for available universes and franchises
- dedicated cinematic franchise pages with grouped horizontal media rows
- initial support for Marvel, DC, Star Wars, Wizarding World, Middle-earth, The Walking Dead, Breaking Bad, Dragon Ball, Naruto and One Piece
- structured sub-groups such as MCU, DCEU, DCU, Arrowverse, Batman, Elseworlds and similar franchise-specific eras or story worlds
- support for media appearing in multiple useful groups at the same time
- optional manual metadata tags such as `velaris:franchise:dc` or `velaris:group:arrowverse` when automatic matching needs help
- representative artwork selected from media already present in the library rather than bundled franchise artwork

The franchise catalog is intentionally data-driven and extensible. Additional universes can be added without rebuilding the page architecture.

## Previous milestone — V0.0.3

V0.0.3 introduced the first purpose-built Velaris application shell. The direction combines useful streaming-interface patterns without reproducing any one service: content-first horizontal navigation, strong brand hierarchy, immersive translucent chrome and a compact mobile drawer.

The milestone includes:

- an original translucent Velaris top navigation that visually blends into cinematic content
- Velaris-first product branding without exposing server names or server versions in normal primary navigation
- text-first desktop navigation for Home, Favorites and streaming categories
- priority placement for Movies, Series, Anime, Anime Movies and Collections when those libraries are available
- larger desktop navigation capacity so those core destinations stay visible before falling into overflow
- matching category order between the desktop navigation and mobile drawer
- distinct active-section indicators based on the Velaris cyan-to-magenta gradient
- a redesigned mobile drawer with clearer hierarchy and selected states
- refined toolbar utility controls and responsive spacing
- scoped app-shell classes to keep upstream Jellyfin merge conflicts manageable

## V0.0.2 — Visual Foundation

V0.0.2 introduced the native Velaris design system with centralized tokens, near-black surfaces, the cyan/blue/violet/magenta palette, unified buttons and forms, glass dialogs, polished cards and accessibility-focused motion/focus states.

The original Jellyfin themes remain available, but Velaris is the default appearance of this fork.

## V0.0.1 — Branding Foundation

V0.0.1 established the native Velaris identity with the new logo, favicon, PWA metadata, splash screen, header branding and `Velaris Web` client name.

The visible client identity is Velaris. References to Jellyfin are intentionally retained where they describe the upstream server, API, SDK, protocol, license or original project attribution. This keeps the fork technically honest and easier to synchronize with upstream.

## Branch strategy

- `master` — kept as close as practical to the upstream Jellyfin Web branch for easier syncing
- `velaris` — active Velaris Web development branch

Upstream project: [jellyfin/jellyfin-web](https://github.com/jellyfin/jellyfin-web)

## Build process

### Dependencies

- [Node.js](https://nodejs.org/en/download) 24 or newer
- npm 11 or newer

### Getting started

1. Clone the Velaris development branch.

   ```sh
   git clone -b velaris https://github.com/Homiiboy/velaris-web.git
   cd velaris-web
   ```

2. Install dependencies.

   ```sh
   npm install
   ```

3. Run the development server.

   ```sh
   npm start
   ```

4. Create a development build.

   ```sh
   npm run build:development
   ```

5. Create a production build.

   ```sh
   npm run build:production
   ```

## Validation

The `velaris` branch includes a dedicated Velaris CI workflow that runs TypeScript checks, ESLint, Stylelint, unit tests and a production build.

## Versioning

Velaris uses its own version line beginning with `V0.0.1`. The Jellyfin Web package version can remain aligned with the upstream codebase so upstream compatibility remains easier to track. The current Velaris version is stored in `VELARIS_VERSION`.

## License and upstream attribution

Velaris Web is derived from Jellyfin Web and remains licensed under the terms of the repository's [GPL-2.0-or-later license](LICENSE). Jellyfin and Jellyfin Web remain the work of the Jellyfin project and its contributors.

The Velaris-specific branding and modifications are maintained in this fork.
