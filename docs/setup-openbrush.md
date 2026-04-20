# Setup: openbrush

## Purpose
Demonstrates Storybook for generative art in Open Brush. Stories define sequences of HTTP API commands. The meta-preview sends them to a running Open Brush instance on the network, clearing the canvas before each story.

## Ports
- Storybook: 6010
- Relay: 3337

## Run
```bash
yarn dev:openbrush
```

## Prerequisites
- Open Brush running in **2D mode** with the HTTP API enabled (port 40074)
- If controlling remotely: launch Open Brush with `EnableApiRemoteCalls` and `EnableApiCorsHeaders` flags

## Story Hierarchy

| Level | Concept | Example |
|---|---|---|
| Atom | Single stroke or primitive shape | A coloured line |
| Molecule | Composition of strokes | A cross, a spiral |
| Organism | Full scene / artwork | A complete composition |

## Story Format
Stories export an array of API command strings. The meta-preview sends `sketches.new` first (clear canvas), then the story commands in sequence.

```javascript
// Atom: a single coloured stroke
export default { title: 'OpenBrush/Atoms/RedLine' };
export const Default = {
  story: {
    commands: [
      'brush.color.r=1&brush.color.g=0&brush.color.b=0',
      'brush.size=0.3',
      'brush.move.to.x=-1&brush.move.to.y=0&brush.move.to.z=0',
      'brush.draw=1',
      'brush.move.to.x=1&brush.move.to.y=0&brush.move.to.z=0',
      'brush.draw=0',
    ]
  }
};

// Molecule: a cross made of two strokes
export default { title: 'OpenBrush/Molecules/Cross' };
export const Default = {
  story: {
    commands: [
      'brush.color.r=0&brush.color.g=0.5&brush.color.b=1',
      'brush.size=0.2',
      // horizontal
      'brush.move.to.x=-1&brush.move.to.y=0&brush.move.to.z=0',
      'brush.draw=1',
      'brush.move.to.x=1&brush.move.to.y=0&brush.move.to.z=0',
      'brush.draw=0',
      // vertical
      'brush.move.to.x=0&brush.move.to.y=-1&brush.move.to.z=0',
      'brush.draw=1',
      'brush.move.to.x=0&brush.move.to.y=1&brush.move.to.z=0',
      'brush.draw=0',
    ]
  }
};
```

## Meta-Preview Behaviour
- Shows an input for Open Brush host address (default: `localhost`)
- Shows a "Send to Open Brush" button
- On story update OR button click:
  1. Sends `sketches.new` (clears canvas)
  2. Sends each command in sequence as `GET http://[host]:40074/api/v1?[command]`

## Key APIs
See `docs/sdk-openbrush.md` for the full command reference.
