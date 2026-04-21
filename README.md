# Storybook Meta Preview

An experimental platform for exploring "Storybookification" — extending Storybook beyond UI components into a universal composition engine with pluggable preview renderers.

The core concept: a standalone HTML page (the **meta-preview**) that connects to Storybook via WebSocket and live-renders whatever story is selected in Storybook's manager. Selecting a story in Storybook updates the meta-preview in real time, on any device on the same network.

See `storybookification_summary_v2.md` for the full concept.

---

## How it works

```
Storybook manager → story selected → preview iframe renders it
→ storybook-channel decorator captures HTML
→ sends to relay server via WebSocket
→ relay broadcasts to all connected meta-preview clients
→ meta-preview.html updates its DOM
```

---

## Setups

Each setup is an independent experiment with its own Storybook config, story files, and ports. Multiple setups can run simultaneously.

### html

The baseline setup. Uses `@storybook/html-webpack5` — stories render plain HTML strings.

| | |
|---|---|
| Storybook | `http://[host]:6006` |
| Meta Preview | `http://[host]:3333/meta-preview.html` |

**Run:**
```bash
yarn dev:html
```

**Stories:**
- `Atoms / Hello` — renders `<span class="atom">Hello</span>`
- `Atoms / World` — renders `<span class="atom">World</span>`
- `Molecules / Greeting` — composes Hello + World with a live `name` arg control

### threejs-2d

Orthographic Three.js scenes. Reference example for the "ThreeJS 2D layout approach". Stories build flat geometry scenes using `PlaneGeometry`, `CircleGeometry` etc. with `MeshBasicMaterial` (no lighting needed). The meta-preview owns a Three.js renderer and rebuilds the scene via `ObjectLoader` on every story change.

| | |
|---|---|
| Storybook | `http://[host]:6007` |
| Meta Preview | `http://[host]:3334/meta-preview-threejs-2d.html` |

**Run:**
```bash
yarn dev:threejs-2d
```

**Stories:**
- `ThreeJS-2D / Atoms / Rectangle` — filled and outlined variants
- `ThreeJS-2D / Atoms / Circle` — filled and ring variants
- `ThreeJS-2D / Molecules / Layout` — side-by-side and stacked compositions

### threejs-3d

Perspective Three.js scenes. Reference example for the "ThreeJS 3D component approach". Stories build 3D geometry scenes using `BoxGeometry`, `SphereGeometry` etc. with `MeshStandardMaterial` and default lighting. The meta-preview owns a Three.js perspective renderer with `OrbitControls` and rebuilds the scene via `ObjectLoader` on every story change.

| | |
|---|---|
| Storybook | `http://[host]:6008` |
| Meta Preview | `http://[host]:3335/meta-preview-threejs-3d.html` |

**Run:**
```bash
yarn dev:threejs-3d
```

**Stories:**
- `ThreeJS-3D / Atoms / Box` — solid and wireframe variants
- `ThreeJS-3D / Atoms / Sphere` — default and shiny (metalness/roughness) variants
- `ThreeJS-3D / Molecules / Composition` — box + sphere side-by-side, and a stacked tower

### audio

Structured music data stories. Stories return plain data objects (notes, chords, progressions) — the meta-preview owns the Tone.js engine entirely. Selecting a story updates the meta-preview display; press Play to hear it.

| | |
|---|---|
| Storybook | `http://[host]:6009` |
| Meta Preview | `http://[host]:3336/meta-preview-audio.html` |

**Run:**
```bash
yarn dev:audio
```

**Stories:**
- `Audio / Atoms / Note` — 7 single notes from sub-bass (A1) to stratosphere (C8)
- `Audio / Molecules / Chord` — 14 chords: triads, sevenths, extended, quartal, cluster, power chord
- `Audio / Organisms / Progression` — 9 progressions: Pop Loop, Jazz ii–V–I, Andalusian, Pachelbel, 12-bar Blues, Circle of Fifths, Chromatic Rise, Celtic Melody, Dorian Vamp

### openbrush

Open Brush API command stories. Stories generate sequences of brush commands; the Storybook preview renders a 2D canvas preview with oblique projection so 3D strokes have visible depth. The meta-preview auto-sends commands to a running Open Brush instance via its HTTP API whenever a story is selected.

