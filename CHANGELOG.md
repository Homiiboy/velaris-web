# Velaris Web Changelog

## V0.0.9 — 2026-09-08 — Player Experience

### Added

- dedicated full-screen Velaris player shell for the existing video OSD
- subtle Velaris brand treatment while player controls are visible
- cinematic bottom scrim and centered translucent control surface
- stronger title, secondary media information and playback-status hierarchy
- cyan-accented playback timeline with compact elapsed/duration labels
- visually dominant Play/Pause action separated from rewind, fast-forward and secondary controls
- refined visual treatment for subtitles, audio, volume, settings, AirPlay, picture-in-picture and fullscreen controls
- premium Up Next and SyncPlay surfaces
- responsive desktop, mobile and TV player layouts with keyboard/remote focus states
- reduced-motion support for player interaction transitions
- `player` module added to the Velaris style bundle
- V0.0.9 implementation notes in `docs/V0.0.9.md`

### Changed

- full-screen playback now follows the same near-black, restrained-glass and cyan/violet visual language as Home, details, libraries and search
- playback controls are grouped around a clearer content-first hierarchy instead of the generic media-server OSD presentation
- the central Play/Pause control receives the strongest visual emphasis while technical utilities remain available but secondary
- Up Next and SyncPlay feedback now share the same premium surface language as the rest of Velaris
- V0.0.9 becomes the current completed Velaris milestone

### Design direction

- the video remains visually dominant and the control chrome should disappear into the content when not needed
- controls should feel familiar and low-friction without reproducing any single commercial streaming-service player
- viewer-facing playback should feel native to Velaris while preserving stable backend behavior

### Validation

- TypeScript, ESLint, Stylelint, unit tests and the production build are required by Velaris CI for the completed V0.0.9 state

### Compatibility

- play/pause, seeking, chapters, next/previous media, subtitles, audio tracks, volume, settings, AirPlay, picture-in-picture, fullscreen, SyncPlay and Up Next remain controlled by the existing playback controller
- media decoding, transcoding, streaming protocols and Jellyfin-compatible playback APIs are unchanged
- V0.0.9 is a presentation-layer milestone and introduces no replacement playback backend

## V0.0.8 — 2026-09-08 — Libraries, Collections & Search

### Added

- dedicated Velaris styling for modern library pages across Movies, Series, Anime, Anime Movies, Collections and additional server libraries
- redesigned library toolbar with explicit Velaris classes for view selection, item counts, playback actions, filters, sorting and layout controls
- premium grid and list surfaces with unified card depth, typography, spacing and focus behavior
- dedicated Collections/BoxSets visual treatment that coexists with dynamic Velaris Franchise Hubs
- refined genre, alphabet-picker, pagination and empty-state presentation
- dedicated Velaris Search landing composition with branded hero and large glass search field
- streaming-style search suggestions and horizontal result rows
- responsive desktop, mobile and TV library/search behavior plus reduced-motion support
- reusable `libraries` and `search` style modules added to the Velaris theme bundle
- implementation notes in `docs/V0.0.8.md`

### Changed

- library browsing now uses the same near-black cinematic canvas and cyan/violet ambient light language as Home and title details
- the library toolbar is visually grouped by content-view identity, item count, playback actions and browse controls instead of appearing as a generic utility row
- ordinary server Collections are presented as premium content destinations while remaining distinct from the data-driven Franchise Hub layer
- search now opens as a dedicated Velaris discovery surface rather than an unbranded input at the top of a generic library page
- search results retain the established server query logic but receive Velaris-native spacing, card treatment and interaction states
- V0.0.8 becomes the current completed Velaris milestone

### Design direction

- browsing should feel like moving through a streaming catalog rather than administering a media library
- toolbar controls stay available without visually overpowering the artwork
- Collections should look valuable enough to function as franchise/universe entry points even when they are ordinary Jellyfin BoxSets
- search should feel fast, focused and content-first while preserving the existing reliable search backend

### Validation

- TypeScript, ESLint, Stylelint, unit tests and the production build are required by Velaris CI for the completed V0.0.8 state

### Compatibility

- library queries, permissions, pagination, filters, sorting, view settings, collection management, search endpoints and playback actions remain server-backed
- no separate media index, collection database or search backend is introduced
- existing routes and Jellyfin-compatible APIs remain responsible for data and behavior while Velaris controls presentation

## V0.0.7 — 2026-09-07 — Cinematic Details

### Added

