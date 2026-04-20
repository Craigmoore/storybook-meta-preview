# Storybook Setup Reference

## Overview

This project uses Storybook as the **manager** (story browser/navigator) only. The actual rendering happens in separate **meta-preview** pages that connect via WebSocket. Storybook's own preview iframe is used only as a secondary render target.

---

## Architecture

```
Storybook manager (port 600X)
  │
  └─ Storybook preview iframe
       │
       └─ storybook-channel decorator (src/storybook-channel.js)
            │  captures rendered story
            │  sends to relay via WebSocket
            ▼
       Relay server (port 333X)  ←  src/relay.js
            │
            └─ broadcasts to all connected meta-preview clients
                 ▼
            meta-preview.html  (public/meta-preview.html)
              renders story in its own domain-specific way
```

---

## Named-Setup Convention

Each experiment is a **named setup**. There is no default setup.

| What | Pattern |
|---|---|
| Storybook config | `.storybook-[name]/` |
| Stories | `src/[name]/atoms/`, `src/[name]/molecules/`, `src/[name]/organisms/` |
| Storybook port | 6006, 6007, 6008 … |
| Relay port | 3333, 3334, 3335 … |
| Scripts | `storybook:[name]`, `relay:[name]`, `dev:[name]` |

All setups registered in `setups.js`.

---

## Adding a New Setup

1. Add entry to `setups.js`:
   ```javascript
   export const setups = {
     html:       { storybookPort: 6006, relayPort: 3333 },
     mysetup:    { storybookPort: 6007, relayPort: 3334 },
   };
   ```

2. Create `.storybook-mysetup/main.js`:
   ```javascript
   const config = {
     stories: ['../src/mysetup/**/*.stories.js'],
     addons: ['@storybook/addon-essentials'],
     framework: { name: '@storybook/html-webpack5', options: {} },
     webpackFinal: async (config) => {
       config.devServer = {
         ...config.devServer,
         client: { ...config.devServer?.client, webSocketURL: 'auto://0.0.0.0:0/ws' },
       };
       return config;
     },
   };
   export default config;
   ```

3. Create `.storybook-mysetup/preview.js`:
   ```javascript
   export { decorators } from '../src/storybook-channel.js';
   ```

4. Create `.storybook-mysetup/preview-head.html` — styles for Storybook's own preview iframe.

5. Add scripts to `package.json`:
   ```json
   "storybook:mysetup": "STORYBOOK_RELAY_PORT=3334 storybook dev -c .storybook-mysetup -p 6007 --host 0.0.0.0",
   "relay:mysetup":     "PORT=3334 node src/relay.js",
   "dev:mysetup":       "concurrently \"yarn relay:mysetup\" \"yarn storybook:mysetup\""
   ```

6. Create story files in `src/mysetup/atoms/` and `src/mysetup/molecules/`.

---

## storybook-channel (src/storybook-channel.js)

Shared decorator included by every setup's `preview.js`. After each story renders, it:

1. Reads `STORYBOOK_RELAY_PORT` (injected at build time via env var)
2. Connects to `ws://[hostname]:[relayPort]`
3. Registers as `storybook-channel` role
4. On each story render, captures `#storybook-root` innerHTML
5. Sends `{ type: 'story-rendered', storyId, name, kind, html }` to relay

For setups where the story content is not HTML (e.g. ThreeJS, BanterVR), the channel is extended or overridden per-setup to capture the relevant data (e.g. `scene.toJSON()`, or the story module path).

---

## Relay Server (src/relay.js)

- Express server + WebSocket server on the same HTTP server
- Serves `public/` as static files (including `meta-preview.html`)
- Two client roles:
  - `storybook-channel` — sends story renders
  - `meta-preview` — receives story renders
- On `story-rendered` from a channel client: broadcasts to all `meta-preview` clients

---

## meta-preview.html (public/meta-preview.html)

Shared base page served by the relay. Each setup may have a variant (e.g. `public/meta-preview-threejs.html`) or customize the shared one.

On load:
1. Connects to `ws://[location.host]`
2. Registers as `meta-preview` role
3. On `story-rendered`: renders the story in a domain-specific way
4. On disconnect: retries every 2 seconds

---

## Story File Format

Stories use `@storybook/html-webpack5` format. The `render` function returns an HTML string (or DOM element for canvas-based setups).

### Atom
```javascript
export default { title: 'SetupName/Atoms/ComponentName' };

export const Default = {
  render: () => `<span class="atom">Hello</span>`,
};
```

### Molecule (with args)
```javascript
export default {
  title: 'SetupName/Molecules/ComponentName',
  args: { name: 'Stranger' },
  argTypes: { name: { control: 'text' } },
};

export const Default = {
  render: ({ name }) => `<p class="molecule">Hello ${name}</p>`,
};
```

### Organism
```javascript
export default { title: 'SetupName/Organisms/ComponentName' };

export const Default = {
  render: () => { /* complex composition */ return html; },
};
```

---

## Running

```bash
yarn dev:html           # starts html setup (Storybook :6006, relay :3333)
yarn dev:threejs-3d     # starts threejs-3d setup (Storybook :6008, relay :3335)
# etc.
```

Open:
- `http://[host]:[storybookPort]` — Storybook manager
- `http://[host]:[relayPort]/meta-preview.html` — Meta Preview

The meta-preview uses `location.hostname` for the WebSocket connection, so it works from any machine on the network.

---

## Current Setups

| Name | Storybook | Relay | Status |
|---|---|---|---|
| html | 6006 | 3333 | ✅ done |
| threejs-2d | 6007 | 3334 | 🔲 planned |
| threejs-3d | 6008 | 3335 | 🔲 planned |
| audio | 6009 | 3336 | 🔲 planned |
| openbrush | 6010 | 3337 | 🔲 planned |
| bantervr-ui | 6011 | 3338 | 🔲 planned |
| bantervr-3d | 6012 | 3339 | 🔲 planned |
| unity-2d | TBD | TBD | ⏳ future |
| unity-3d | TBD | TBD | ⏳ future |