Three.js is used as a pure geometry calculator — `EdgesGeometry` extracts wireframe edges from any `BufferGeometry`, which are then converted to `draw.path` commands. No Three.js renderer is used.

Requires Open Brush running with `--EnableApiRemoteCalls --EnableApiCorsHeaders`.

| | |
|---|---|
| Storybook | `http://[host]:6010` |
| Meta Preview | `http://[host]:3337/meta-preview-openbrush.html` |

**Run:**
```bash
yarn dev:openbrush
```

**Meta-preview controls:**
- **send to open brush** — re-sends the current story manually
- **save** — saves the current sketch to a new slot (`save.new`)
- **export** — exports the sketch to Open Brush's Exports folder (`export.current`)
- **show exports** — opens the Exports folder on the desktop (`showfolder.exports`)

**Stories:**
- `OpenBrush / Atoms / Shapes` — Line, Square, Triangle, Circle, Hexagon, Pentagon, Star5, Star8, Cross (all with interactive controls)
- `OpenBrush / Atoms / Volumes` — 12 Three.js geometry primitives: Cube, Sphere, Cylinder, Cone, Torus, TorusKnot, Icosahedron, Octahedron, Tetrahedron, Dodecahedron, Capsule, TriangularPrism
- `OpenBrush / Molecules / Compositions` — NestedSquares, ConcentricCircles, Mandala, DotGrid, InterlockingRings, Snowflake
- `OpenBrush / Molecules / Structures` — Terrain (Perlin fBm), Road (organic branching, terrain-conforming, independent road/terrain seeds), Tree, Rocks, SmallHouse
- `OpenBrush / Organisms / Fractals` — SierpinskiTriangle, KochSnowflake, DragonCurve, HilbertCurve, BarnsleyFern, SierpinskiTriColour, DoubleDragon
- `OpenBrush / Organisms / Village` — full scene: terrain + road network + proximity-placed houses, trees, and rocks

---

## Installation

```bash
yarn install
```

---

## Adding a new setup

1. Add an entry to `setups.js` with the setup name and ports
2. Create `.storybook-[name]/main.js` — copy from `.storybook-html/main.js`, update story paths and port
3. Create `.storybook-[name]/preview.js`:
   ```js
   export { decorators } from '../src/storybook-channel.js';
   ```
4. Create `.storybook-[name]/preview-head.html` — styles for this setup's preview canvas
5. Create `src/[name]/atoms/` and `src/[name]/molecules/`
6. Add scripts to `package.json`:
   ```json
   "storybook:[name]": "STORYBOOK_RELAY_PORT=[relayPort] storybook dev -c .storybook-[name] -p [sbPort] --host 0.0.0.0",
   "relay:[name]":     "PORT=[relayPort] node src/relay.js",
   "dev:[name]":       "concurrently \"yarn relay:[name]\" \"yarn storybook:[name]\""
   ```

---

## Project structure

```
.storybook-[name]/          # Storybook config per setup
  main.js                   # framework, story paths, webpack config
  preview.js                # one-liner re-export from storybook-channel
  preview-head.html         # styles injected into Storybook's preview iframe
src/
  [name]/                   # stories per setup
    atoms/
    molecules/
    organisms/
  relay.js                  # Express + WebSocket relay server (shared)
  storybook-channel.js      # shared decorator — captures renders, sends to relay
  openbrush/
    geometry.js             # edgesFromGeometry() — Three.js geometry → draw.path commands
    utils.js                # command builders: setColor, setSize, path, path3d, line, etc.
    fractals.js             # sierpinskiTriangle, kochSnowflake, dragonCurve, hilbertCurve, barnsleyFern
    story.js                # openbrushStory() helper — canvas preview with oblique projection
    molecules/
      structures.js         # makeTerrain, makeRoadNetwork, makeTree, makeRock, makeScene
public/
  meta-preview.html                  # html setup meta-preview
  meta-preview-threejs-2d.html       # threejs-2d meta-preview
  meta-preview-threejs-3d.html       # threejs-3d meta-preview (with OrbitControls)
  meta-preview-audio.html            # audio meta-preview (Tone.js player)
  meta-preview-openbrush.html        # openbrush meta-preview (HTTP API sender)
setups.js                   # registry of all setups and their ports
```