- dedicated Velaris cinematic detail styling for Movies, Series, Anime and Anime Movies
- full-bleed title backdrops with layered cinematic scrims and title-logo artwork support
- streaming-style Play, Resume, Restart and Trailer actions with restrained glass utility controls
- refined metadata, genre, tagline and overview hierarchy
- dedicated glass surface for media-version, video, audio and subtitle selectors
- premium styling for seasons, episodes, Next Up and child-media sections
- redesigned Cast & Crew, Collections and More Like This discovery rows
- responsive desktop, mobile and TV layouts with dedicated focus treatment
- reduced-motion handling for detail-page transitions and microinteractions
- `details` module added to the Velaris style bundle
- V0.0.7 implementation notes in `docs/V0.0.7.md`

### Changed

- title pages now prioritize cinematic artwork, playback and story information ahead of technical metadata
- desktop poster artwork is visually deemphasized in favor of the backdrop, optional title logo and stronger title hierarchy
- primary playback controls use a streaming-oriented visual hierarchy while existing action behavior remains intact
- technical media selectors and detailed metadata remain available but are visually secondary to the viewer experience
- episode, season and recommendation content now follows the same card/surface language as the Velaris Home experience
- Anime reuses the Series detail architecture and Anime Movies reuse the Movie detail architecture so their library identity remains first-class without duplicating playback logic
- V0.0.7 becomes the current completed Velaris milestone

### Design direction

- detail pages should feel like a title landing page from a modern streaming service rather than a media-server metadata screen
- the backdrop and title information form one cinematic hero composition that fades naturally into episodes, cast and recommendations
- controls remain restrained so the artwork and content hierarchy stay dominant
- the layout is original to Velaris and combines cinematic backdrop emphasis with the existing reliable Jellyfin media behavior underneath

### Validation

- TypeScript, ESLint, Stylelint, unit tests and the production build are required by Velaris CI for the completed V0.0.7 state

### Compatibility

- playback, resume state, trailers, favorites, watched state, downloads, media-source selection, subtitles, episode loading, cast data, collections, recommendations and Jellyfin server APIs remain unchanged
- V0.0.7 intentionally leaves the established detail controller responsible for data and behavior while Velaris controls the viewer-facing presentation
- no new media metadata requirements are introduced; existing library artwork and title-logo images are used when available

## V0.0.6 — 2026-09-07 — Login, Profiles & Account Experience

### Added

- dedicated Velaris account styling shared by authentication, profile selection, account menus and profile management
- branded authentication shell with Velaris logo treatment and ambient cyan/violet lighting
- streaming-style public-user profile picker with circular profile artwork and responsive desktop, mobile and TV layouts
- Velaris manual sign-in panel while retaining the established username, password and remember-me controls
- matching visual treatments for Quick Connect, password recovery, server selection and adding a server
- active-profile identity header inside the application user menu
- redesigned user-profile page with a cinematic avatar hero, image controls and dedicated security surface

### Changed

- the login route no longer relies on the previous splash-screen backdrop presentation
- viewer-facing session pages now use the same Velaris visual language as Home, navigation and franchise hubs
- profile cards receive dedicated focus, hover and reduced-motion-aware states instead of generic square library-card presentation
- account-menu actions now sit beneath a clear current-profile identity instead of opening as an unbranded utility list
- user-profile image and password management are visually grouped without changing their existing server behavior
- the `polish` and `microinteractions` V0.0.2 modules are restored to the active Velaris style bundle
- V0.0.6 becomes the current completed Velaris milestone

### Design direction

- entering Velaris should feel like entering a streaming service rather than administering a media server
- profile selection is treated as a first-class viewer experience, especially for shared household use
- technical server controls remain available when needed but are visually secondary to the profile and content experience
- authentication screens use an original Velaris composition rather than reproducing a commercial streaming-service login layout

### Validation

- TypeScript, ESLint, Stylelint, unit tests and the production build are required by Velaris CI for the completed V0.0.6 state

### Compatibility

- username/password authentication, access tokens, Quick Connect, auto-login preferences, permissions and server APIs remain unchanged
- public-user discovery continues to come from the connected server
- profile-image upload/delete and password-management behavior continue to use the existing server-backed flows
- no new authentication protocol or credential storage is introduced by V0.0.6

## V0.0.5 — 2026-09-07 — Home & Discovery

### Added

