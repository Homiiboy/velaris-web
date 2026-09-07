# Velaris Web Changelog

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
