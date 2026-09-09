<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic streaming frontend based on Jellyfin Web.</strong></p>
<p align="center">Current development version: <strong>V0.6.0</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's proven media platform, server APIs, playback stack and compatibility while evolving the viewer experience into a distinct Velaris product with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Current status

**V0.6.0 — Advanced Player is complete and validated.**

V0.6.0 turns the existing cinematic player into a faster Velaris playback control surface while continuing to use Jellyfin's proven playback manager, media streams, queue, chapters, segment data and transcoding controls underneath.

The completed V0.6.0 scope includes:

- dedicated Advanced Player quick panel inside the existing video OSD
- stronger Next Episode action using the real playback queue
- intro/credits/recap/preview transition hints driven by available Jellyfin media-segment data
- chapter navigation using real chapter timestamps
- optional chapter image previews when the server exposes chapter image tags
- one-click audio-track switching from the active media streams
- one-click subtitle switching including an explicit Off state
- profile-scoped quality presets: Automatic, High, Balanced and Data Saver
- quality presets applied through the existing `SetMaxStreamingBitrate` playback command
- episode queue preview showing upcoming playlist entries
- optional technical overlay for Direct Play, Remux or Transcoding plus current stream/container details
- profile-scoped persistence for quality preset, technical overlay and segment-transition preference
- responsive desktop/mobile/TV presentation with keyboard focus and reduced-motion handling
- regression coverage for preference repair, profile scoping, quality mapping, playback-method labels, chapter timestamps and queue windows

The code-complete V0.6.0 implementation passed the full Velaris CI pipeline in Run #125. Detailed release notes are available in [`docs/V0.6.0.md`](docs/V0.6.0.md).

V0.7.0 — TV Mode & App Experience is the next planned feature phase.

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
| V0.5.0 | Profiles 2.0 | ✅ Complete |
| V0.6.0 | Advanced Player | ✅ Complete |
| V0.7.0 | TV Mode & App Experience | ⏳ Planned |
| V0.8.0 | Control Center & Customization | ⏳ Planned |
| V0.9.0 | Release Hub, Insights & Feature Complete | ⏳ Planned |
| V1.0.0 | First Stable Release | 🎯 Target |

## What is already in Velaris

The completed foundation includes native Velaris branding and theme, a dedicated app shell and streaming navigation, Dynamic Franchise Hubs, cinematic Home and Spotlight, cinematic Movie/Series/Anime details, redesigned Libraries/Collections/Search, hardened routing and failure handling, Smart Home personalization, the Franchise Studio with editable universes and Watch Orders, the Discovery Center with Watchlists and Smart Lists, Profiles 2.0 with safer profile switching, and the V0.6 Advanced Player with queue, chapters, rapid stream switching, quality presets and technical playback insight.

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
