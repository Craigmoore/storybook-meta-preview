# storybook-meta-preview

## What this project is

An experimental platform for "Storybookification" — extending Storybook beyond UI into a universal composition engine. The concept is documented in `storybookification_summary_v2.md`.

The core idea of this MVP: a standalone HTML page (`meta-preview`) that connects to Storybook via WebSocket and live-renders whatever story is selected in Storybook's manager. This demonstrates the "pluggable renderer" concept at its simplest.

## Architecture

```
Storybook manager (browser)
  → selects story
  → Storybook preview iframe renders it
  → storybook-channel decorator fires (src/storybook-channel.js)
  → sends HTML to relay (src/relay.js) via WebSocket
  → relay broadcasts to all meta-preview clients
  → meta-preview.html updates its DOM
```

Key files:
- `src/storybook-channel.js` — shared Storybook decorator; reads `STORYBOOK_RELAY_PORT` env var
- `src/relay.js` — Express + WebSocket bridge server; serves `public/` and routes story renders
- `public/meta-preview.html` — standalone renderer page; shared across all setups
- `setups.js` — registry of all experimental setups (name → ports)

## Named-setup convention

Everything is organised into named setups. There is no "default" setup.

| Layer | Pattern |
|---|---|
| Storybook config | `.storybook-[name]/` |
| Stories | `src/[name]/atoms/`, `src/[name]/molecules/` |
| Scripts | `storybook:[name]`, `relay:[name]`, `dev:[name]` |
| Storybook port | 6006, 6007, 6008… |
| Relay port | 3333, 3334, 3335… |

Current setups (see `setups.js`):
- `html` — `@storybook/html-webpack5`, port 6006, relay 3333

Each setup's `.storybook-[name]/preview.js` is a one-liner:
```js
export { decorators } from '../src/storybook-channel.js';
```

## Adding a new setup

1. Add entry to `setups.js`
2. Create `.storybook-[name]/main.js` (copy from `.storybook-html/main.js`, update story paths and port)
3. Create `.storybook-[name]/preview.js` (one-liner re-export)
4. Create `.storybook-[name]/preview-head.html` (styles for this setup's preview)
5. Create `src/[name]/atoms/` and `src/[name]/molecules/`
6. Add scripts to `package.json`:
   ```json
   "storybook:[name]": "STORYBOOK_RELAY_PORT=[relayPort] storybook dev -c .storybook-[name] -p [sbPort] --host 0.0.0.0",
   "relay:[name]": "PORT=[relayPort] node src/relay.js",
   "dev:[name]": "concurrently \"yarn relay:[name]\" \"yarn storybook:[name]\""
   ```

## Running

```
yarn dev:html    # starts relay (3333) + Storybook (6006)
```

Open:
- `http://[host]:6006` — Storybook manager
- `http://[host]:3333/meta-preview.html` — Meta Preview

The meta-preview uses `location.hostname` so it works from any machine on the network.

## Story format

Stories use `@storybook/html-webpack5` format — render functions return HTML strings:

```js
export default { title: 'Atoms/Name' };

export const Default = {
  render: () => `<span class="atom">Hello</span>`,
};
```

Molecules with args:
```js
export default { title: 'Molecules/Name', args: { name: 'Stranger' }, argTypes: { name: { control: 'text' } } };

export const Default = {
  render: ({ name }) => `<p class="molecule">...</p>`,
};
```

## Release process

Uses the `release` CLI tool (`~/.local/bin/release`):

```
release --patch   # 0.1.1 → 0.1.2
release --minor   # 0.1.x → 0.2.0
release --major   # 0.x.x → 1.0.0
```

This tool:
1. Requires `## Unreleased` in `CHANGELOG.md` — always keep this heading during development
2. Stamps the version and date
3. Commits `chore: release vX.Y.Z`
4. Tags and pushes

**Never** mention Claude, AI, or Anthropic in commits, changelogs, or any project artefact.

## Repo

- GitHub: `github.com/Craigmoore/storybook-meta-preview` (private)
- Default branch: `v1` (semver branching — new major version = new branch)
- All repos in this org are private
