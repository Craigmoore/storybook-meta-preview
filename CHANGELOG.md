# Changelog

## [0.11.0] - 2026-04-25

### Added
- `BanterVR-3D / Atoms / Primitives` — TorusKnot atom with `side: 'Double'` baked in
- `BanterVR-3D / Molecules / Fractals` — FractalTree (seeded binary branching tree with depth, branchAngle, spread, lengthDecay, seed controls), SierpinskiTetrahedron (IFS, order 1–3 = 4/16/64 spheres), MengerSponge (IFS, level 1–2 = 20/400 cubes)

### Fixed
- `mock-bs-3d.js` — Euler rotation order changed from Three.js default XYZ to YXZ to match Unity/Banter; XYZ order caused azimuth rotation to have no effect on local +Y, making all branches point in the same direction and appear invisible edge-on
- `Fractals.stories.js` — FractalTree branch positions computed in world space rather than via rotated pivot GameObjects; avoids SDK ambiguity about whether `localEulerAngles` is applied at construction time; all branches parented to a root object so the tree moves/destroys as a unit

### Changed
- `README.md` — added `bantervr-3d` setup section with ports, inject script usage, demo script, and full story list; updated Built With entry for BanterVR to mention 3D

## [0.10.0] - 2026-04-25

### Added
- `bantervr-3d` setup: BanterVR 3D story library with live in-world preview via WebSocket inject
- `public/bantervr-3d-test.js` — standalone demo script for verifying 3D object rendering in-world; covers floor+collider, primitives row, parent/child hierarchy, physics box, and point light
- `public/meta-preview-bantervr-inject-3d.js` — self-contained Banter inject script: reads `position`/`rotation`/`scale` from script tag attributes, connects to relay via WebSocket, reconstructs 3D story scenes using native BS APIs, destroys all previous GameObjects individually on each update, auto-reconnects on disconnect
- `src/bantervr-3d/mock-bs-3d.js` — browser mock of the BanterVR BS namespace for 3D: `GameObject`, `BanterBox`, `BanterSphere`, `BanterCylinder`, `BanterCone`, `BanterTorus`, `BanterTorusKnot`, `BanterMaterial`, `BanterLight`; maps to Three.js geometry for Storybook preview; `serializeConfig` converts Vector types to arrays for relay transport
- `src/bantervr-3d/story.js` — `banterVrStory()` helper with OrbitControls, ambient+directional lights, and `hexToVec()` utility
- Atoms: `Primitives` (Box, Sphere, Cylinder, Cone, Torus) — each with colour picker and size range controls
- Molecules: `Volumes` — all six primitive types in a row; TorusKnot uses `side: 'Double'` to avoid backface-culling artefacts on inward-facing geometry
- `docs/setup-bantervr-3d.md` — full setup reference: ports (6012/3339/33390), mock→Three.js mapping, JSON serialisation format, inject script reconstruction pattern, story hierarchy
- `docs/setup-tui.md` — planning doc for TUI setup (ROT.js preview + xterm.js/Node.js meta-preview)
- Relay messages for BanterVR-3D stories include `banterVR3DData` (serialised scene graph)

## [0.9.4] - 2026-04-25

### Changed
- `README.md` — openbrush screenshots labelled and reordered: Mandala and Concentric Circles first, Village last

## [0.9.3] - 2026-04-25

### Added
- `docs/screenshots/` — setup screenshots embedded in README: html, threejs-2d, threejs-3d, audio, bantervr-ui, and 10 openbrush renders (mandala, concentric circles, village, Sierpinski variants, Koch snowflake, dragon curve, double dragon, Hilbert curve, Barnsley fern)

### Changed
- `public/bantervr-ui-test.js` — rewritten as a full reference demo covering all known-good Banter UI patterns: individual padding properties, transparent UILabel background, slider lowValue/highValue/WaitForEndOfFrame sequence, toggle string value, and button without explicit width; inline comments explain the why behind each rule
- `README.md` — added bantervr-ui setup section with inject script and demo script usage, Node.js/Yarn prerequisites, screenshots for all setups

## [0.9.2] - 2026-04-25

