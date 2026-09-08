# Velaris Web Roadmap

Velaris Web is being developed in feature phases from the current pre-1.0 foundation to the first stable release. The goal is to make Velaris feel like its own streaming product while continuing to use the proven Jellyfin-compatible server, playback and media stack underneath.

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
| V0.3.0 | Franchise Studio & Watch Orders | ⏳ Planned |
| V0.4.0 | Discovery, Watchlists & Smart Lists | ⏳ Planned |
| V0.5.0 | Profiles 2.0 | ⏳ Planned |
| V0.6.0 | Advanced Player | ⏳ Planned |
| V0.7.0 | TV Mode & App Experience | ⏳ Planned |
| V0.8.0 | Control Center & Customization | ⏳ Planned |
| V0.9.0 | Release Hub, Insights & Feature Complete | ⏳ Planned |
| V1.0.0 | First Stable Release | 🎯 Target |

## Completed foundation

### V0.0.1 — Branding Foundation

- Velaris logo and favicon
- PWA/browser branding
- Velaris splash and header identity
- `Velaris Web` client identity
- dedicated `VELARIS_VERSION`

### V0.0.2 — Design System

- native Velaris theme
- centralized design tokens
- near-black cinematic surfaces
- cyan/blue/violet/magenta accent system
- shared buttons, forms, dialogs and surfaces
- focus, reduced-motion and accessibility foundations

### V0.0.3 — Navigation & App Shell

- Velaris desktop navigation
- mobile drawer
- content-first application shell
- first-class Movies, Series, Anime, Anime Movies and Collections ordering
- Velaris brand-first toolbar hierarchy

### V0.0.4 — Dynamic Franchise Hubs

- data-driven franchise detection
- dynamic universe/sub-universe pages
- empty-hub suppression
- curated ordering for supported franchises and timelines
- manual metadata overrides
- Marvel, DC, Star Wars and many additional franchise catalogs
- library-sourced franchise artwork

### V0.0.5 — Home & Discovery

- cinematic rotating Spotlight hero
- dynamic core-library destinations
- redesigned Home rails
- integrated franchise discovery
- responsive desktop/mobile/TV Home presentation

### V0.0.6 — Login, Profiles & Account Experience

- Velaris authentication shell
- profile picker
- manual login, Quick Connect and server screens
- redesigned account menu
- redesigned profile page and avatar controls

### V0.0.7 — Cinematic Details

- cinematic Movie, Series, Anime and Anime Movie details
- full-bleed backdrops and title-logo support
- stronger Play/Resume/Trailer hierarchy
- seasons, episodes, cast, recommendations and media selectors

### V0.0.8 — Libraries, Collections & Search

- Velaris library browsing
- redesigned catalog toolbar
- premium Collections presentation
- dedicated Velaris Search experience
- responsive card/list treatments

### V0.0.9 — Player Experience

- Velaris full-screen player shell
- redesigned timeline and controls
- Up Next and SyncPlay presentation
- desktop/mobile/TV focus behavior
- existing playback, transcoding and media pipeline retained

### V0.1.0 — Foundation Hardening

- Home loading/error/empty-state fixes
- route and tab validation
- franchise matching hardening
- safer login/profile edge cases
- regression tests for navigation and library classification
- strict zero-warning Velaris lint pass
- production bundle ES compatibility validation

### V0.2.0 — Smart Home & Personalization

- profile-scoped Smart Home settings
- configurable Smart Home row order and visibility
- Velaris-native Continue Watching with Resume
- reset/remove progress and mark-as-watched actions
- recent-viewing genre signals
- “Because you watched …” recommendations
- “For tonight” movie suggestions
- “Short & good” short-movie discovery
- unseen-media recommendations
- empty-row suppression
- cross-row recommendation deduplication
- configurable row priority used by the recommendation engine
- tests for preferences, runtime classification, personalization and deduplication

## Planned feature phases

### V0.3.0 — Franchise Studio & Watch Orders

Turn the existing automatic franchise layer into a full Velaris management feature.

Planned scope:

- Franchise Studio management UI
- create custom universes, franchises, eras and sub-groups
- drag-and-drop title assignment and ordering
- edit automatic matches without manually editing metadata tags
- explicit manual include/exclude rules
- release-order views
- chronological-order views
- custom Watch Orders
- reusable Watch Order definitions for MCU, Star Wars, Arrowverse and other curated universes
- validation that only media actually present in the library is shown

