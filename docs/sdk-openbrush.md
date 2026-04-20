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
brush.type=BrushName              Set active brush
brush.size=0.5                    Set brush size (0-1)
brush.color.r=1&brush.color.g=0&brush.color.b=0   Set RGB color (0-1)
brush.color.h=0.5&brush.color.s=1&brush.color.v=1 Set HSV color
```

### Movement & Drawing

```
brush.move.to.x=0&brush.move.to.y=1&brush.move.to.z=2   Move brush to position
brush.turn.y=45                   Rotate brush on Y axis
brush.draw=1                      Start drawing (1) / stop drawing (0)
```

### Paths & Shapes (JSON POST)

```
brush.path=[{"x":0,"y":0,"z":0},{"x":1,"y":0,"z":0}]   Draw a path
```

### Text & SVG

```
brush.text=Hello                  Draw text at current position
brush.svg=<svg>...</svg>          Draw SVG content
```

### Camera

```
camera.move.to.x=0&camera.move.to.y=2&camera.move.to.z=5
camera.turn.y=90
```

### Export

```
export.glb                        Export scene as GLB
export.svg                        Export as SVG
```

---

## Story Data Format (used in this project)

Stories export an array of command objects. The meta-preview sends them as HTTP requests sequentially.

```javascript
// Atom: a single stroke
export const story = {
  commands: [
    'sketches.new',
    'brush.color.r=1&brush.color.g=0&brush.color.b=0',
    'brush.size=0.3',
    'brush.move.to.x=0&brush.move.to.y=0&brush.move.to.z=0',
    'brush.draw=1',
    'brush.move.to.x=1&brush.move.to.y=0&brush.move.to.z=0',
    'brush.draw=0',
  ]
};

// Molecule: multiple strokes composing a shape
export const story = {
  commands: [
    'sketches.new',
    // stroke 1
    'brush.color.r=0&brush.color.g=0.5&brush.color.b=1',
    'brush.move.to.x=-1&brush.move.to.y=0&brush.move.to.z=0',
    'brush.draw=1',
    'brush.move.to.x=1&brush.move.to.y=0&brush.move.to.z=0',
    'brush.draw=0',
    // stroke 2
    'brush.move.to.x=0&brush.move.to.y=-1&brush.move.to.z=0',
    'brush.draw=1',
    'brush.move.to.x=0&brush.move.to.y=1&brush.move.to.z=0',
    'brush.draw=0',
  ]
};
```

The meta-preview always sends `sketches.new` first (clear canvas), then the story's command sequence. A host input field lets you point the meta-preview at any machine running Open Brush on the network.
