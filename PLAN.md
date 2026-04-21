# Storybook Meta Preview — Setup Roadmap

## Pattern

All multi-domain setups follow the split convention: `[domain]-2d` and `[domain]-3d` (or equivalent) as separate named setups where applicable. This pattern is established with ThreeJS and carried through to Unity, BanterVR, etc.

Each setup has its own `.storybook-[name]/`, `src/[name]/`, and `:[name]` scripts. See `CLAUDE.md` for how to add a new setup.

---

## Setups

### ✅ html
- Framework: `@storybook/html-webpack5`
- Stories: atoms (Hello, World), molecule (Greeting with name arg)
- Meta-preview: receives HTML string via relay, injects into DOM
- Ports: Storybook 6006, relay 3333

---

### 🔲 threejs-2d
- Framework: `@storybook/html-webpack5` with Three.js orthographic camera
- Stories: simple MVP Hello World 2D layout examples (flat geometry, text)
- Meta-preview: own Three.js orthographic renderer; scene cleared on every update
- Protocol: story exposes scene via `window.__metaPreviewScene`; channel serializes with `scene.toJSON()`; meta-preview reconstructs with `THREE.ObjectLoader`
- Purpose: reference example for the "ThreeJS 2D layout approach" for future projects
- Ports: Storybook 6007, relay 3334

### 🔲 threejs-3d
- Framework: `@storybook/html-webpack5` with Three.js perspective camera
- Stories: simple MVP 3D component examples (box etc.)
- Meta-preview: own Three.js perspective renderer with OrbitControls; scene cleared on every update
- Protocol: same as threejs-2d (`scene.toJSON` / `ObjectLoader`)
- Purpose: reference example for the "ThreeJS 3D component approach" for future projects
- Ports: Storybook 6008, relay 3335

---

### 🔲 audio
- Framework: `@storybook/html-webpack5`
- Libraries: Tone.js (playback engine) + Tonal.js (music theory)
- Story hierarchy:
  - Atom: a single note (name, duration, octave etc.)
  - Molecule: a chord (set of notes)
  - Organism: a progression (set of chords / sequence)
- Story data format: structured music data (note names, durations, BPM) — meta-preview owns the Tone.js engine entirely; stories do NOT instantiate Tone.js themselves
- Meta-preview:
  - Stops current playback on every story update
  - Shows a Play button (required for browser audio context gesture)
  - Visualiser: waveform + notes-lighting-up view
- Ports: Storybook 6009, relay 3336

---

### 🔲 openbrush
- Framework: `@storybook/html-webpack5`
- Open Brush runs locally in 2D mode with HTTP API on port 40074
- Story hierarchy:
  - Atom: single brush stroke or shape (sequence of API commands)
  - Molecule: composition of strokes
  - Organism: full scene
- Story data format: array of API command strings/objects sent to `http://[host]:40074/api/v1`
- Meta-preview:
  - Input for Open Brush host address (default: localhost)
  - Send to Open Brush button
  - Clears canvas on every update before sending new commands
- API docs:
  - https://docs.openbrush.app/user-guide/open-brush-api
  - https://docs.openbrush.app/user-guide/open-brush-api/api-commands
- Ports: Storybook 6010, relay 3337

---

### ⏳ unity-2d *(future)*
- Approach: UI Toolkit / UXML component library
- Communication mechanism TBD — deferred until Unity expertise available
- Ports: TBD

### ⏳ unity-3d *(future)*
- Approach: 3D scene components
- Communication mechanism TBD — deferred until Unity expertise available
- Ports: TBD

---

### 🔲 bantervr-ui
- Framework: `@storybook/html-webpack5`
- Stories: BanterVR UI system components (BanterUIPanel, UIButton, UILabel, UISlider etc.)
- Story format: each story exports a render function `(scene, BS) => { ... }` that creates BS objects
- Meta-preview:
  - JS embedded directly in the Banter scene's `index.html` (NOT a BanterBrowser object)
  - Parameters injected at embed time: position, rotation, scale of UI panels in the scene
  - Connects to relay via WebSocket
  - On story update: destroys all previously created BS objects, runs new story render function
  - Reference: shoseki-tasks Banter example (3D objects) — abstract slightly for relay integration
- Protocol: relay serves story files as static assets; meta-preview dynamically imports and runs the story module
- Ports: Storybook 6011, relay 3338

### 🔲 bantervr-3d
- Framework: `@storybook/html-webpack5`
- Stories: BanterVR 3D scene components (GameObjects with geometry, materials, physics)
- Story format: same as bantervr-ui — render function `(scene, BS) => { ... }`
- Meta-preview: same embed approach as bantervr-ui; clears scene on every update
- Reference: shoseki-tasks Banter 3D objects example
- Ports: Storybook 6012, relay 3339
