<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic streaming frontend based on Jellyfin Web.</strong></p>
<p align="center">Current stable release: <strong>V1.0.0</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's proven media platform, server APIs, playback stack and compatibility while evolving the viewer experience into a distinct Velaris product with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Current status

**V1.0.0 — First Stable Release is complete.**

V0.9.0 closed the planned feature roadmap; V1.0.0 completed the dedicated stabilization phase without introducing another major feature family. The stable release focuses on cross-feature reliability, V0.x upgrade compatibility, keyboard/remote/accessibility behavior, connection recovery, browser/WebView compatibility, performance hardening and release validation.

Stable-release hardening includes:

- Discovery, Smart Home and Franchise Studio client state migrated from legacy user-only storage to server+user scoping with backward-compatible V0.x fallbacks
- safe Local Storage / Session Storage access across Velaris preferences and Advanced Player paths
- deterministic mobile drawer open/close behavior and dynamic-route drawer matching
- modal-aware TV focus restoration and hardened TV player focus fallback
- keyboard-accessible profile dialog focus trapping and credential focus behavior
- improved recovery-page control semantics and offline live-region behavior
- `aria-current` state across primary viewer navigation
- Release Hub query parallelization without relaxing paging or server-load bounds
- isolated regression helpers for profile focus, drawer routing and TV player focus
- a production dependency audit gate that blocks Critical findings in shipped non-dev/non-optional dependencies

The final hardening snapshot passed the complete validation matrix in **Velaris CI Run #230** before the release metadata was finalized. The release snapshot re-runs the same stable gates.

Detailed V1 release notes are available in [`docs/V1.0.0.md`](docs/V1.0.0.md).

## Release roadmap

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
| V1.0.0 | First Stable Release | ✅ Complete |

## What is in Velaris V1.0.0

Velaris V1.0.0 includes native Velaris branding and theme, a dedicated app shell and streaming navigation, Dynamic Franchise Hubs, cinematic Home and Spotlight, cinematic Movie/Series/Anime details, redesigned Libraries/Collections/Search, Smart Home personalization, Franchise Studio with editable universes and Watch Orders, Discovery with Watchlists and Smart Lists, Profiles 2.0, the Advanced Player, TV/App Experience, Control Center customization, Release Hub and personal Insights.

Movies, Series, Anime, Anime Movies and Collections are treated as first-class destinations when matching libraries exist. Franchise, Smart Home, Discovery, Release Hub and Insights surfaces are data-driven and avoid fake promotional media or invented viewing history.

## Product direction

Velaris is designed as a standalone modern streaming experience, not as a visible Jellyfin skin. Jellyfin remains the technical foundation for server APIs, authentication, playback, transcoding and media management, while the normal viewer-facing interface is progressively replaced by Velaris-specific branding, navigation, layouts and interaction patterns.

V1.0.0 freezes the first stable product baseline. Future work should prioritize maintenance, upstream compatibility, dependency updates and narrowly scoped improvements before introducing another major feature family.

## Branch strategy

- `master` — kept as close as practical to upstream Jellyfin Web for easier syncing
- `velaris` — active Velaris Web development and release branch

Upstream project: [jellyfin/jellyfin-web](https://github.com/jellyfin/jellyfin-web)

## Build process

### Dependencies

- [Node.js](https://nodejs.org/en/download) 24 or newer
- npm 11 or newer

### Getting started

1. Clone the Velaris branch.

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

## Docker / Container image

Velaris V1.0.0 is distributed through GitHub Container Registry for Docker Desktop, Docker Engine and Compose deployments.

Stable image:

```text
ghcr.io/homiiboy/velaris-web:1.0.0
```

Pull it directly:

```sh
docker pull ghcr.io/homiiboy/velaris-web:1.0.0
```

Run it on host port `8097`:

```sh
docker run -d --name velaris --restart unless-stopped -p 8097:8080 ghcr.io/homiiboy/velaris-web:1.0.0
```

The default `docker-compose.yml` also uses the published GHCR image. A separate `docker-compose.build.yml` is available when a local source build is desired.

Published images target `linux/amd64` and `linux/arm64`. `latest` follows the most recent green `velaris` commit; fixed semantic-version tags are emitted only from explicit Velaris release commits.

Full Docker/Desktop, security-hardening, healthcheck, local-build and GHCR visibility instructions are in [`docs/DOCKER.md`](docs/DOCKER.md).

## Validation

The `velaris` branch includes a dedicated Velaris CI workflow that runs a shipped-production Critical dependency audit, TypeScript, repository ESLint, strict zero-warning lint over Velaris-owned paths, Stylelint, unit tests, the production build, an ES compatibility scan, Docker Compose validation, a Docker image build and a hardened runtime smoke test.

After all validation gates pass on a `velaris` push, CI publishes the container to GHCR. Failed validation never reaches the publishing job.

The V1 hardening snapshot passed all stable application gates in Velaris CI Run #230, and the production Docker deployment passed the extended Docker validation in Run #236.

The general `npm ci` audit still reports upstream/transitive non-Critical findings. Several currently require dependency-range or breaking upgrades (including EPUB/PDF/sanitizer paths), so they are tracked as dependency-maintenance work rather than being force-upgraded inside the V1.0 release commit. The release gate blocks Critical findings in shipped production dependencies and deliberately excludes dev-only and optional-native packages from that shipped-runtime decision.

## Versioning and release policy

Velaris uses its own release line, stored in `VELARIS_VERSION`, while the Jellyfin Web package version can remain aligned with the upstream codebase for easier compatibility tracking.

- `V0.x` — feature development and pre-stable milestones
- `V0.9.0` — Feature Complete milestone
- `V1.0.0` — first Stable release

## License and upstream attribution

Velaris Web is derived from Jellyfin Web and remains licensed under the terms of the repository's [GPL-2.0-or-later license](LICENSE). Jellyfin and Jellyfin Web remain the work of the Jellyfin project and its contributors.
