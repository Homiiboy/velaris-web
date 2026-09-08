# Velaris Web Changelog

This changelog tracks Velaris-specific milestones. Detailed implementation notes for recent releases are stored in `docs/` and the long-term feature plan is maintained in [`ROADMAP.md`](ROADMAP.md).

## V0.4.0 — 2026-09-08 — Discovery, Watchlists & Smart Lists

### Added

- dedicated `/discovery` decision-making route with desktop/mobile navigation
- mixed Movie/Series discovery from real connected libraries
- title, original-title and genre search
- filters for Movies, Series, Anime, Anime Movies, genre, watched state, runtime, production year and community rating
- context-aware Anime/Anime Movie classification from library context and actual media type
- “Surprise me” selection from the complete active result set
- Smart Lists for unseen media, short movies, highly rated titles and recently added media
- profile-scoped Watchlist and custom named lists
- direct Watchlist/custom-list membership controls on Discovery cards
- full saved-list browsing in the main Discovery result grid
- custom-list creation and deletion
- versioned defensive browser persistence with same-session and cross-tab synchronization
- paged per-library media loading to remove the original fixed 500-title ceiling
- incremental 60-title result rendering for large libraries
- partial-library/truncation warnings that preserve already loaded media
- regression coverage for persistence repair, filtering, Smart Lists, Anime classification, paging boundaries, ordering, missing metadata and bounded Surprise Me behavior

### Changed

- Discovery now deduplicates media across library queries and sorts the combined candidate set newest-first with deterministic fallbacks
- custom/other user libraries can contribute valid Movie/Series media instead of depending entirely on conventional library names
- malformed list state is bounded and repaired, including list-name length, custom-list count and stored item-ID count
- missing runtime/year/rating/date metadata fails constrained filters safely instead of producing misleading matches
- Watchlist/custom-list previews can now be opened as complete filtered result views

### Scope decisions

- deeper Continue Watching mutation controls remain in V0.2.0 Smart Home to avoid maintaining two competing playback-state management paths
- cross-user list sharing remains deferred because V0.4.0 does not have a safe server-backed ownership/permission model for shared lists

### Fixed during validation

- Smart List toggle comparison flagged by Sonar type analysis
- Discovery stylesheet selector-specificity and indentation conflicts
- operator-linebreak formatting in defensive result-selection logic
- nested Discovery heading-state ternary expressions rejected by repository lint rules

### Validation

- TypeScript ✅
- repository ESLint ✅
- Velaris strict zero-warning lint ✅
- Stylelint ✅
- unit tests ✅
- production build ✅
- generated-bundle ES compatibility check ✅
- code-complete implementation validated by Velaris CI Run #88

### Compatibility

- Discovery continues to use existing Jellyfin-compatible library/user APIs
- Watchlist/custom-list state does not rewrite server metadata or media files
- authentication, playback, transcoding, permissions and media storage remain unchanged

## V0.3.0 — 2026-09-08 — Franchise Studio & Watch Orders

### Added

- dedicated `/franchise-studio` management route
- profile-scoped, versioned Franchise Studio configuration
- manual include/exclude rules layered over automatic franchise detection
- manual title assignment to franchise groups without rewriting server metadata tags
- custom groups for phases, eras, timelines and other structures
- custom universes/franchises built from media already present in the library
- drag-and-drop title assignment between groups
- drag-and-drop title ordering inside groups
- explicit group reordering
- library search and accessible non-drag assignment controls
- custom Watch Orders with add/remove and drag-and-drop ordering
- viewer-facing Watch Order tabs on franchise pages
- generic release-order views from available release metadata
- curated MCU release and chronological definitions
- curated Star Wars release and chronological definitions
- curated Arrowverse series-order definition
- automatic filtering of missing library media from Watch Orders
- automated regression coverage for configuration repair, manual assignment, exclusion, custom hubs and Watch Orders

### Changed

