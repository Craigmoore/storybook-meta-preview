# Story Hierarchy Audit

For each setup: configuration summary, story hierarchy, and dependency trees for
molecules and organisms (proving each is at the correct atomic-design level).

---

## 1. HTML

| | |
|---|---|
| Framework | `@storybook/html-webpack5` |
| Storybook | `:6006` |
| Relay | `:3333` |
| Meta-preview | `meta-preview.html` (raw HTML injection) |
| Story paths | `src/html/atoms/`, `src/html/molecules/` |

**Hierarchy**

```
Atoms
  Hello       — Default
  World       — Default

Molecules
  Greeting    — Default
```

**Molecule trees**
```
Greeting
├── Hello  (atom span)
└── World  (atom span)
```

---

## 2. ThreeJS-2D

| | |
|---|---|
| Framework | `@storybook/html-webpack5` + Three.js canvas |
| Storybook | `:6007` |
| Relay | `:3334` |
| Story paths | `src/threejs-2d/atoms/`, `src/threejs-2d/molecules/` |

**Hierarchy**

```
Atoms
  Circle      — Default, Ring
  Rectangle   — Default, Outlined

Molecules
  Layout      — SideBySide, Stacked
```

**Molecule trees**
```
Layout/SideBySide
├── Rectangle (left)
└── Rectangle (right)

Layout/Stacked
├── Circle     (top)
└── Rectangle  (bottom)
```

---

## 3. ThreeJS-3D

| | |
|---|---|
| Framework | `@storybook/html-webpack5` + Three.js / OrbitControls |
| Storybook | `:6008` |
| Relay | `:3335` |
| Story paths | `src/threejs-3d/atoms/`, `src/threejs-3d/molecules/` |

**Hierarchy**

```
Atoms
  Box         — Default, Wireframe
  Sphere      — Default, Shiny

Molecules
  Composition — BoxAndSphere, Tower
```

**Molecule trees**
```
Composition/BoxAndSphere
├── Box    (left)
└── Sphere (right)

Composition/Tower
├── Box    (wide base)
├── Box    (mid section)
└── Sphere (top cap)
```

---

## 4. Audio

| | |
|---|---|
| Framework | `@storybook/html-webpack5`; preview: HTML pill display; meta-preview: Tone.js |
| Storybook | `:6009` |
| Relay | `:3336` |
| Story paths | `src/audio/atoms/`, `src/audio/molecules/`, `src/audio/organisms/` |

**Hierarchy**

```
Atoms
  Note        — SubBass, BassA, MiddleC, ConcertA, HighE, Crystal, Stratosphere

Molecules
  Chord       — CMajor, AMinor, BDiminished, CAugmented, CSus4, CSus2,
                CMaj7, G7, DMin7, CDim7, CMaj9, QuartalStack,
                ChromaticCluster, PowerChord

Organisms
  Progression — PopLoop, JazzTwoFiveOne, Andalusian, Pachelbel,
                TwelveBarBlues, CircleOfFifths, ChromaticRise,
                CelticMelody, DorianVamp
```

**Molecule / organism trees**
```
Chord/*
└── Note × 2–4  (simultaneous pitches)

Progression/*
├── Chord × 3–8  (sequential steps)
│   └── Note × 2–4
└── bpm + timing metadata
```

---

## 5. OpenBrush

| | |
|---|---|
| Framework | `@storybook/html-webpack5`; preview: Canvas 2D; meta-preview: live OpenBrush |
| Storybook | `:6010` |
| Relay | `:3337` |
| Story paths | `src/openbrush/atoms/`, `src/openbrush/molecules/`, `src/openbrush/organisms/` |
| Shared libs | `utils.js` (setColor/setSize/rect/circle/polygon…), `geometry.js`, `fractals.js`, `molecules/structures.js` |

**Hierarchy**

```
Atoms
  Shapes      — Line, Square, Triangle, Circle, Hexagon, Pentagon,
                Star5, Star8, Cross
  Volumes     — Cube, Sphere, Cylinder, Cone, Torus, TorusKnot,
                Icosahedron, Octahedron, Tetrahedron, Dodecahedron,
                Capsule, TriangularPrism

Molecules
  Compositions — NestedSquares, ConcentricCircles, Mandala, DotGrid,
                 InterlockingRings, Snowflake
  Structures   — Terrain, Road, Tree, Rocks, SmallHouse

Organisms
  Fractals    — SierpinskiTriangle, KochSnowflake, DragonCurve,
                HilbertCurve, BarnsleyFern, SierpinskiTriColour, DoubleDragon
  Village     — Village
```

