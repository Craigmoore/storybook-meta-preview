# Changelog

## Unreleased

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