- Dynamic Franchise Hubs can now be corrected and extended per profile through the Franchise Studio while retaining automatic matching as the default
- custom hubs remain hidden from normal viewer surfaces until they contain real media
- profile Studio data is sanitized defensively and stale values are repaired instead of breaking franchise rendering
- drag-and-drop interaction handling was hardened to avoid unintended parent reorder behavior
- Franchise Studio styling was normalized to satisfy repository Stylelint specificity rules

### Fixed during validation

- Watch Order tab handlers violating strict React lint rules
- a Franchise Studio ID-sanitizing regex flagged as potentially inefficient by static analysis
- nested route-state ternaries that violated repository lint rules
- missing source-file end-of-line formatting
- selector-specificity conflicts in the Franchise Studio stylesheet

### Validation

- TypeScript ✅
- repository ESLint ✅
- Velaris strict zero-warning lint ✅
- Stylelint ✅
- unit tests ✅
- production build ✅
- generated-bundle ES compatibility check ✅
- code-complete implementation validated by Velaris CI Run #81

### Compatibility

- automatic franchise detection remains available when no Studio override exists
- existing `velaris:franchise:*` and `velaris:group:*` metadata overrides remain supported
- Franchise Studio preferences do not rewrite Jellyfin metadata or media files
- playback, authentication, permissions, transcoding and media storage remain unchanged

## V0.2.0 — 2026-09-08 — Smart Home & Personalization

### Added

- profile-scoped Smart Home preferences
- configurable Smart Home row visibility and ordering
- Velaris-native Continue Watching with resume playback
- Continue Watching actions to reset/remove progress and mark media watched
- recent-viewing genre signals for profile-aware recommendations
- “Because you watched …” recommendation row
- “For tonight” movie suggestions
- “Short & good” short-movie discovery
- unseen-media discovery row
- automatic suppression of empty recommendation rows
- cross-row recommendation deduplication
- responsive desktop, mobile and TV-focused behavior
- reduced-motion support
- automated Smart Home regression tests
- `ROADMAP.md` covering completed work and planned feature phases through V1.0.0 Stable

### Changed

- Smart Home recommendation priority now follows the configured row order, so higher-positioned rows receive matching media before lower-priority rows during deduplication
- the legacy video Continue Watching row is hidden on Velaris Home while the native Smart Home equivalent is active
- invalid or incomplete stored Smart Home preferences are repaired to the supported row set instead of breaking Home
- README now reflects V0.2.0 as the current completed milestone and links the full product roadmap

### Validation

- TypeScript ✅
- repository ESLint ✅
- Velaris strict zero-warning lint ✅
- Stylelint ✅
- unit tests ✅
- production build ✅
- generated-bundle ES compatibility check ✅
- final implementation validated by Velaris CI Run #69

### Compatibility

- recommendations are derived client-side from media and user data already available through the connected Jellyfin-compatible server
- no separate recommendation database is introduced
- existing playback, authentication, transcoding and media-management behavior remains server-backed

## V0.1.0 — 2026-09-08 — Foundation Hardening

### Added

- defensive Home/Favorites tab parsing
- shared legacy-to-modern route normalization across Velaris navigation surfaces
- franchise pending/error/empty-state separation
- route and library-category regression tests
- strict zero-warning ESLint pass over critical Velaris-owned paths
- generated production-bundle ES compatibility validation

### Fixed

- Home Spotlight could remain on an endless skeleton after settled-empty or failed requests
- malformed Home tab parameters could attempt to load unsupported legacy controllers
- franchise quick navigation could interfere with application routing hashes
- blank franchise matcher values could produce overly broad matches
- login public-profile markup and profile identity escaping edge cases
- profile-image upload/delete flows could leave global loading state active after failures
- transient undefined profile IDs could create invalid profile links

### Validation

V0.1.0 completed the full Velaris validation pipeline and established the hardened baseline for all later feature phases.

## V0.0.9 — 2026-09-08 — Player Experience

### Added

