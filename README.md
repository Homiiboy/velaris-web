<p align="center">
  <img src="src/assets/img/velaris/velaris-logo.svg" alt="Velaris logo" width="240" />
</p>

<h1 align="center">Velaris Web</h1>
<p align="center"><strong>A cinematic Jellyfin Web fork with its own visual identity.</strong></p>
<p align="center">Current Velaris version: <strong>V0.0.7</strong></p>

---

## About Velaris

Velaris Web is a customized frontend based on [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). The goal is to preserve Jellyfin's media platform and compatibility while evolving the web client into a distinct Velaris experience with its own branding, interface and features.

Velaris is an independent fork and is not an official Jellyfin project.

## Product direction

Velaris is designed as a standalone modern streaming experience, not as a visible Jellyfin skin. Jellyfin remains the technical foundation for server APIs, playback and media management, while the normal viewer-facing interface is progressively replaced by Velaris-specific branding, navigation, layouts and interaction patterns.

The design language combines useful ideas found across modern streaming services — content-first navigation, strong cinematic artwork, restrained chrome and responsive horizontal discovery — while keeping the resulting interface original to Velaris.

Velaris treats the core media destinations as first-class streaming categories. The intended primary order is Movies, Series, Anime, Anime Movies and Collections, followed by any additional custom libraries. The interface does not require those exact names to exist, but it recognizes common German and English variants and prioritizes them when present.

## V0.0.7 — Cinematic Details

V0.0.7 transforms the viewer-facing title detail experience for Movies, Series, Anime and Anime Movies into a cinematic Velaris layout while retaining the existing server-backed detail and playback logic underneath.

The milestone includes:

- full-bleed backdrop presentation with layered cinematic scrims and support for title-logo artwork
- a stronger streaming-style title hierarchy with cleaner metadata, genres, tagline and overview presentation
- prominent Play, Resume, Restart and Trailer actions alongside restrained circular utility controls
- refined media-version, video, audio and subtitle selectors in a dedicated glass surface
- premium visual treatment for seasons, episodes, Next Up and other child-media sections
- redesigned Cast & Crew, Collections and More Like This discovery rows
- responsive detail layouts for desktop, mobile and TV with dedicated focus states
- reduced-motion handling for detail-page transitions and microinteractions
- one coherent detail architecture where Anime follows Series behavior and Anime Movies follow Movie behavior without duplicating playback logic

Playback, resume state, trailers, favorites, watched state, downloads, media-source selection, subtitles, episode loading, cast data, collections, recommendations and Jellyfin server APIs remain unchanged. V0.0.7 is deliberately isolated in the Velaris presentation layer so the underlying media behavior stays compatible with upstream.

## Previous milestone — V0.0.6

V0.0.6 replaces the remaining viewer-facing account surfaces with a dedicated Velaris identity so entering, choosing and managing a profile feels like part of the streaming product rather than a server administration flow.

The milestone includes:

- a dedicated near-black Velaris authentication shell with cyan, blue, violet and magenta ambient light instead of the previous splash-screen login presentation
- a streaming-style profile picker using the public user profiles and profile images already provided by the connected server
- circular profile artwork, stronger focus states and responsive profile grids for desktop, mobile and TV
- a glass-style manual sign-in panel that keeps username, password and remember-me behavior intact
- Velaris treatments for Quick Connect, password recovery, server selection and adding a server
- a redesigned account popover with the active profile identity shown before profile, settings, administrative and sign-out actions
- a cinematic user-profile page with a dedicated avatar hero, profile-image controls and a separated security/password surface
- a new reusable `account` style module shared across authentication, profile and account-menu surfaces
- restored V0.0.2 polish and microinteraction modules in the Velaris style bundle so later milestones retain the complete design foundation

Authentication, access tokens, permissions, Quick Connect and server APIs remain unchanged. V0.0.6 is a presentation and account-experience milestone rather than a replacement authentication system.

## V0.0.5 — Home & Discovery

V0.0.5 replaced the visible Jellyfin-style start-page hierarchy with the first full Velaris streaming home experience while keeping the proven server-backed home data underneath.

The milestone includes:

- a large rotating Velaris Spotlight hero driven by Movie and Series media already available to the signed-in user
- library-sourced backdrop artwork, title, metadata, genres, tagline and overview inside the hero
- direct playback for Movie Spotlight items and details navigation for Movie and Series items
- reduced-motion-aware Spotlight rotation with manual selection controls
- a dynamic “Deine Welten” discovery rail that only shows available core destinations such as Movies, Series, Anime, Anime Movies and Collections
- shared category detection between the Home discovery rail and the Velaris application navigation
- cinematic styling for existing Continue Watching, Next Up, Recently Added and library sections instead of exposing the old administrative home-page look
- dynamic franchise discovery retained as a native Home section so universe hubs grow with the library
- the redundant Jellyfin-style Home/Favorites header tabs hidden from the normal Home shell while the top Velaris navigation remains the primary navigation surface
- responsive layouts for desktop, mobile and TV plus reduced-motion support