### V0.4.0 — Discovery, Watchlists & Smart Lists

Build a dedicated discovery layer beyond normal library browsing.

Planned scope:

- full Discovery Center
- filters for genre, year, runtime, rating and watched/unwatched state
- mixed Movies/Series/Anime discovery
- “Surprise me” discovery action
- personal Watchlist
- custom named lists such as “This Weekend”, “Halloween” or “Family Night”
- automatically maintained Smart Lists
- list sharing/visibility behavior where supported safely by the existing user model
- deeper Continue Watching management where useful

### V0.5.0 — Profiles 2.0

Make profiles a true household streaming feature.

Planned scope:

- dedicated “Who’s watching?” startup flow
- PIN-protected profiles
- Kids Mode
- profile-specific Home configuration
- profile-specific recommendations
- avatar selection
- profile accent colors
- saved language, audio and subtitle preferences
- safer profile switching and session state handling

### V0.6.0 — Advanced Player

Expand the V0.0.9 visual player into a richer playback experience.

Planned scope:

- stronger Next Episode flow
- improved intro/credits transitions using available segment data
- chapter navigation and previews where server metadata supports them
- faster audio/subtitle switching
- persisted profile playback preferences
- quality presets
- episode queue
- optional technical playback overlay
- Direct Play / Remux / Transcoding status
- codec, bitrate, resolution and network information
- clear reason display when transcoding information is available

### V0.7.0 — TV Mode & App Experience

Create dedicated interaction modes for living-room and installed-app use.

Planned scope:

- full 10-foot TV layout
- remote-control-first navigation
- gamepad-friendly focus behavior
- larger TV cards and controls
- TV-optimized player navigation
- improved PWA install experience
- dedicated app startup/splash behavior
- better tablet and mobile layouts
- graceful offline and server-unreachable states
- recovery actions after connection loss

### V0.8.0 — Control Center & Customization

Give Velaris its own settings and personalization layer.

Planned scope:

- Velaris Control Center
- Home layout settings
- Hero behavior and rotation settings
- card size and density controls
- animation controls
- navigation configuration
- franchise detection controls
- player preferences
- feature toggles
- Theme Customizer
- Velaris Default theme
- OLED Black theme
- Midnight theme
- Aurora theme
- custom accent colors

### V0.9.0 — Release Hub, Insights & Feature Complete

Finish the planned feature set and prepare the product for stabilization.

Planned scope:

- “New this week” hub
- new episodes and season premieres
- Series/Anime release hub
- calendar-style views where reliable server metadata exists
- personal Velaris Insights
- watch-time statistics
- most-watched genres
- yearly Movie/Series activity
- episode and completion statistics
- remaining small product features discovered during V0.3–V0.8 development
- final cross-feature consistency pass

**V0.9.0 is the Feature Complete milestone.** No major new feature family should be introduced after this release until V1.0.0 is stable.

## V1.0.0 — First Stable Release

V1.0.0 is reserved for stabilization, not another major feature phase.

Release targets:

- complete regression pass across Login → Profiles → Home → Libraries → Search → Discovery → Franchise Studio → Details → Player → Settings
- desktop, mobile, tablet and TV validation
- keyboard, remote and accessibility validation
- performance profiling and optimization
- error-state and connection-loss testing
- user-permission edge cases
- migration and backward-compatibility checks for existing Velaris preferences
- robust upgrade path from V0.x
- broader automated regression coverage
- production-build and ES compatibility validation
- no known release-blocking defects

Only after these targets are met should Velaris be labeled **V1.0.0 Stable**.

## Principles that apply to every phase

- Viewer-facing UX should feel native to Velaris; Jellyfin remains the technical foundation where appropriate.
- Existing playback, authentication and server behavior should be reused rather than rewritten without a strong reason.
- New features should use actual library/server data and avoid fake or bundled copyrighted media artwork.
- Empty or unavailable features should fail gracefully instead of showing broken surfaces.
- Every feature phase must pass TypeScript, ESLint, Velaris strict lint, Stylelint, unit tests, production build and ES compatibility checks before completion.
- New critical logic should receive regression tests before the milestone is finalized.
- V1.0.0 stability takes priority over adding late feature scope.
