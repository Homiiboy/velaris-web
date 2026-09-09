<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic streaming frontend based on Jellyfin Web.</strong></p>
<p align="center">Current development version: <strong>V0.9.0</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's proven media platform, server APIs, playback stack and compatibility while evolving the viewer experience into a distinct Velaris product with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Current status

**V0.9.0 — Release Hub, Insights & Feature Complete is complete and validated.**

V0.9.0 closes the planned V0.x feature roadmap. It adds server-backed release discovery and personal viewing insights while keeping Jellyfin metadata, user data, permissions and playback behavior authoritative.

The completed V0.9.0 scope includes:

- dedicated Release Hub with first-class desktop and mobile navigation
- “Neu diese Woche” surfaces for Series and Anime from real connected-library data
- separate new-episode counts and detected season-premiere presentation
- Series/Anime Release Hub filters
- timezone-stable 28-day episode calendar based on real Jellyfin `PremiereDate` metadata
- paged and bounded Release Hub loading with deduplication and explicit partial/error states
- dedicated personal Insights route with desktop/mobile navigation
- profile-scoped Jellyfin-backed statistics for known plays, rewatches, watched films and episodes
- estimated watch time derived from known runtime × PlayCount rather than presented as an exact event history
- activity from the last 30 days, Top Genres, Top Series and server-backed “Zuletzt gesehen” artwork
- bounded paged Insights loading and deterministic item deduplication
- regression coverage for Release Hub date/paging/load-state logic and Insights aggregation
- final cross-feature consistency and scope audit for the Feature Complete milestone

Release Hub code-complete behavior passed Velaris CI Run #183, Insights passed Run #186, and the integrated V0.9 scope passed the complete pipeline in Run #187. Detailed release notes are available in [`docs/V0.9.0.md`](docs/V0.9.0.md).

**Velaris is now Feature Complete for the planned V0.x roadmap.** V1.0.0 is the next phase and is dedicated to stabilization, compatibility, performance, accessibility and release-blocking defect removal rather than another major feature family.

## Roadmap to V1.0.0

Velaris is being developed through feature phases. **V1.0.0 will be the first officially stable release.** V0.9.0 marks Feature Complete; the remaining work is the dedicated stabilization phase.

The full roadmap lives in [`ROADMAP.md`](ROADMAP.md).

| Version | Phase | Status |
| --- | --- | --- |
| V0.0.1–V0.0.9 | Visual/product foundation | ✅ Complete |
| V0.1.0 | Foundation Hardening | ✅ Complete |
| V0.2.0 | Smart Home & Personalization | ✅ Complete |
| V0.3.0 | Franchise Studio & Watch Orders | ✅ Complete |
| V0.4.0 | Discovery, Watchlists & Smart Lists | ✅ Complete |
| V0.5.0 | Profiles 2.0 | ✅ Complete |
| V0.6.0 | Advanced Player | ✅ Complete |
| V0.7.0 | TV Mode & App Experience | ✅ Complete |
| V0.8.0 | Control Center & Customization | ✅ Complete |
| V0.9.0 | Release Hub, Insights & Feature Complete | ✅ Complete |
| V1.0.0 | First Stable Release | 🎯 Target |

## What is already in Velaris

The completed V0.x product includes native Velaris branding and theme, a dedicated app shell and streaming navigation, Dynamic Franchise Hubs, cinematic Home and Spotlight, cinematic Movie/Series/Anime details, redesigned Libraries/Collections/Search, hardened routing and failure handling, Smart Home personalization, the Franchise Studio with editable universes and Watch Orders, the Discovery Center with Watchlists and Smart Lists, Profiles 2.0 with safer profile switching, the Advanced Player with queue, chapters, rapid stream switching, quality presets and technical playback insight, TV/App Experience with living-room focus behavior and connection recovery, the Control Center with profile-scoped themes/layout controls/enforced feature gates, and V0.9 Release Hub plus personal Insights.

The viewer-facing product treats Movies, Series, Anime, Anime Movies and Collections as first-class destinations when those libraries exist. Franchise, Smart Home, Discovery, Release Hub and Insights surfaces are data-driven and avoid fake promotional media or invented viewing history.

## Product direction

Velaris is designed as a standalone modern streaming experience, not as a visible Jellyfin skin. Jellyfin remains the technical foundation for server APIs, authentication, playback, transcoding and media management, while the normal viewer-facing interface is progressively replaced by Velaris-specific branding, navigation, layouts and interaction patterns.

With V0.9.0 Feature Complete, product scope is intentionally frozen for V1.0 stabilization. Major new feature families should wait until the first stable release is complete.

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
- `V0.9.0` — Feature Complete milestone
- `V1.0.0` — first Stable release after the dedicated final hardening phase

## License and upstream attribution

Velaris Web is derived from Jellyfin Web and remains licensed under the terms of the repository's [GPL-2.0-or-later license](LICENSE). Jellyfin and Jellyfin Web remain the work of the Jellyfin project and its contributors.