- rotating Velaris Spotlight hero sourced from Movie and Series media available to the signed-in user
- library-backed Spotlight artwork, metadata, genres, tagline and overview
- direct Movie playback and item-detail actions from the Home hero
- manual Spotlight selectors plus automatic rotation that respects reduced-motion preferences
- dynamic “Deine Welten” discovery rail for available Movies, Series, Anime, Anime Movies and Collections libraries
- shared Velaris library-category detection so Home and primary navigation use the same destination logic
- dedicated Velaris Home styling module for hero, discovery destinations, legacy home rails, mobile layouts and TV layouts

### Changed

- the normal Home experience now starts with cinematic content instead of a Jellyfin-style section list
- existing Continue Watching, Next Up, Recently Added and user-configurable home sections remain server-backed but receive Velaris-native spacing, typography, surfaces and interactions
- redundant Home/Favorites header tabs are visually removed from the active Home shell because the Velaris top navigation already exposes those destinations
- franchise discovery remains part of Home and visually follows the new streaming hierarchy
- the Home route now owns a Velaris-specific shell class so visual changes stay isolated from unrelated Jellyfin pages
- V0.0.5 becomes the current completed Velaris milestone

### Design direction

- Home is content-first: hero first, core destinations second, personalized rails after that
- the new hero combines large cinematic artwork with restrained controls rather than reproducing any one commercial streaming-service layout
- Movies, Series, Anime, Anime Movies and Collections appear only when corresponding libraries actually exist
- Jellyfin continues to provide playback, resume state and home-section data while the viewer-facing hierarchy is progressively replaced by Velaris

### Validation

- TypeScript, ESLint, Stylelint, unit tests and the production build are required by Velaris CI for the completed V0.0.5 state

### Compatibility

- playback, authentication, user permissions and Jellyfin server APIs remain unchanged
- the existing home-section engine is retained underneath the new presentation so Continue Watching, Next Up and Recently Added keep their established server behavior
- no bundled third-party franchise or promotional artwork is required; Home artwork is sourced from the user's own available media

## V0.0.4 — 2026-09-07 — Dynamic Franchise Hubs

### Added

- data-driven Velaris franchise catalog with nested universe and sub-group definitions
- dynamic matching engine for Movie and Series items already available to the current user
- matching support for display titles, original titles, sort titles, release years, studios, tags and catalog-defined provider IDs
- automatic suppression of empty franchise hubs and empty sub-groups
- Home discovery shelf for available universes and franchises
- dedicated cinematic franchise route at `franchise/:hubId`
- grouped horizontal media rows inside each franchise page
- preferred hero-title selection so franchise artwork comes from strong matching media already present in the library
- Spotlight and group-navigation actions inside franchise heroes
- curated ordering for sequential franchise rows such as MCU phases, DCEU, Arrowverse and the Skywalker Saga
- catalog coverage for Marvel, DC, Star Wars, Wizarding World, Middle-earth, The Walking Dead, Breaking Bad, Game of Thrones, Star Trek, Alien & Predator, Jurassic, The Matrix, John Wick, Mission: Impossible, Fast & Furious, Dragon Ball, Naruto and One Piece
- DC sub-groups for DCU, DCEU, Arrowverse, Batman, Superman and Elseworlds
- Marvel sub-groups for MCU phases, MCU series, Spider-Man, X-Men and the Defenders Saga
- optional manual assignment tags using `velaris:franchise:<id>`, `velaris:hub:<id>` and `velaris:group:<id>`
- automated franchise-engine tests for empty-hub suppression, localized-title matching, curated ordering, manual assignment and duplicate prevention

### Changed

- franchise and universe navigation is content-driven instead of relying on pre-created empty pages
- matching now uses original-title metadata in addition to the visible localized title, improving recognition across library languages
- franchise metadata requests explicitly include OriginalTitle, ProviderIds, SortName, Studios and Tags
- remainder groups can exclude media that already appeared in curated groups while intentional cross-group appearances remain supported
- hub pages now expose quick navigation only for groups that actually exist in the current library
- V0.0.4 is finalized as the current Velaris milestone

### Design direction

- franchise hubs behave like mini streaming worlds rather than folder listings
- collections can combine movies and series inside the same branded universe
- hubs grow automatically as new matching media enters the library
- curated timelines and eras remain data-driven so future universes can reuse the same page architecture

### Validation

- TypeScript, ESLint, Stylelint, unit tests and the production build are required by Velaris CI for the completed V0.0.4 state

### Compatibility