**Molecule trees**
```
Compositions/NestedSquares
└── Square × N  (scaled, hue-shifted per step)

Compositions/ConcentricCircles
└── Circle × N  (scaled outward)

Compositions/Mandala
└── Line + polygon shapes  (polar repeat)

Compositions/DotGrid
└── Circle × N  (grid arrangement)

Compositions/InterlockingRings
└── Circle × N  (offset, overlapping)

Compositions/Snowflake
└── Line × N  (radial arms + sub-arms)

Structures/Terrain
└── mesh edges via THREE.js PlaneGeometry + height noise

Structures/Road
└── Line segments  (makeRoadNetwork — seeded branching)

Structures/Tree
└── Line strokes  (makeTree — trunk + recursive branches)

Structures/Rocks
└── polygon clusters  (makeRock — randomised convex shapes)

Structures/SmallHouse
└── Square (walls) + Triangle (roof) + Line details
```

**Organism trees**
```
Fractals/SierpinskiTriangle
└── Triangle × 3^N  (recursive subdivision — fractals.js)

Fractals/KochSnowflake
└── Line segments × 3×4^N  (edge subdivision — fractals.js)

Fractals/DragonCurve
└── Line segments × 2^N  (IFS fold — fractals.js)

Fractals/HilbertCurve
└── Line segments × 4^N  (L-system — fractals.js)

Fractals/BarnsleyFern
└── Line segments  (4-transform IFS — fractals.js)

Village
├── Structures/Terrain  (makeScene → makeTerrain)
├── Structures/Road     (makeScene → makeRoadNetwork)
├── Structures/Tree × N (makeScene → makeTree)
├── Structures/Rocks × N(makeScene → makeRock)
└── SmallHouse × N      (makeScene → makeHouseAt)
```

---

## 6. BanterVR-UI

| | |
|---|---|
| Framework | `@storybook/html-webpack5`; preview: mock-bs.js → HTML; meta-preview: Banter inject script |
| Storybook | `:6011` |
| Relay | `:3338` |
| Story paths | `src/bantervr-ui/atoms/`, `src/bantervr-ui/molecules/`, `src/bantervr-ui/organisms/` |
| Shared libs | `mock-bs.js` (BS UI namespace mock) |

**Hierarchy**

```
Atoms
  Buttons       — Button, IconButton
  Inputs        — Slider, Toggle
  Labels        — Label
  VisualElement — VisualElement, FlexRow, FlexColumn, FlexWrap, Nested

Molecules
  ActionCard    — Default
  ButtonGroup   — IconButton, ImageIconButton, ConfirmCancel
  Labels        — Scoreboard, StatusBadge
  ScrollView    — VerticalList, HorizontalList, MixedContent
  SettingsPanel — Default
  Sliders       — SliderLabelled, SliderWithRange
  Toggles       — ToggleLabelled, ToggleGroup

Organisms
  GameLobby     — GameLobby
```

**Molecule trees**
```
ActionCard
├── VisualElement  (panel shell)
├── Label          (title)
├── Label          (description)
└── Button         (CTA)

ButtonGroup/IconButton
├── VisualElement  (shell)
├── Label          (icon glyph)
└── Label          (text)

ButtonGroup/ConfirmCancel
├── Button  (confirm)
└── Button  (cancel)

Labels/Scoreboard
├── Label  (heading)
└── Label  (value)

Labels/StatusBadge
├── VisualElement  (badge shell)
└── Label          (text)

ScrollView/*
├── VisualElement  (scroll container)
└── Label × N      (list items)

SettingsPanel
└── [ VisualElement (row) + Label + (Toggle | Slider) ] × N

Sliders/SliderLabelled
├── Label
└── Slider (atom)

Toggles/ToggleLabelled
├── Label
└── Toggle (atom)
```

**Organism trees**
```
GameLobby
├── ActionCard           (join/start CTA)
├── ButtonGroup          (mode/tab selector)
├── ScrollView           (player roster)
│   └── Labels/StatusBadge × N  (per player)
└── VisualElement        (outer layout shell)
```

---

## 7. BanterVR-3D

| | |
|---|---|
| Framework | Three.js + mock-bs-3d.js / OrbitControls; meta-preview: Banter inject script |
| Storybook | `:6012` |
| Relay | `:3339` |
| Story paths | `src/bantervr-3d/atoms/`, `src/bantervr-3d/molecules/` |
| Shared libs | `mock-bs-3d.js` (BS 3D namespace mock → Three.js), `story.js` |

**Hierarchy**

```
Atoms
  Primitives  — Box, Sphere, Cylinder, Cone, Torus, TorusKnot

Molecules
  Volumes     — Volumes
  Fractals    — FractalTree, SierpinskiTetrahedron, MengerSponge
```

**Molecule trees**
```
Volumes
└── Box + Sphere + Cylinder + Cone + Torus + TorusKnot  (one of each, row)

Fractals/FractalTree
└── Cylinder × (2^depth − 1)  (each branch, world-space positions, seeded)

Fractals/SierpinskiTetrahedron
└── Sphere × (4 | 16 | 64)  (IFS tetrahedral positions, order 1–3)

Fractals/MengerSponge
└── Box × (20 | 400)  (IFS cube-carving positions, level 1–2)
```

