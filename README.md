<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic streaming frontend based on Jellyfin Web.</strong></p>
<p align="center">Current development version: <strong>V0.4.0</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's proven media platform, server APIs, playback stack and compatibility while evolving the viewer experience into a distinct Velaris product with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Current status

**V0.4.0 — Discovery, Watchlists & Smart Lists is complete and validated.**

V0.4.0 adds a dedicated decision-making layer to Velaris: users can discover media across their libraries, filter it deeply, maintain personal lists and use automatically generated Smart Lists without changing server metadata or the existing playback stack.

The completed V0.4.0 scope includes:

- dedicated `/discovery` route and first-class desktop/mobile navigation entry
- mixed Movie and Series discovery backed by the connected media libraries
- reliable Anime and Anime Movie filtering derived from library context and media type
- title/original-title/genre search
- filters for content type, genre, watched state, runtime, production year and community rating
- “Surprise me” action using the complete active result set
- Smart Lists for unseen media, short movies, highly rated titles and recently added media
- profile-scoped Watchlist and custom named lists
- add/remove controls directly on Discovery cards
- full Watchlist/custom-list browsing in the main result area
- defensive versioned browser-storage persistence and cross-tab synchronization
- paged per-library loading instead of a fixed 500-title ceiling
- deterministic cross-library deduplication and newest-first ordering
- incremental 60-title rendering batches for large result sets
- graceful partial-library warnings that preserve already loaded media
- defensive handling for missing or invalid runtime/year/rating/date metadata
- expanded regression tests for paging, Anime classification, metadata edge cases, list storage, Smart Lists and Surprise Me

The code-complete V0.4.0 implementation passed the full Velaris CI pipeline in Run #88. Detailed release notes are available in [`docs/V0.4.0.md`](docs/V0.4.0.md).

V0.5.0 — Profiles 2.0 is the next planned feature phase.

## Roadmap to V1.0.0

Velaris is being developed through feature phases. **V1.0.0 will be the first officially stable release.** V0.x builds remain development milestones until the feature-complete and stabilization phases are finished.

The full roadmap lives in [`ROADMAP.md`](ROADMAP.md).

| Version | Phase | Status |
| --- | --- | --- |
| V0.0.1–V0.0.9 | Visual/product foundation | ✅ Complete |
| V0.1.0 | Foundation Hardening | ✅ Complete |
| V0.2.0 | Smart Home & Personalization | ✅ Complete |
| V0.3.0 | Franchise Studio & Watch Orders | ✅ Complete |
| V0.4.0 | Discovery, Watchlists & Smart Lists | ✅ Complete |
| V0.5.0 | Profiles 2.0 | ⏳ Planned |
| V0.6.0 | Advanced Player | ⏳ Planned |
| V0.7.0 | TV Mode & App Experience | ⏳ Planned |
| V0.8.0 | Control Center & Customization | ⏳ Planned |
| V0.9.0 | Release Hub, Insights & Feature Complete | ⏳ Planned |
| V1.0.0 | First Stable Release | 🎯 Target |

## What is already in Velaris

The completed foundation includes native Velaris branding and theme, a dedicated app shell and streaming navigation, Dynamic Franchise Hubs, cinematic Home and Spotlight, profile/login/account surfaces, cinematic Movie/Series/Anime details, redesigned Libraries/Collections/Search, a Velaris player experience, hardened routing and failure handling, Smart Home personalization, the Franchise Studio with editable universes and Watch Orders, and the V0.4.0 Discovery Center with Watchlists and Smart Lists.

The viewer-facing product treats Movies, Series, Anime, Anime Movies and Collections as first-class destinations when those libraries exist. Franchise, Smart Home and Discovery surfaces are data-driven and avoid fake promotional media.

## Product direction

Velaris is designed as a standalone modern streaming experience, not as a visible Jellyfin skin. Jellyfin remains the technical foundation for server APIs, authentication, playback, transcoding and media management, while the normal viewer-facing interface is progressively replaced by Velaris-specific branding, navigation, layouts and interaction patterns.

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

4. Create a production build.

   ```sh
   npm run build:production
   ```

## Validation

The `velaris` branch includes a dedicated Velaris CI workflow that runs TypeScript, repository ESLint, strict zero-warning lint over Velaris-owned paths, Stylelint, unit tests, the production build and an ES compatibility scan of the generated bundle.

A feature phase is not considered complete until the complete validation pipeline passes.

## Versioning and release policy

Velaris uses its own release line, stored in `VELARIS_VERSION`, while the Jellyfin Web package version can remain aligned with the upstream codebase for easier compatibility tracking.

- `V0.x` — feature development and pre-stable milestones
- `V0.9.0` — planned Feature Complete milestone
- `V1.0.0` — first Stable release after a dedicated final hardening phase

## License and upstream attribution

Velaris Web is derived from Jellyfin Web and remains licensed under the terms of the repository's [GPL-2.0-or-later license](LICENSE). Jellyfin and Jellyfin Web remain the work of the Jellyfin project and its contributors.