- playback, authentication and Jellyfin server APIs remain unchanged
- franchise detection is implemented in the Velaris presentation layer
- empty hubs are never shown to the normal viewer
- manual tags are optional and only needed when library metadata does not provide a reliable automatic match

## V0.0.3 — 2026-09-07 — Navigation & App Shell

### Added

- original Velaris app shell inspired by the strongest navigation patterns from major streaming services without copying a single service layout
- immersive translucent top navigation with a cinematic edge fade into page content
- dedicated desktop navigation treatment for Velaris branding, Home, Favorites, libraries and active sections
- dedicated mobile drawer treatment with stronger hierarchy and selected-state markers
- app-shell classes that keep the new layout scoped to Velaris-specific styling
- explicit Home destination in the desktop streaming navigation
- Velaris-specific library ordering for Movies, Series, Anime, Anime Movies and Collections
- shared library ordering between desktop navigation and the mobile drawer

### Changed

- normal navigation now presents the product as Velaris instead of exposing the Jellyfin server name or server version in primary chrome
- desktop navigation is now text-first with a restrained gradient active indicator instead of admin-style rounded controls
- the Velaris brand mark now links directly to Home and receives a stronger streaming-service wordmark treatment
- toolbar utility actions use lighter visual weight while the user avatar gets a subtle premium ring treatment
- core media libraries are prioritized ahead of custom links so the main streaming destinations remain easy to reach
- desktop navigation capacity was increased so Movies, Series, Anime, Anime Movies and Collections can remain visible on common desktop widths
- mobile drawer sections use clearer spacing, stronger selected states and a cinematic black surface
- the main application canvas now carries subtle cyan and violet ambient light from the Velaris palette

### Design direction

- Netflix contributes the content-first horizontal navigation idea
- Disney+ contributes clear brand-first hierarchy and restrained navigation density
- Paramount+ contributes the immersive relationship between navigation and cinematic content
- Velaris combines those ideas into an original cyan/violet visual system rather than reproducing any service one-to-one
- the normal viewer experience should feel like a standalone streaming service; Jellyfin terminology remains only where technically or legally appropriate
- Movies, Series, Anime, Anime Movies and Collections are treated as first-class destinations in future home, discovery and detail layouts

### Compatibility

- playback, authentication, Jellyfin server APIs and media handling remain unchanged
- navigation behavior and route structure are preserved while the presentation layer is redesigned
- library ordering recognizes common German and English names while preserving server order for unrelated custom libraries

## V0.0.2 — 2026-09-07 — Visual Foundation

### Added

- native `velaris` theme as the default Velaris Web appearance
- centralized Velaris design tokens derived from the logo palette
- modular styling foundation for surfaces, buttons, forms, navigation, dialogs and accessibility
- cyan → blue → violet → magenta → pink accent gradient system
- dedicated MUI color scheme matching the legacy Jellyfin component palette
- reduced-motion support and consistent keyboard focus treatment

### Changed

- Velaris now defaults to its own theme while keeping upstream themes selectable
- dark surfaces use a near-black cinematic palette with subtle cyan and violet ambient lighting
- cards, lists, dialogs and drawers use a consistent radius, border, shadow and glass treatment
- form controls, interactive states and progress indicators now share the Velaris accent language

### Validation

- V0.0.2 development commits are validated by Velaris CI with TypeScript, ESLint, Stylelint, unit tests and a production build

### Compatibility

- playback, authentication, server APIs and media handling remain intentionally unchanged
- the design system is isolated in Velaris-specific theme/style files to reduce upstream merge conflicts

## V0.0.1 — 2026-09-07

### Added

- initial Velaris Web branding foundation
- official scalable Velaris logo asset
- dedicated scalable browser favicon and PWA icon
- Velaris splash-screen and default header logo treatment
- dedicated `VELARIS_VERSION` marker

### Changed

- initial browser title and application metadata from Jellyfin to Velaris
- web manifest name, short name, description, colors and icon references
- startup splash branding now uses the Velaris emblem on desktop, mobile and TV layouts
- default header branding now stays on Velaris even when Jellyfin theme styles are active
- modern toolbar and dashboard drawer fallbacks now use the Velaris emblem and Velaris name
- logo screensaver now renders the Velaris emblem on a black background
- README rewritten for the Velaris Web fork and upstream workflow

### Compatibility

- based on the current `jellyfin-web` fork state
- Jellyfin server/API terminology is intentionally retained where it describes the upstream backend or protocol
- no playback, authentication or server API behavior intentionally changed in V0.0.1
