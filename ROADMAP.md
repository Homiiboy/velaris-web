# Velaris Web Roadmap

Velaris Web is being developed in feature phases toward the first stable release. The viewer-facing product should feel native to Velaris while the proven Jellyfin-compatible server, authentication and playback stack remain underneath.

> **Release policy:** all V0.x releases are development milestones. **V1.0.0 will be the first officially stable Velaris release.**

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
| V0.6.0 | Advanced Player | ⏳ Planned |
| V0.7.0 | TV Mode & App Experience | ⏳ Planned |
| V0.8.0 | Control Center & Customization | ⏳ Planned |
| V0.9.0 | Release Hub, Insights & Feature Complete | ⏳ Planned |
| V1.0.0 | First Stable Release | 🎯 Target |

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
- curated MCU, Star Wars and Arrowverse definitions
- defensive profile-scoped persistence and regression coverage
- completed full validation in Velaris CI Run #81 and final documentation CI Run #82

### V0.4.0 — Discovery, Watchlists & Smart Lists

- dedicated Discovery Center with first-class desktop/mobile navigation
- mixed Movie/Series discovery from real server library data
- free-text title/genre search and filters for type, genre, watched state, runtime, year and rating
- reliable Anime and Anime Movie classification derived from library context and actual media type
- “Surprise me” action based on the complete active result set
- Smart Lists for unseen titles, short movies, highly rated titles and recently added media
- profile-scoped Watchlist and custom named lists
- direct list add/remove controls on media cards
- full Watchlist/custom-list browsing in the Discovery result area
- versioned defensive local persistence and cross-tab synchronization
- paged server loading per library instead of a fixed 500-title ceiling
- deterministic cross-library deduplication and newest-first ordering
- bounded incremental rendering for large result sets
- partial-library failure/truncation warnings while keeping already loaded media usable
- defensive handling for missing runtime/year/rating/date metadata
- expanded regression coverage for Anime classification, paging, metadata edge cases, persistence and bounded Surprise Me behavior
- Continue Watching mutations intentionally remain owned by the V0.2.0 Smart Home flow instead of being duplicated in Discovery
- cross-user list sharing intentionally remains out of scope until it can be mapped to a safe server-backed permission model
- complete implementation validation in Velaris CI Run #88

Detailed release notes: [`docs/V0.4.0.md`](docs/V0.4.0.md).

### V0.5.0 — Profiles 2.0

- global “Who’s watching?” startup flow across the modern Velaris app shell
- PIN/password-protected profile switching through the Jellyfin-compatible authentication stack
- profile accents and Jellyfin-backed avatars in the profile chooser
- profile-scoped Kids Mode UI simplification without weakening server-side media permissions
- profile-scoped Velaris preference persistence by server and user
- server-backed audio-language, subtitle-language and subtitle-mode preferences
- safer profile switching with query/view cache reset and session-scoped profile-choice state
- explicit profile-switch action from the profile settings surface
- cleanup of profile UI state when the active user changes or logs out
- regression coverage for preference repair, profile-picker state and PIN validation
- complete implementation validation in Velaris CI Run #113

Detailed release notes: [`docs/V0.5.0.md`](docs/V0.5.0.md).

## Next planned feature phase

### V0.6.0 — Advanced Player

- stronger Next Episode flow
- intro/credits transitions from available segment data
- chapter navigation/previews where metadata supports them
- faster audio/subtitle switching
- persisted playback preferences and quality presets
- episode queue
- optional Direct Play / Remux / Transcoding technical overlay

## Later planned phases

### V0.7.0 — TV Mode & App Experience

- full 10-foot TV layout
- remote/gamepad-first focus behavior
- TV-optimized player navigation
- improved PWA/app startup experience
- better tablet/mobile layouts
- graceful offline/server-unreachable states and recovery actions

### V0.8.0 — Control Center & Customization

- Velaris Control Center
- Home, Hero, navigation, density and animation controls
- franchise/player feature settings
- feature toggles
- Theme Customizer with Velaris Default, OLED Black, Midnight, Aurora and custom accents

### V0.9.0 — Release Hub, Insights & Feature Complete

- new-this-week and new-episode/season surfaces
- Series/Anime release hub and reliable calendar views
- personal Velaris Insights and watch statistics
- remaining small cross-feature improvements
- final consistency pass

**V0.9.0 is the Feature Complete milestone.** No major new feature family should be introduced after it until V1.0.0 is stable.

## V1.0.0 — First Stable Release

V1.0.0 is reserved for stabilization rather than another feature family:

- complete cross-feature regression pass
- desktop/mobile/tablet/TV validation
- keyboard, remote and accessibility validation
- performance profiling and optimization
- error/connection-loss and permission edge cases
- migration/backward-compatibility checks for Velaris preferences
- robust V0.x upgrade path
- broader automated regression coverage
- production build and ES compatibility validation
- no known release-blocking defects

## Principles for every phase

- Viewer-facing UX should feel native to Velaris; Jellyfin remains the technical foundation where appropriate.
- Reuse existing playback, authentication and server behavior rather than rewriting proven systems without a strong reason.
- Use actual library/server data and avoid fake or bundled copyrighted media artwork.
- Empty/unavailable features must fail gracefully.
- Every phase must pass TypeScript, ESLint, Velaris strict lint, Stylelint, unit tests, production build and ES compatibility checks before completion.
- Critical new logic receives regression tests before a milestone is finalized.
- Roadmap, README, changelog and milestone notes are updated when each feature phase is completed.
- V1.0.0 stability takes priority over late scope additions.