---

## 8. TUI

| | |
|---|---|
| Framework | `@storybook/html-webpack5`; preview: ROT.js display; meta-preview: xterm.js |
| Storybook | `:6013` |
| Relay | `:3340` |
| Story paths | `src/tui/atoms/`, `src/tui/molecules/`, `src/tui/organisms/` |
| Shared libs | `ansi.js` (gridToAnsi), `dungeonComponents.js`, `bloombergComponents.js`, `htopComponents.js` |

**Hierarchy**

```
Atoms
  Primitives  — Box, Text, ProgressBar, ColorSwatch, Border
  Dungeon     — TileReference, StatRow, StatusBadge, MessageLine
  Bloomberg   — PriceTick, Sparkline, FunctionKeyBar, SectionLabel
  Htop        — CpuBar, MemBar, ProcessRow

Molecules
  Dungeon     — AttributeBlock, VitalsBlock, CombatBlock,
                EquipmentList, MessageLog, CharacterHeader
  Bloomberg   — QuoteHeader, KeyStatistics, OrderBook,
                NewsHeadlines, MarketRow, MiniChart
  Htop        — CpuGrid, MemoryPanel, TaskSummary, ProcessTable

Organisms
  Angband     — CharacterSheet, TownLevel, InventoryScreen,
                StoreScreen, AngbandLevel
  Bloomberg   — BloombergEQS, BloombergWMQ, BloombergGP
  Htop        — SystemMonitor
  Shell       — TmuxLayout
```

**Molecule trees**
```
Dungeon/AttributeBlock
└── StatRow × 6   (STR, DEX, CON, INT, WIS, CHR)

Dungeon/VitalsBlock
├── StatRow        (HP / Mana labels)
└── ProgressBar × 2

Dungeon/CombatBlock
└── StatRow × 4   (AC, Speed, Melee, Range)

Dungeon/EquipmentList
└── Text × N      (slot label + item name pairs)

Dungeon/MessageLog
└── MessageLine × N

Dungeon/CharacterHeader
├── Text           (name / class / level)
└── StatusBadge × N

Bloomberg/QuoteHeader
├── PriceTick
└── SectionLabel

Bloomberg/KeyStatistics
├── SectionLabel
└── Text × N      (key/value pairs)

Bloomberg/OrderBook
├── SectionLabel
└── Text rows     (bid / ask levels)

Bloomberg/NewsHeadlines
├── SectionLabel
└── Text × N      (headline rows)

Bloomberg/MarketRow
├── PriceTick
└── Sparkline

Bloomberg/MiniChart
├── SectionLabel
└── Sparkline

Htop/CpuGrid
└── CpuBar × N    (one per logical core)

Htop/MemoryPanel
└── MemBar × 2    (RAM + swap)

Htop/TaskSummary
└── Text           (tasks / threads / load stats line)

Htop/ProcessTable
└── ProcessRow × N
```

**Organism trees**
```
Angband/CharacterSheet
├── Dungeon/CharacterHeader
├── Dungeon/AttributeBlock
├── Dungeon/VitalsBlock
├── Dungeon/CombatBlock
└── Dungeon/EquipmentList

Angband/TownLevel & AngbandLevel
├── ROT.js map tiles  (procedural dungeon/town grid)
├── Dungeon/CharacterHeader  (status bar)
└── Dungeon/MessageLog

Angband/InventoryScreen
├── Dungeon/EquipmentList
├── Dungeon/MessageLog
└── Dungeon/CharacterHeader

Angband/StoreScreen
├── Text × N             (store item rows)
├── Dungeon/MessageLog
└── Dungeon/CharacterHeader

Bloomberg/BloombergEQS
├── Bloomberg/QuoteHeader
├── Bloomberg/KeyStatistics
├── Bloomberg/OrderBook
└── Bloomberg/MiniChart

Bloomberg/BloombergWMQ
├── Bloomberg/FunctionKeyBar
├── Bloomberg/SectionLabel
└── Bloomberg/MarketRow × N

Bloomberg/BloombergGP
├── Bloomberg/QuoteHeader
└── Bloomberg/MiniChart  (full-screen price chart)

Htop/SystemMonitor
├── Htop/CpuGrid
├── Htop/MemoryPanel
├── Htop/TaskSummary
└── Htop/ProcessTable

Shell/TmuxLayout
├── Box × N    (pane borders)
└── Text × N   (pane content — simulated shell output)
```

---

## 9. SDF2D

