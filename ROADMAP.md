# Velaris Web Roadmap

Velaris Web was developed in feature phases toward the first stable release. The viewer-facing product is designed to feel native to Velaris while the proven Jellyfin-compatible server, authentication and playback stack remains underneath.

> **Release policy:** V0.x releases are development milestones. **V1.0.0 is the first officially stable Velaris release.**

## Status overview

| Version | Phase | Status |
| --- | --- | --- |
| V0.0.1 | Branding Foundation | ✅ Complete |
| V0.0.2 | Design System | ✅ Complete |
| V0.0.3 | Navigation & App Shell | ✅ Complete |
| V0.0.4 | Dynamic Franchise Hubs | ✅ Complete |
| V0.0.5 | Home & Discovery | ✅ Complete |
| V0.0.6 | Login, Profiles & Account Experience | ✅ Complete |
| V0.0.7 | Cinematic Details | ✅ Complete |
| V0.0.8 | Libraries, Collections & Search | ✅ Complete |
| V0.0.9 | Player Experience | ✅ Complete |
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

## Completed phases

### V0.0.1–V0.0.9 — Product foundation

- Velaris branding, favicon, theme and design system
- dedicated application shell and streaming navigation
- Dynamic Franchise Hubs
- cinematic Home, Spotlight, details and player
- login/profile/account redesign
- Libraries, Collections and Search redesign

### V0.1.0 — Foundation Hardening

- route/tab validation and Home failure handling
- franchise matching hardening
- safer login/profile edge cases
- regression tests for core navigation and classification
- strict zero-warning Velaris lint and generated-bundle ES validation

### V0.2.0 — Smart Home & Personalization

- profile-scoped Smart Home preferences
- native Continue Watching actions
- personalized genre signals and recommendation rows
- configurable row order/visibility and recommendation priority
- empty-row suppression and cross-row deduplication

### V0.3.0 — Franchise Studio & Watch Orders

- editable Franchise Studio route
- manual include/exclude and group assignment
- custom universes, groups, phases and eras
- drag-and-drop ordering
- release, chronological and custom Watch Orders
- defensive profile-scoped persistence and regression coverage

Detailed release notes: [`docs/V0.3.0.md`](docs/V0.3.0.md).

### V0.4.0 — Discovery, Watchlists & Smart Lists

- dedicated Discovery Center with desktop/mobile navigation
- mixed Movie/Series/Anime discovery from real server library data
- filtering, Surprise Me and Smart Lists
- Watchlist and custom named lists
- paged server loading, deduplication and bounded rendering
- partial-library failure/truncation handling
- defensive persistence and regression coverage

Detailed release notes: [`docs/V0.4.0.md`](docs/V0.4.0.md).

### V0.5.0 — Profiles 2.0

- global “Who’s watching?” startup flow
- PIN/password-protected profile switching through Jellyfin authentication
- profile accents and Jellyfin-backed avatars
- profile-scoped Kids Mode and Velaris preferences
- server-backed audio/subtitle preferences
- safer cache/session handling during profile switching

Detailed release notes: [`docs/V0.5.0.md`](docs/V0.5.0.md).

### V0.6.0 — Advanced Player

- Advanced Player quick panel in the existing video OSD
- Next Episode, chapters, queue and stream switching
- segment-driven intro/credits transitions
- profile-scoped quality presets
- Direct Play / Remux / Transcoding technical overlay
- responsive desktop/mobile/TV behavior

Detailed release notes: [`docs/V0.6.0.md`](docs/V0.6.0.md).

### V0.7.0 — TV Mode & App Experience

- 10-foot TV presentation
- remote/gamepad-first focus behavior
- TV-optimized player focus
- responsive app/viewport classification
- startup, offline and server-recovery improvements

Detailed release notes: [`docs/V0.7.0.md`](docs/V0.7.0.md).

### V0.8.0 — Control Center & Customization

- dedicated Control Center
- profile/server-scoped themes and custom accent
- Hero, navigation, density and animation controls
- enforced Smart Home, Discovery, Franchise and Advanced Player feature gates
- cross-tab synchronization and defensive preference repair

Detailed release notes: [`docs/V0.8.0.md`](docs/V0.8.0.md).

### V0.9.0 — Release Hub, Insights & Feature Complete

- Release Hub with “Neu diese Woche”, new episodes and detected season starts
- Series/Anime filtering and timezone-stable 28-day calendar
- personal Insights derived from Jellyfin user data
- known plays/rewatches, completed titles, estimated watch time, Top Genres/Series and recent activity
- bounded paging and explicit partial/error states
- final V0.x scope audit

Detailed release notes: [`docs/V0.9.0.md`](docs/V0.9.0.md).

**V0.9.0 is the Feature Complete milestone.** V1.0.0 deliberately added no new major feature family.

### V1.0.0 — First Stable Release

V1.0.0 completed the dedicated stabilization phase:

- complete cross-feature regression and interaction pass
- V0.x client-state migration audit and backward-compatible upgrade paths
- Discovery, Smart Home and Franchise Studio state migrated to server+user scoping
- safe Local Storage / Session Storage handling across Velaris preferences and Advanced Player paths
- deterministic mobile drawer open/close behavior
- dynamic route matching for drawer availability
- modal-aware TV focus restoration
- TV player focus fallback to the first actually focusable OSD control
- keyboard-accessible profile-dialog focus trapping and credential focus behavior
- recovery-page semantic controls and offline live-region behavior
- semantic `aria-current` navigation state
- Release Hub query parallelization while preserving bounded paging/load behavior
- regression tests isolated from full Jellyfin app bootstrap where possible
- production dependency gate for Critical findings in shipped non-dev/non-optional dependencies
- TypeScript, repository ESLint, Velaris strict lint, Stylelint, unit tests, production build and generated-bundle ES compatibility validation
- no known release-blocking Velaris defect at finalization

The final hardening snapshot was completely green in **Velaris CI Run #230**. The release metadata snapshot re-runs the same stable validation matrix.

Detailed release notes: [`docs/V1.0.0.md`](docs/V1.0.0.md).

## Stable maintenance direction

V1.0.0 establishes the first stable baseline. Future work should prioritize:

- upstream Jellyfin Web compatibility and controlled merges
- dependency/security maintenance, especially upgrades that currently require range or breaking changes
- bug fixes and regression coverage
- performance and device compatibility improvements
- narrowly scoped UX improvements that do not destabilize the stable baseline

No V1.1 feature scope is committed by this roadmap yet.

## Principles for stable maintenance

- Viewer-facing UX should feel native to Velaris; Jellyfin remains the technical foundation where appropriate.
- Reuse existing playback, authentication and server behavior rather than rewriting proven systems without a strong reason.
- Use actual library/server data and avoid fake or bundled copyrighted media artwork.
- Empty/unavailable features must fail gracefully.
- Release candidates must pass the production dependency Critical gate, TypeScript, repository ESLint, Velaris strict lint, Stylelint, unit tests, production build and ES compatibility checks.
- Critical new logic receives regression tests.
- README, changelog, roadmap and release notes stay synchronized with stable releases.
- Stability takes priority over late scope additions.