### Fixed
- `GameLobby` — slider height set to `20px` to match toggle row alignment; button width removed so flex-column stretch sizes it correctly in Banter (explicit `width` was causing the 1px border to overflow the content area under Unity's content-box model)

## [0.9.1] - 2026-04-25

### Added
- `src/bantervr-ui/organisms/GameLobby.stories.js` — full-panel organism combining all six element types: title label, status badge (colour-coded by arg), player scroll list, music toggle row, volume slider row, and action button

## [0.9.0] - 2026-04-24

### Added
- `bantervr-ui` setup: BanterVR UI Toolkit story library with live in-world preview via WebSocket inject
- `public/meta-preview-bantervr-ui.html` — standalone meta-preview page for BanterVR-UI stories
- `public/meta-preview-bantervr-inject.js` — self-contained Banter inject script: connects to relay via WebSocket, reconstructs UI stories in-world using real BS APIs, destroys previous GameObjects on each update, auto-reconnects on disconnect
- `public/bantervr-ui-test.js` — standalone Hello World debug script for verifying BanterUI panel rendering in-world
- `src/bantervr-ui/mock-bs.js` — lightweight browser mock of the BanterVR BS namespace: `GameObject`, `BanterUIPanel`, `UILabel`, `UIButton`, `UISlider`, `UIToggle`, `UIScrollView`, `UIVisualElement`; `styleProxy` captures USS styles to a plain map for relay transport; `toJSON()` serialisation on all classes; `UNITY_TO_CSS` map for browser preview of `unityFontStyle`/`unityTextAlign`
- `src/bantervr-ui/story.js` — `banterUiStory()` helper
- `docs/unity-uitoolkit.md` — Unity UI Toolkit reference (USS properties, element types, selector syntax)
- Atoms: `Buttons` (Button, ConfirmCancel, IconButton), `Labels` (Label), `Inputs` (Slider, Toggle), `VisualElement` (VisualElement, FlexRow, FlexColumn, FlexWrap, Nested)
- Molecules: `ButtonGroup` (IconButton, ImageIconButton, ConfirmCancel), `ActionCard`, `Labels` (Scoreboard, StatusBadge), `Sliders` (SliderLabelled, SliderWithRange), `Toggles` (ToggleLabelled, ToggleGroup), `ScrollView` (VerticalList, HorizontalList, MixedContent), `SettingsPanel`
- Relay messages for BanterVR-UI stories include `banterUIData` (serialised scene graph) alongside `banterUIHtml` (HTML preview)

### Fixed
- Inject script uses `BS.BanterUI` (not `BS.BanterUIPanel`) with `await AddComponent` — `BanterUI` is the class that renders a visible surface; `BanterUIPanel` alone produces only a collider
- All UI elements created via `panel.CreateX(parent)` methods and individually awaited with `el.Async()`
- UISlider range and value set via `SetProperty('lowValue')`, `SetProperty('highValue')`, `SetProperty('value')` with `WaitForEndOfFrame` between range and value
- UIToggle initial state set via `SetProperty('value', 'true'/'false')` — Banter's JS→Unity bridge silently ignores JS booleans; string `'true'`/`'false'` required
- UILabel default background set to `rgba(0,0,0,0)` in mock constructor — Unity applies white by default; explicit transparent value ensures it is always sent to Banter
- `sanitizeStyles()` strips all properties that cause Unity UI Toolkit's `SetStyles` to abort and discard the entire call: `gap`/`rowGap`/`columnGap`, compound `padding`/`margin`/`border` shorthands, `wordSpacing`, all `unity*`-prefixed properties (`unityFontStyle`, `unityTextAlign`, etc.); unwraps `url('...')` syntax from `backgroundImage`
- All compound `padding` shorthands replaced with individual `paddingTop/Right/Bottom/Left` throughout all story files
- All `gap` on panel roots replaced with `marginBottom`/`marginRight` on child elements; `gap` moved to inner `UIVisualElement` containers where needed
- SettingsPanel: sliders now initialised via `SetRange`/`SetValue`; toggles via `SetChecked` — previous direct `_el.setAttribute` calls bypassed serialisation so state was never sent to Banter; `flex` shorthand on sliders replaced with explicit `width`
- VisualElement `Nested` story: compound `padding` in recursive `makeBox` replaced with individual properties — inner boxes had no size without padding and were invisible in Banter
- `.storybook-bantervr-ui/preview-head.html` — added `box-sizing: border-box` on the panel root `<div>` so that padding set by stories does not inflate it beyond the panel width in the browser preview

### Known limitations
- `backgroundImage` on `UIVisualElement` does not render in BanterVR — Unity UI Toolkit requires a `Sprite`/`Texture2D` asset reference and does not support runtime HTTP/HTTPS URL strings; emoji characters are the recommended approach for inline icons

## [0.8.2] - 2026-04-21

### Changed
- `README.md` — updated openbrush setup with Three.js geometry pipeline, meta-preview button docs, full story list; expanded audio story counts; added organisms layer and all public meta-preview files to project structure

## [0.8.1] - 2026-04-21

### Added
- `meta-preview-openbrush.html` — save, export, and show exports buttons: `save.new` saves to a new sketch slot, `export.current` exports to the Open Brush Exports folder, `showfolder.exports` opens that folder on the desktop

## [0.8.0] - 2026-04-21

### Added
- Storybook controls added to all openbrush stories:
  - `Shapes.stories.js` — line endpoints, rect dimensions, polygon radius/sides, circle segments, star inner/outer radius and point count, cross length, brush size on all
  - `Compositions.stories.js` — nested square count/size, concentric circle count/radius/segments, mandala ring counts and radii, dot grid rows/cols/spacing/radius, interlocking ring count/radius/overlap, snowflake spokes/length/branch count
  - `Fractals.stories.js` — depth/radius for Sierpinski variants, depth/radius for Koch, iterations/stepSize for Dragon variants, order/size for Hilbert, iterations/scale for Barnsley Fern, brush size on all
  - `Structures.stories.js` — terrain size/segments/heightScale, road layout seed/terrain seed/depth (independent seeds), rock count/size range, house scale relative to tree height
  - `Village.stories.js` — scene seed, brush size

## [0.7.0] - 2026-04-21

### Added
- `src/openbrush/geometry.js` — `edgesFromGeometry(geometry, matrix?, batchSize?)` converts any Three.js `BufferGeometry` into `draw.path` commands via `EdgesGeometry`; batching support for large geometries
- `path3d` helper in `src/openbrush/utils.js` — `draw.path` with explicit Z coordinates; oblique projection in canvas preview so 3D strokes render with visible depth
- `src/openbrush/atoms/Volumes.stories.js` — 12 volumetric atoms using Three.js geometry: Cube, Sphere, Cylinder, Cone, Torus, TorusKnot, Icosahedron, Octahedron, Tetrahedron, Dodecahedron, Capsule, TriangularPrism
- `src/openbrush/molecules/structures.js` — `makeTerrain` (Perlin fBm, 20×20), `terrainHeight`, `makeRoadNetwork` (organic branching, terrain-conforming), `makeTree`, `makeRock`, `makeScene(seed)` — full village layout with proximity-checked placement of houses, trees, and rocks all following terrain height
- `src/openbrush/molecules/Structures.stories.js` — Terrain, Road, Tree, Rocks, SmallHouse stories
- `src/openbrush/organisms/Village.stories.js` — Village scene organism

## [0.6.0] - 2026-04-21

### Added
- `openbrush` setup: Open Brush HTTP API command stories
- `src/openbrush/utils.js` — command builders: `setColor`, `setSize`, `path`, `line`, `rect`, `polygon`, `circle`, `star` using correct Open Brush API (`draw.path`, `color.set.rgb`, `brush.size.set`)
- `src/openbrush/fractals.js` — `sierpinskiTriangle`, `kochSnowflake`, `dragonCurve`, `hilbertCurve`, `barnsleyFern`
- `src/openbrush/story.js` — `openbrushStory()` helper; sets `window.__metaPreviewBrush` and returns a live 2D canvas preview of the strokes
- `src/openbrush/atoms/Shapes.stories.js` — Line, Square, Triangle, Circle, Hexagon, Pentagon, Star5, Star8, Cross
- `src/openbrush/molecules/Compositions.stories.js` — NestedSquares, ConcentricCircles, Mandala, DotGrid, InterlockingRings, Snowflake
- `src/openbrush/organisms/Fractals.stories.js` — SierpinskiTriangle (depth 4), KochSnowflake (depth 4), DragonCurve (10 iterations), HilbertCurve (order 4), BarnsleyFern (5000 IFS points), SierpinskiTriColour, DoubleDragon
- `.storybook-openbrush/` config (main.js, preview.js, preview-head.html)
- `public/meta-preview-openbrush.html` — sends command sequences to Open Brush via HTTP API with progress bar; auto-sends on story select; brush anchored at (0,1.5,0) so drawings appear at eye height
- `src/storybook-channel.js` extended: detects `window.__metaPreviewBrush` and sends `brushData`
- Scripts: `storybook:openbrush`, `relay:openbrush`, `dev:openbrush`, `build:openbrush`
- `docs/sdk-openbrush.md` updated with correct API commands sourced from Open Brush source code

### Fixed
- Corrected Open Brush API command format throughout: `draw.path=[x,y,z],...` for paths, `color.set.rgb=r,g,b`, `brush.size.set=N`, `new` (not `sketches.new`)
- BarnsleyFern dots batched as 100 `draw.path` params per GET request (was 5000 individual requests)
- BarnsleyFern dots use 3-point arcs so `DrawNestedTrList` correctly adds the final endpoint

## [0.5.1] - 2026-04-21

### Changed
- Expanded audio stories with richer musical content
- `Note.stories.js` — 7 stories spanning sub-bass (A1) to stratosphere (C8)
- `Chord.stories.js` — 14 chords covering triads, sevenths, extended, quartal, cluster, and power chord
- `Progression.stories.js` — 9 progressions: Pop Loop, Jazz ii–V–I, Andalusian, Pachelbel, 12-bar Blues, Circle of Fifths, Chromatic Rise, Celtic Melody, Dorian Vamp

## [0.5.0] - 2026-04-21

### Added
- `audio` setup: structured music data stories with Tone.js playback in the meta-preview
- `src/audio/story.js` — `audioStory(data)` helper; sets `window.__metaPreviewData` and returns styled HTML for Storybook's preview
- `src/audio/atoms/Note.stories.js` — Middle C, High A, Long E
- `src/audio/molecules/Chord.stories.js` — C Major, A Minor, D Major 7
- `src/audio/organisms/Progression.stories.js` — I–vi–IV–V and a blues loop
- `.storybook-audio/` config (main.js, preview.js, preview-head.html)
- `public/meta-preview-audio.html` — Tone.js player with play/stop buttons, waveform visualiser, and active-note highlighting; stops and resets on every story change
- `src/storybook-channel.js` extended: detects `window.__metaPreviewData` and sends `audioData`
- Scripts: `storybook:audio`, `relay:audio`, `dev:audio`, `build:audio`

## [0.4.0] - 2026-04-21

### Added
- `threejs-3d` setup: perspective Three.js scenes via `@storybook/html-webpack5`
- `src/threejs-3d/scene-canvas.js` — helper with perspective camera, ambient + directional lighting, and `edgesGeometry` util
- `src/threejs-3d/atoms/Box.stories.js` — solid and wireframe box variants
- `src/threejs-3d/atoms/Sphere.stories.js` — default and shiny (metalness/roughness) sphere variants
- `src/threejs-3d/molecules/Composition.stories.js` — box + sphere side-by-side, and a stacked tower
- `.storybook-threejs-3d/` config (main.js, preview.js, preview-head.html)
- `public/meta-preview-threejs-3d.html` — standalone meta-preview with perspective renderer and `OrbitControls`
- Scripts: `storybook:threejs-3d`, `relay:threejs-3d`, `dev:threejs-3d`, `build:threejs-3d`
- `OrbitControls` added to `meta-preview-threejs-2d.html`

## [0.3.0] - 2026-04-21

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
