# Open Brush API Reference

## Overview

Open Brush exposes a local HTTP API on port **40074** when running in 2D mode. Commands are sent as query parameters to `http://[host]:40074/api/v1`.

In this project, the `openbrush` setup sends story command sequences from the meta-preview to a running Open Brush instance. The canvas is cleared before each story is rendered.

**API docs:** https://docs.openbrush.app/user-guide/open-brush-api

---

## Request Format

```
http://localhost:40074/api/v1?command.parameter=value&command.parameter=value
```

Multiple commands are separated with `&`. For complex requests use HTTP POST with form-encoded bodies.

---

## Enabling Remote Access

By default Open Brush only accepts commands from localhost. To allow remote access:

- Launch with flag: `EnableApiRemoteCalls`
- For browser cross-origin: `EnableApiCorsHeaders`

---

## Command Categories

### Sketches / Canvas

```
sketches.new                      Clear canvas and start a new sketch
sketches.save                     Save current sketch
sketches.load=filename            Load a sketch file
```

### Brush

```
brush.type=BrushName              Set active brush (e.g. LightWire, SoftHighlighter)
brush.size.set=0.5                Set brush size (0-1)
color.set.rgb=1,0,0               Set RGB color (0-1, comma-separated)
color.set.html=red                Set color by CSS name or hex
color.set.hsv=0.5,1,1             Set HSV color (comma-separated)
color.add.hsv=0.05,0,0            Shift current color by HSV
```

### Movement & Drawing

```
brush.move.to=0,1,2               Move brush to absolute position (x,y,z)
brush.move=1.5                    Move forward N units (no draw)
brush.draw=2                      Draw forward N units (turtle graphics)
brush.turn.y=45                   Rotate brush on Y axis (degrees)
brush.turn.x=45                   Rotate brush on X axis
brush.home.reset                  Reset brush to home position
```

### Paths & Shapes

```
draw.path=[x1,y1,z1],[x2,y2,z2],...    Draw path at current brush position
draw.paths=[[x,y,z],[x,y,z]],[...],...  Draw multiple paths
draw.polygon=5,1.0,45                   Draw polygon (sides, radius, rotation)
```

### Scene

```
new                               Clear current sketch
```

---

## Story Data Format (used in this project)

Stories return an array of command strings. Each is sent as a separate GET request to `/api/v1?<command>`. The meta-preview always prepends `new` (clear canvas) and `brush.move.to=0,0,0` (anchor drawing to world origin).

Drawing uses `draw.path` with absolute XY coordinates (Z=0). The brush is anchored at (0,0,0) so path coordinates are world-space positions.

```javascript
// Atom: a single line stroke
export const story = {
  commands: [
    'color.set.rgb=1,0,0',
    'brush.size.set=0.3',
    'draw.path=[-1,0,0],[1,0,0]',
  ]
};

// Molecule: multiple strokes
export const story = {
  commands: [
    'color.set.rgb=0,0.5,1',
    'brush.size.set=0.02',
    'draw.path=[-1,0,0],[1,0,0]',       // horizontal line
    'draw.path=[0,-1,0],[0,1,0]',       // vertical line
  ]
};
```

Coordinates range roughly ±1.5 for shapes that fill the canvas preview. Shapes are drawn in the XY plane (Z=0), appearing as a vertical canvas in Open Brush.