The legacy Jellyfin home-section engine remains underneath for stable Continue Watching, Next Up, Recently Added and user-configurable sections, but its viewer-facing presentation is now controlled by the Velaris Home layer.

## V0.0.4 — Dynamic Franchise Hubs

V0.0.4 introduced the first Velaris-native universe and franchise layer. Hubs are generated from media that actually exists in the signed-in user's library, so empty franchise pages and empty sub-groups are never advertised in the normal viewer experience.

The milestone includes:

- dynamic franchise discovery from Movies and Series already available to the current user
- matching based on display titles, original titles, sort titles, release years, studios, tags and catalog-defined provider IDs
- automatic suppression of empty hubs and empty sub-groups
- a Home shelf that only appears when at least one franchise is actually available
- dedicated cinematic franchise pages with library-sourced hero artwork, Spotlight actions and quick navigation between available groups
- curated row ordering for structured universes, including MCU phases, the Arrowverse, DCEU, Star Wars and other sequential franchises
- catalog coverage for Marvel, DC, Star Wars, Wizarding World, Middle-earth, The Walking Dead, Breaking Bad, Game of Thrones, Star Trek, Alien & Predator, Jurassic, The Matrix, John Wick, Mission: Impossible, Fast & Furious, Dragon Ball, Naruto and One Piece
- structured sub-groups such as MCU phases, MCU series, DCU, DCEU, Arrowverse, Batman, Elseworlds, Skywalker Saga, Mandalorian Era and similar story worlds
- support for media appearing in multiple useful groups at the same time while remainder rows avoid unnecessary duplicates
- optional manual metadata tags such as `velaris:franchise:dc` or `velaris:group:arrowverse` when automatic matching needs help
- representative hero artwork selected from preferred matching titles already present in the library rather than bundled franchise artwork
- automated tests for empty-hub suppression, localized title matching, curated ordering, manual assignment and duplicate prevention

The franchise catalog is intentionally data-driven and extensible. Additional universes, timelines and aliases can be added without rebuilding the page architecture.

## V0.0.3 — Navigation & App Shell

V0.0.3 introduced the first purpose-built Velaris application shell. The direction combines useful streaming-interface patterns without reproducing any one service: content-first horizontal navigation, strong brand hierarchy, immersive translucent chrome and a compact mobile drawer.

The milestone includes:

- an original translucent Velaris top navigation that visually blends into cinematic content
- Velaris-first product branding without exposing server names or server versions in normal primary navigation
- text-first desktop navigation for Home, Favorites and streaming categories
- priority placement for Movies, Series, Anime, Anime Movies and Collections when those libraries are available
- larger desktop navigation capacity so those core destinations stay visible before falling into overflow
- matching category order between the desktop navigation and mobile drawer
- distinct active-section indicators based on the Velaris cyan-to-magenta gradient
- a redesigned mobile drawer with clearer hierarchy and selected states
- refined toolbar utility controls and responsive spacing
- scoped app-shell classes to keep upstream Jellyfin merge conflicts manageable

## V0.0.2 — Visual Foundation

V0.0.2 introduced the native Velaris design system with centralized tokens, near-black surfaces, the cyan/blue/violet/magenta palette, unified buttons and forms, glass dialogs, polished cards and accessibility-focused motion/focus states.

The original Jellyfin themes remain available, but Velaris is the default appearance of this fork.

## V0.0.1 — Branding Foundation

V0.0.1 established the native Velaris identity with the new logo, favicon, PWA metadata, splash screen, header branding and `Velaris Web` client name.

The visible client identity is Velaris. References to Jellyfin are intentionally retained where they describe the upstream server, API, SDK, protocol, license or original project attribution. This keeps the fork technically honest and easier to synchronize with upstream.

## Branch strategy

- `master` — kept as close as practical to the upstream Jellyfin Web branch for easier syncing
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

4. Create a development build.

   ```sh
   npm run build:development
   ```

5. Create a production build.

   ```sh
   npm run build:production
   ```

## Validation

The `velaris` branch includes a dedicated Velaris CI workflow that runs TypeScript checks, ESLint, Stylelint, unit tests and a production build.

## Versioning

Velaris uses its own version line beginning with `V0.0.1`. The Jellyfin Web package version can remain aligned with the upstream codebase so upstream compatibility remains easier to track. The current Velaris version is stored in `VELARIS_VERSION`.

## License and upstream attribution

Velaris Web is derived from Jellyfin Web and remains licensed under the terms of the repository's [GPL-2.0-or-later license](LICENSE). Jellyfin and Jellyfin Web remain the work of the Jellyfin project and its contributors.

The Velaris-specific branding and modifications are maintained in this fork.
