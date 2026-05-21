# Changelog

## Unreleased

### Changed
- README: added Demo section linking to YouTube playlist

## [0.17.3] - 2026-05-21

### Changed
- README: added sdf3d screenshots (Metaballs, Letter Block) and expanded BanterVR in-world setup section with end-to-end description of the Storybook → Banter mesh pipeline

## [0.17.2] - 2026-05-21

### Added
- `public/meta-preview-bantervr-sdf3d-inject.js` — inject script for BanterVR SDF3D integration; include in a Banter world's `index.html` with a `uuid` attribute matching the Visual Script game object name; connects to the SDF3D relay via WebSocket, receives marching-cubes geometry on each story render, and exposes the full `BanterThreeJsMarshallingService` paged wire API (`injectVerticesPaged`, `injectNormalsPaged`, `injectIndicesPaged`, etc.) as `window` globals; triggers `SendToVisualScripting(uuid + '.updateGeometryPaged', '')` to notify the Visual Script that new geometry is ready
- Relay updated to broadcast `story-rendered` messages to `bantervr-sdf3d-inject` clients
- README: BanterVR in-world setup instructions and screenshots for the sdf3d setup

### Fixed
- Relay: added CORS headers (`Access-Control-Allow-*`) so Banter's `uuid`-attributed `<script>` tags (which are XHR-fetched and trigger an OPTIONS preflight) can load the inject script cross-origin

## [0.17.1] - 2026-05-02

### Changed
- Resolution slider extended from 16–64 to 16–128 across all SDF3D stories
- README: updated sdf3d section with new stories, controls, and source files

## [0.17.0] - 2026-04-30

### Fixed
- `displayArgType` select control was silently broken (`options` was nested inside `control` instead of at the argType level) — `display` dropdown now works across all SDF3D stories
- `drawLetter` in `ProjectionSdf` stories now detects the actual pixel bounding box of the rendered glyph (2× temp canvas + dark-pixel scan) and stretches it to a uniform span, ensuring all three axis silhouettes are consistent for the intersection technique