- dedicated full-screen Velaris player shell
- cinematic bottom scrim and translucent control surface
- stronger title and playback-status hierarchy
- cyan-accented timeline
- dominant Play/Pause control
- refined subtitle, audio, volume, settings, AirPlay, PiP and fullscreen presentation
- premium Up Next and SyncPlay surfaces
- responsive desktop, mobile and TV player behavior
- reduced-motion support

### Compatibility

Playback, seeking, chapters, audio/subtitle selection, SyncPlay, transcoding and the underlying media pipeline remain controlled by the existing Jellyfin-compatible playback stack.

## V0.0.8 — 2026-09-08 — Libraries, Collections & Search

### Added

- Velaris library canvas for Movies, Series, Anime, Anime Movies, Collections and custom libraries
- redesigned browse toolbar
- premium grid/list treatments
- distinct Collections/BoxSets presentation
- dedicated Velaris Search landing experience
- redesigned search suggestions and result rows
- responsive desktop, mobile and TV behavior

## V0.0.7 — 2026-09-07 — Cinematic Details

### Added

- cinematic Movie, Series, Anime and Anime Movie detail styling
- full-bleed backdrops and title-logo support
- streaming-style Play, Resume, Restart and Trailer hierarchy
- refined metadata and media selectors
- premium seasons, episodes, Next Up, cast, collections and recommendation rows
- responsive and reduced-motion-aware detail layouts

## V0.0.6 — 2026-09-07 — Login, Profiles & Account Experience

### Added

- dedicated Velaris authentication shell
- streaming-style profile picker
- Velaris manual sign-in, Quick Connect, password recovery and server-selection surfaces
- redesigned account menu
- cinematic profile page and avatar controls
- restored polish and microinteraction modules to the active Velaris style bundle

### Compatibility

Authentication protocols, access tokens, permissions, Quick Connect and server APIs remain unchanged.

## V0.0.5 — 2026-09-07 — Home & Discovery

### Added

- rotating Velaris Spotlight hero using media from the signed-in user's library
- library-backed hero artwork, metadata, genres, tagline and overview
- direct Movie playback and title-detail actions
- reduced-motion-aware hero rotation and manual selectors
- dynamic “Deine Welten” destination rail
- Velaris presentation for Continue Watching, Next Up, Recently Added and other Home sections
- integrated Dynamic Franchise Hub discovery

## V0.0.4 — 2026-09-07 — Dynamic Franchise Hubs

### Added

- data-driven franchise catalog and matching engine
- dynamic hub/sub-group generation from media actually present in the library
- empty hub and group suppression
- matching by visible/original/sort titles, years, studios, tags and provider IDs
- cinematic franchise pages and Home shelf
- curated group ordering and optional manual metadata tags
- catalog coverage for Marvel, DC, Star Wars, Wizarding World, Middle-earth, The Walking Dead, Breaking Bad, Game of Thrones, Star Trek, Alien & Predator, Jurassic, The Matrix, John Wick, Mission: Impossible, Fast & Furious, Dragon Ball, Naruto and One Piece
- automated matching and ordering tests

## V0.0.3 — 2026-09-07 — Navigation & App Shell

### Added

- original Velaris application shell
- immersive translucent top navigation
- brand-first desktop navigation
- redesigned mobile drawer
- first-class ordering for Movies, Series, Anime, Anime Movies and Collections
- shared category ordering across desktop and mobile navigation

## V0.0.2 — 2026-09-07 — Visual Foundation

### Added

- native `velaris` theme
- centralized design tokens
- near-black cinematic surfaces
- cyan → blue → violet → magenta → pink accent system
- shared buttons, forms, dialogs and navigation styling
- reduced-motion and keyboard-focus foundations

## V0.0.1 — 2026-09-07 — Branding Foundation

### Added

- initial Velaris Web identity
- Velaris logo and favicon
- PWA metadata and browser branding
- Velaris splash and header presentation
- `VELARIS_VERSION`
- `Velaris Web` client identity

### Compatibility

Velaris Web remains based on Jellyfin Web. Jellyfin terminology and attribution are retained where they describe the upstream server, SDK, protocol, licensing or original project.
