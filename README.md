<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic streaming frontend based on Jellyfin Web.</strong></p>
<p align="center">Current Velaris version: <strong>V0.2.0</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's proven media platform, server APIs, playback stack and compatibility while evolving the viewer experience into a distinct Velaris product with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Current status

**V0.2.0 — Smart Home & Personalization is complete.**

V0.2.0 is the first feature phase after the hardened V0.1.0 foundation. Home now contains profile-aware Velaris recommendation rows and native Continue Watching controls while continuing to use the existing Jellyfin-compatible library and user-data APIs underneath.

The current milestone includes:

- profile-scoped Smart Home preferences
- configurable Smart Home row order and visibility
- Velaris-native Continue Watching with Resume
- reset/remove progress and mark-as-watched actions
- recent-viewing genre signals for recommendations
- “Because you watched …” personalized discovery
- “For tonight” movie suggestions
- “Short & good” short-movie discovery
- unseen-media recommendations
- automatic empty-row suppression
- cross-row recommendation deduplication
- recommendation priority that follows the configured row order
- responsive desktop/mobile/TV behavior and reduced-motion support
- automated tests for preference repair, ordering, visibility, runtime classification, personalization and deduplication

V0.2.0 passed the complete Velaris CI pipeline: TypeScript, repository ESLint, zero-warning Velaris strict lint, Stylelint, unit tests, production build and generated-bundle ES compatibility validation.

Detailed notes are available in [`docs/V0.2.0.md`](docs/V0.2.0.md).

## Roadmap to V1.0.0

Velaris is being developed through feature phases. **V1.0.0 will be the first officially stable release.** V0.x builds remain development milestones until the feature-complete and stabilization phases are finished.

The full roadmap, including every completed milestone and all planned feature phases, lives in [`ROADMAP.md`](ROADMAP.md).

| Version | Phase | Status |
| --- | --- | --- |
| V0.0.1–V0.0.9 | Visual/product foundation | ✅ Complete |
| V0.1.0 | Foundation Hardening | ✅ Complete |
| V0.2.0 | Smart Home & Personalization | ✅ Complete |
| V0.3.0 | Franchise Studio & Watch Orders | ⏳ Planned |
| V0.4.0 | Discovery, Watchlists & Smart Lists | ⏳ Planned |
| V0.5.0 | Profiles 2.0 | ⏳ Planned |
| V0.6.0 | Advanced Player | ⏳ Planned |
| V0.7.0 | TV Mode & App Experience | ⏳ Planned |
| V0.8.0 | Control Center & Customization | ⏳ Planned |
| V0.9.0 | Release Hub, Insights & Feature Complete | ⏳ Planned |
| V1.0.0 | First Stable Release | 🎯 Target |

## What is already in Velaris

The completed foundation includes native Velaris branding and theme, a dedicated app shell and streaming navigation, Dynamic Franchise Hubs, cinematic Home and Spotlight, profile/login/account surfaces, cinematic Movie/Series/Anime details, redesigned Libraries/Collections/Search, a Velaris player experience, hardened routing and failure handling, and the V0.2.0 Smart Home personalization layer.

The viewer-facing product treats Movies, Series, Anime, Anime Movies and Collections as first-class destinations when those libraries exist. Franchise and Smart Home surfaces are data-driven and disappear cleanly when no relevant media is available.

## Product direction

Velaris is designed as a standalone modern streaming experience, not as a visible Jellyfin skin. Jellyfin remains the technical foundation for server APIs, authentication, playback, transcoding and media management, while the normal viewer-facing interface is progressively replaced by Velaris-specific branding, navigation, layouts and interaction patterns.

The design language combines useful ideas found across modern streaming services — content-first navigation, cinematic artwork, restrained chrome and responsive horizontal discovery — while keeping the resulting interface original to Velaris.

## Branch strategy

- `master` — kept as close as practical to upstream Jellyfin Web for easier syncing
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

The `velaris` branch includes a dedicated Velaris CI workflow that runs:

- TypeScript checks
- repository ESLint
- strict zero-warning lint over critical Velaris paths
- Stylelint
- unit tests
- production build
- ES compatibility scan of the generated bundle

A feature phase is not considered complete until the complete validation pipeline passes.

## Versioning and release policy

Velaris uses its own release line, stored in `VELARIS_VERSION`, while the Jellyfin Web package version can remain aligned with the upstream codebase for easier compatibility tracking.

- `V0.x` — feature development and pre-stable milestones
- `V0.9.0` — planned Feature Complete milestone
- `V1.0.0` — first Stable release after a dedicated final hardening phase

## License and upstream attribution

Velaris Web is derived from Jellyfin Web and remains licensed under the terms of the repository's [GPL-2.0-or-later license](LICENSE). Jellyfin and Jellyfin Web remain the work of the Jellyfin project and its contributors.

The Velaris-specific branding and modifications are maintained in this fork.