| | |
|---|---|
| Framework | `@storybook/html-webpack5`; preview + meta-preview: WebGL2 fragment shader |
| Storybook | `:6014` |
| Relay | `:3341` |
| Story paths | `src/sdf2d/atoms/`, `src/sdf2d/molecules/`, `src/sdf2d/organisms/` |
| Shared libs | `primitives.js` (GLSL library), `canvas.js` (WebGL2 helper), `story.js` (`sdfStory`, `col`, `displayArgType`) |
| Coord system | `p = (fragCoord − 0.5·res) / min(res.x, res.y)` → square-normalised `[-0.5, 0.5]` |

**Hierarchy**

```
Atoms
  Shapes       — Circle, Box, Capsule, Triangle, Pentagon, Hexagon,
                 Octagon, Star, Arc, Pie, Ring, Cross, Heart, Moon,
                 Vesica, Egg  (all with field/fill/outline display control)

Molecules
  CSG          — Union, Intersect, Subtract,
                 SmoothUnion, SmoothIntersect, SmoothSubtract
  Domain       — Flower, Starburst, Shells
  Operations   — Lens, Crescent, SmoothScoop, SmoothIntersect,
                 WireframeTriangle, RingLattice

Organisms
  Compositions — SmoothBlob, Dumbbell, Wings, Tile, Kaleidoscope
  Fractals     — RoadNetwork, KochSnowflake, Sierpinski,
                 SierpinskiCarpet, DragonCurve, LevyCCurve, FractalTree
```

**Molecule trees**
```
CSG/Union           → Circle  opUnion      Box
CSG/Intersect       → Circle  opIntersect  Box
CSG/Subtract        → Circle  opSubtract   Box
CSG/SmoothUnion     → Circle  opSmoothUnion(k)      Circle
CSG/SmoothIntersect → Circle  opSmoothIntersect(k)  Circle
CSG/SmoothSubtract  → Circle  opSmoothSubtract(k)   Circle

Domain/Flower    → RoundedBox  +  opRepeatPolar(N)
Domain/Starburst → Capsule     +  opRepeatPolar(N)
Domain/Shells    → Circle      +  abs(d)−t  (onion layers)

Operations/Lens            → Circle  opIntersect       Circle
Operations/Crescent        → Circle  opSubtract        Circle
Operations/SmoothScoop     → Circle  opSmoothSubtract  Circle
Operations/SmoothIntersect → Box     opSmoothIntersect Circle
Operations/WireframeTriangle → Capsule × 3  (one per edge, opUnion)
Operations/RingLattice     → Ring  +  opRepeat
```

**Organism trees**
```
Compositions/SmoothBlob
└── Circle × 4  via opSmoothUnion(k)

Compositions/Dumbbell
├── Capsule    (bar)
└── Circle × 2 (heads)  via opUnion

Compositions/Wings
├── Capsule × 2  (wings, opMirrorX + opRotate)
├── Circle × 2   (wingtips)
└── Capsule       (body)  via opUnion

Compositions/Tile
├── Ring  opUnion  Cross  (motif)
└── opRepeat + opRotate   (tiling)

Compositions/Kaleidoscope
├── Capsule group A  (opMirror + opRepeatPolar)
├── Capsule group B  (opRepeatPolar)
├── opSmoothUnion    (merge groups)
└── opSubtract       (punch centre hole)

Fractals/RoadNetwork
├── Capsule × N  (road segments — seeded LCG branching)
└── Circle  × N  (junction nodes — slightly wider than road)

Fractals/KochSnowflake
└── Capsule × 3×4^N  (JS subdivision of 3 triangle edges, opUnion)

Fractals/Sierpinski
└── Triangle × 1  (GLSL IFS loop — nearest-vertex fold, scaled SDF)

Fractals/SierpinskiCarpet
└── Box × 1  (GLSL mod-based IFS loop — centre-third subtraction)

Fractals/DragonCurve
└── Capsule × 2^N  (JS turn-sequence IFS, opUnion)

Fractals/LevyCCurve
└── Capsule × 2^N  (JS recursive ±45° subdivision, opUnion)

Fractals/FractalTree
└── Capsule × (2^depth − 1)  (JS binary branching, opUnion)
```

---

## Observations

- **HTML** is the only setup without organisms — it is a minimal proof-of-concept and the hierarchy stops at molecules.
- **ThreeJS-2D/3D** and **BanterVR-3D** have no organisms yet; molecules compose atoms but there is no full-scene organism level.
- **Audio** has the cleanest strict atomic hierarchy: Note → Chord → Progression maps directly to atom → molecule → organism.
- **SDF2D Fractals** organisms compose directly from atoms (GLSL primitives) using advanced domain operations, bypassing the molecule layer. The molecule layer in SDF2D is correctly reserved for *operations and domain techniques* rather than scene compositions.
- **OpenBrush/Village** is the most complete organism: it consumes two distinct molecule families (Compositions-style shapes and Structures) in a single seeded scene.
