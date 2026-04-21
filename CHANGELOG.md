# Changelog

## Unreleased

### Added
- `threejs-2d` setup: orthographic Three.js scenes via `@storybook/html-webpack5`
- `src/threejs-2d/scene-canvas.js` — shared helper; builds orthographic scene, exposes it via `window.__metaPreviewScene`, renders to canvas for Storybook's preview
- `src/threejs-2d/atoms/Rectangle.stories.js` — filled and outlined rectangle variants
- `src/threejs-2d/atoms/Circle.stories.js` — filled and ring circle variants
- `src/threejs-2d/molecules/Layout.stories.js` — side-by-side and stacked compositions
- `.storybook-threejs-2d/` config (main.js, preview.js, preview-head.html)
- `public/meta-preview-threejs-2d.html` — standalone meta-preview with own Three.js orthographic renderer; reconstructs scene from `sceneJson` via `ObjectLoader`
- `src/storybook-channel.js` extended: detects `window.__metaPreviewScene` and sends `sceneJson` instead of HTML
- `PLAN.md` — setup roadmap with all planned setups
- Scripts: `storybook:threejs-2d`, `relay:threejs-2d`, `dev:threejs-2d`, `build:threejs-2d`
- `three` added as a dependency

### Fixed
- `EdgesGeometry` does not round-trip through `scene.toJSON()` / `ObjectLoader` — added `edgesGeometry()` helper in `scene-canvas.js` that copies edge buffer data into a plain `BufferGeometry`; updated `Rectangle / Outlined` story to use it
- Added try/catch error logging in `storybook-channel.js` and `meta-preview-threejs-2d.html` for scene serialization/deserialization failures

## [0.2.0] - 2026-04-20

### Added
- `docs/` folder with full reference material for all planned setups and SDKs
- `docs/README.md` — index of all docs
- `docs/storybook-setup.md` — project architecture, named-setup convention, relay, storybook-channel, story format
- `docs/setup-html.md`, `setup-threejs-2d.md`, `setup-threejs-3d.md`, `setup-audio.md`, `setup-openbrush.md`, `setup-bantervr-ui.md`, `setup-bantervr-3d.md` — per-setup reference docs
- `docs/sdk-threejs.md` — Three.js API reference (Scene, Camera, Geometry, Material, Lights, OrbitControls, serialization)
- `docs/sdk-tonejs.md` — Tone.js API reference (Transport, Synth, PolySynth, Sequence, effects, visualiser, note format)
- `docs/sdk-tonaljs.md` — Tonal.js API reference (Note, Chord, Scale, Key, Progression, RomanNumeral)
- `docs/sdk-openbrush.md` — Open Brush HTTP API reference (commands, story format)
- `docs/sdk-banter.md` — BanterVR SDK reference (copied from shoseki-tasks)

## [0.1.3] - 2026-04-20

### Added
- `README.md` — project overview, architecture, per-setup run instructions, and guide for adding new setups

## [0.1.2] - 2026-04-20

### Added
- `CLAUDE.md` — project instructions, architecture overview, named-setup convention, and release process

## [0.1.1] - 2026-04-20

### Changed
- Introduced named-setup convention: `.storybook-[name]/`, `src/[name]/`, and `:[name]` script suffixes
- Renamed `.storybook/` → `.storybook-html/` and `src/components/` → `src/html/`
- Extracted shared `src/storybook-channel.js` — relay port driven by `STORYBOOK_RELAY_PORT` env var so each setup can target its own relay
- Each setup's `preview.js` is now a one-liner re-export from `storybook-channel.js`
- Added `setups.js` — single registry mapping setup name → Storybook port + relay port
- Scripts renamed to `storybook:[name]`, `relay:[name]`, `dev:[name]`

## [0.1.0] - 2026-04-19

### Added
- `@storybook/html-webpack5` as the Storybook framework (manager + standard preview)
- Atom stories: `Hello`, `World`
- Molecule story: `Greeting` — composes Hello + World with a live `name` arg control
- `src/relay.js` — Express + WebSocket relay server (port 3333) that bridges Storybook's preview to external meta-preview clients
- `.storybook/preview.js` (storybook-channel) — decorator that captures rendered story HTML and sends it to the relay after each render
- `public/meta-preview.html` — standalone meta-preview page; connects to relay via WebSocket and re-renders the active story live
- `yarn dev` — runs relay and Storybook concurrently via `concurrently`
- Dynamic hostname resolution in storybook-channel so the relay connection works from any machine on the network