### Added
- `cameraArgType` and `camera` option in `sdf3dStory` — orthographic views along each axis (`ortho-X`, `ortho-Y`, `ortho-Z`) plus the default `perspective` orbiting camera; `ProjectionSdf` stories expose this as a dropdown control so each letter face can be inspected head-on
- `src/sdf3d/profiles2d.js` — JS ports of 2D SDF profiles for use with sweep operations: `circle2D`, `box2D`, `hexagon2D`, `pentagon2D`, `star5_2D`, `cross2D`, `heart2D`, `egg2D`
- `revolve(offset, f2d)` and `extrude(h, f2d)` sweep operators added to `src/sdf3d/primitives.js`
- `src/sdf3d/rasterSdf2d.js` — `drawToSdf2D(drawFn, opts)`, `textToSdf2D(text, opts)`, and `projectionSdf3D(drawX, drawY, drawZ, opts)`: three canvas silhouettes (one per axis) intersected into a 3D SDF: canvas rasterisation → Felzenszwalb–Huttenlocher Euclidean distance transform → bilinear-interpolated 2D SDF function
- `src/sdf3d/glyphSdf2d.js` — `loadThreeFont()` and `textToGlyphSdf2D(font, text, opts)`: exact 2D SDF from Three.js typeface JSON bezier outlines; analytic cubic solve for quadratic bezier distance, Newton-refined sampling for cubic; non-zero winding rule for sign
- `SDF3D/Molecules/Text` — RasterLetter, RasterWord (canvas SDF); GlyphLetter, GlyphWord, GlyphOps (exact bezier SDF with twist/onion composability)
- `SDF3D/Molecules/ProjectionSdf` — 5 stories: TriCircle (three circles ≈ sphere), TriStar (star intersected on all axes), MixedSilhouettes (circle × star × cross), LetterBlock (one letter per axis — the sculptor's technique), HexStar (hex prism with star punched through)
- `SDF3D/Molecules/Sweep` — 9 sweep stories: CircleRevolution, StarRevolution, PentagonRevolution, HeartRevolution, EggRevolution, StarExtrusion, HexExtrusion, CrossExtrusion, HeartExtrusion
- `SDF3D/Organisms/SweepCompositions` — 5 organisms combining revolution and extrusion: SpiralStars (star discs stacked with increasing rotation — continuous helical form), HelixCoil (circle profile swept along a helix path — coil spring), TwinHelix (two intertwined helix strands with distinct profiles), KaleidoscoPrism (2D polar-repeated egg profile extruded — kaleidoscope top view), StarWreath (star prisms arranged around a revolve ring, each rotated outward)

## [0.16.0] - 2026-04-30

### Added
- `sdf3d` setup: SDF3D story library — stories define JavaScript signed-distance functions; marching cubes tessellates the isosurface; Three.js renders via `sdf3dStory()` with OrbitControls
- `src/sdf3d/marchingcubes.js` — JS port of the classic Paul Bourke marching-cubes algorithm
- `src/sdf3d/isosurface.js` — `buildIsosurface(dims, mapFn, bounds)` helper; builds a `THREE.BufferGeometry` with central-difference gradient normals
- `src/sdf3d/primitives.js` — functional SDF library: `sphere`, `box`, `roundBox`, `torus`, `cappedTorus`, `verticalCapsule`, `cylinder`, `roundedCylinder`, `cappedCone`, `octahedron`, `link`, `boxFrame`; boolean ops `union`, `intersect`, `subtract`, `smoothUnion`, `smoothIntersect`, `smoothSubtract`; domain ops `translate`, `scale`, `rotateX/Y/Z`, `mirrorX`, `onion`
- `src/sdf3d/story.js` — `sdf3dStory(mapFn, opts)` helper; `display` controls material (normals / solid / wireframe); `resolution` controls marching-cubes grid size; `displayArgType` for Storybook controls
- `SDF3D/Atoms/Shapes` — Sphere, Box, RoundBox, Torus, CappedTorus, VerticalCapsule, Cylinder, RoundedCylinder, CappedCone, Octahedron, Link, BoxFrame
- `SDF3D/Molecules/CSG` — Union, Intersect, Subtract, SmoothUnion, SmoothIntersect, SmoothSubtract; each story has a separation slider to show shapes coming apart or merging
- `SDF3D/Molecules/Domain` — Onion (hollow torus shell), Twist (twisted rounded pillar), Elongate (anisotropic octahedron), RepeatPolar (N-fold radial symmetry of capsules)
- `SDF3D/Organisms/Compositions` — Metaballs (N spheres on a ring, smooth union), Dumbbell (spheres + capsule stem), CrystalCluster (Fibonacci-lattice octahedra), TwistedTower (twist + base ring), Gyroid (thickened triply-periodic minimal surface)
- `SDF3D/Organisms/Fractals` — MengerSponge (recursive cross-subtraction, iter 1–3), SierpinskiTetrahedron (IFS fold-scale, iter 1–6)
- `src/sdf3d/primitives.js` — added `twist`, `elongate`, `repeatPolar` domain operations
- `public/meta-preview-sdf3d.html` — standalone SDF3D renderer; receives pre-tessellated geometry (position/normal arrays) from relay and renders with Three.js + OrbitControls; supports normals / solid / wireframe display modes

## [0.15.0] - 2026-04-29

### Added
- `src/bantervr-ui/molecules/components.js` — molecule constructor functions: `makeStatusBadge`, `makePlayerRow`, `makeToggleRow`, `makeSliderRow`; each returns a UI element for composition in organism stories
- `SDF2D/Organisms/Effects/ImpastoArcs` — concentric sinusoidally-modulated arc SDF; waveform phase shifts per ring via golden-angle offset
- `SDF2D/Organisms/Effects/NeonPulse` — three animated ring-SDF systems (`abs(mod(r−v·t,P)−P/2)−hw`) with different periods; animated moiré from overlapping ring families
- `SDF2D/Organisms/Effects/ChainMail` — two diagonally-offset square lattices of ring SDFs; union produces interlocking link pattern
- `SDF2D/Organisms/Effects/TopographicContours` — layered-sine terrain height field; contour SDF `(fract(h·N)−0.5)/(N·|∇h|)` via central-difference gradient
- `SDF2D/Organisms/Effects/ZebraVortex` — stripe SDF `sin(f·π)/(π·|∇f|)` in a spiral-warped polar field; gradient computed analytically via chain rule; animated

### Changed
- `BanterVR-UI/Organisms/GameLobby` — refactored to compose molecule constructors from `components.js` rather than building all sub-elements inline; fixes atomic design hierarchy violation

## [0.14.0] - 2026-04-28

### Added
- `src/sdf2d/molecules-lib.js` — GLSL molecule function library: `molLens`, `molCrescent`, `molSmoothScoop`, `molSmoothIntersect`, `molWireframeTriangle`, `molRingLattice`, `molSmoothBlob`, `molDumbbell`, `molWings`, `molTile`, `molKaleidoscope`; injected into every `sdfStory` shader after `PRIMITIVES`
- `SDF2D/Molecules/Compositions` — SmoothBlob, Dumbbell, Wings, Tile, Kaleidoscope moved from Organisms; stories now call their respective `mol*` functions
- `SDF2D/Organisms/Compositions` — replaced with true organisms that compose molecule functions: Emblem (`molWings` + `molLens`), TriForce (`molWireframeTriangle` × 3), Cell (`molSmoothBlob` + `molRingLattice`), GearMandala (`molKaleidoscope` + `molWireframeTriangle`)

### Changed
- `SDF2D/Molecules/Operations` — all six stories now call their named `mol*` functions rather than inlining equivalent GLSL

## [0.13.1] - 2026-04-27

### Added
- `SDF2D/Organisms/Fractals/RoadNetwork` — seeded procedural branching road network; LCG drives per-segment angle deviation, length variation, and branching decisions; roads rendered as `sdCapsule` union with `sdCircle` junction nodes; controls: seed (0–9999), depth (2–7), roadWidth, spread

## [0.13.0] - 2026-04-27

### Added
- `sdf2d` setup: SDF2D story library — stories define GLSL signed-distance scenes; both Storybook preview and meta-preview render via WebGL2
- `src/sdf2d/primitives.js` — GLSL primitive library: `sdCircle`, `sdBox`, `sdRoundedBox`, `sdCapsule`, `sdEquilateralTriangle`, `sdPentagon`, `sdHexagon`, `sdOctagon`, `sdStar5`, `sdArc`, `sdPie`, `sdRing`, `sdCross`, `sdHeart`, `sdMoon`, `sdVesica`, `sdEgg`; boolean ops (`opUnion`, `opIntersect`, `opSubtract`, smooth variants); domain ops (`opRotate`, `opMirrorX/Y`, `opMirror`, `opRepeat`, `opRepeatPolar`); colorize helpers (`colField`, `colFill`, `colOutline`, `colGradient`)
- `src/sdf2d/canvas.js` — `sdfCanvas(fragSrc, opts)` WebGL2 helper: compiles and links shader, handles animation loop via `requestAnimationFrame`, cleans up on disconnect
- `src/sdf2d/story.js` — `sdfStory(sceneSrc, opts)` helper: assembles full fragment shader from GLSL scene body, renders in Storybook preview, and packages shader for relay transport via `window.__metaPreviewSDF2D`; `col()` and `displayArgType` utilities
- `public/meta-preview-sdf2d.html` — standalone WebGL2 SDF renderer: receives `sdf2dData` from relay, compiles and runs the shader, supports animated shaders via `u_time` uniform
- `SDF2D/Atoms/Shapes` — Circle, Box (with Rounded variant), Capsule, Triangle, Pentagon, Hexagon, Octagon, Star, Arc, Pie, Ring, Cross, Heart, Moon, Vesica, Egg — all with `display` control (field / fill / outline)
- `SDF2D/Molecules/CSG` — Union, Intersect, Subtract, SmoothUnion, SmoothIntersect, SmoothSubtract (each with separation + shape size controls)
- `SDF2D/Molecules/Domain` — Flower (polar repeat of rounded petal), Starburst (polar repeat capsule rays), Shells (onion layers via abs(d)−t)
- `SDF2D/Molecules/Operations` — Lens, Crescent, SmoothScoop, SmoothIntersect, WireframeTriangle, RingLattice
- `SDF2D/Organisms/Compositions` — SmoothBlob, Dumbbell, Wings, Tile (tiled ring+cross motif), Kaleidoscope (mirror + polar repeat + smooth union)
- `SDF2D/Organisms/Fractals` — KochSnowflake (JS subdivision, iter 0–3), Sierpinski (GLSL IFS nearest-vertex, iter 1–8), SierpinskiCarpet (GLSL mod-based, iter 1–6), DragonCurve (JS IFS turn-sequence, iter 1–12), LevyCCurve (JS recursive subdivision, iter 1–12), FractalTree (JS binary branching, depth 1–6)

## [0.12.1] - 2026-04-26

### Changed
- `README.md` — add missing bantervr-3d screenshot

## [0.12.0] - 2026-04-26

### Added
- `tui` setup: terminal UI story library with ROT.js Storybook preview and xterm.js meta-preview (`public/meta-preview-tui.html`)
- `src/tui/story.js` — `tuiStory()` helper and `Grid` class; renders via `ROT.Display` (Storybook) and ANSI escape codes (meta-preview)
- `src/tui/ansi.js` — `gridToAnsi()` using absolute cursor positioning (`\x1b[y+1;1H`) and true-colour SGR to avoid xterm.js line-spacing artefacts
- `src/tui/dungeonComponents.js` — shared Angband-style drawing library: palette `C`, tile catalogue `TILES`, atom helpers (`drawStatRow`, `drawStatusBadge`, `drawMessageLine`), molecule helpers (`drawAttributeBlock`, `drawVitalsBlock`, `drawCombatBlock`, `drawEquipmentList`, `drawMessageLog`, `drawCharacterHeader`), organism helper `drawCharacterPanel`
- `TUI/Atoms/Primitives` — Box, Text, ProgressBar, ColorSwatch, Border at 170×47 default resolution with Terminus font
- `TUI/Atoms/Dungeon` — TileReference legend, StatRow, StatusBadge, MessageLine
- `TUI/Molecules/Dungeon` — AttributeBlock, VitalsBlock, CombatBlock, EquipmentList, MessageLog, CharacterHeader
- `TUI/Organisms` — TmuxLayout (tmux-style split pane), AngbandLevel (procedural dungeon via ROT.js Digger with seed + depth controls), CharacterSheet, TownLevel, InventoryScreen, StoreScreen
- `src/tui/bloombergComponents.js` — Bloomberg Terminal drawing library: amber-on-black palette, `priceHistory()` seeded PRNG, atoms (`drawBloombergHeader`, `drawSparkline`, `drawFnKeyBar`, `drawPriceChart`), molecules (`drawQuoteHeader`, `drawKeyStats`, `drawOrderBook`, `drawNewsHeadlines`, `drawMarketRow`)
- `src/tui/htopComponents.js` — htop drawing library: `drawCpuBar`, `drawMemBar`, `drawProcessHeader`, `drawProcessRow`, `drawCpuGrid`, `drawMemoryPanel`, `drawTaskSummary`, `drawProcessList`, `generateProcesses`
- `TUI/Atoms/Bloomberg` — PriceTick, Sparkline, FunctionKeyBar, SectionLabel
- `TUI/Atoms/Htop` — CpuBar, MemBar, ProcessRow
- `TUI/Molecules/Bloomberg` — QuoteHeader, KeyStatistics, OrderBook, NewsHeadlines, MarketRow, MiniChart
- `TUI/Molecules/Htop` — CpuGrid, MemoryPanel, TaskSummary, ProcessTable
- `TUI/Organisms` — Bloomberg EQS (equity summary with chart + order book), Bloomberg WMQ (world market monitor), Bloomberg GP (full-screen price chart), htop System Monitor

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
