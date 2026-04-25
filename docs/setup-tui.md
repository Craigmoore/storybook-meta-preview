# Setup: tui

## Purpose
Demonstrates Storybook for Text User Interface (TUI) layouts using grid-based ASCII rendering. Stories define character grids with foreground and background colours; each of the three rendering targets interprets that grid data independently.

The key property: stories are pure data — a grid of `{ char, fg, bg }` cells. No renderer is baked into the story.

## Ports
- Storybook: 6013
- Relay: 3340

## Run
```bash
yarn dev:tui
```

## Dependencies
- [`rot-js`](https://ondras.github.io/rot.js/hp/) — roguelike toolkit; used for `Display` (Storybook preview canvas) and map/dungeon generators in stories
- [`xterm`](https://xtermjs.org/) — browser terminal emulator for the browser meta-preview
- `@xterm/addon-fit` — xterm.js FitAddon for adaptive terminal sizing

---

## Three renderers, one story format

| Layer | Renderer | Details |
|---|---|---|
| Storybook preview | ROT.js `Display` | Canvas rendered in the preview iframe |
| Browser meta-preview | xterm.js | `meta-preview-tui.html` — full in-browser terminal emulator |
| Terminal meta-preview | Native ANSI | `src/tui/terminal-preview.js` — Node.js script, writes to stdout |

The ANSI conversion layer is shared between the browser and terminal meta-previews. xterm.js and an actual terminal receive identical escape sequences.

---

## Story format

Stories use the `tuiStory()` helper from `src/tui/story.js`. The render function receives a `Grid` instance sized to the current `cols`/`rows` args.

```js
import { tuiStory } from '../story.js';

export default { title: 'TUI/Atoms/Box' };

export const Default = {
  args:     { cols: 170, rows: 47 },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },

  render: ({ cols, rows }) => tuiStory({ cols, rows }, (grid) => {
    // Draw a border
    for (let x = 0; x < cols; x++) {
      grid.put(x, 0,      '─', '#888888', '#000000');
      grid.put(x, rows-1, '─', '#888888', '#000000');
    }
    for (let y = 0; y < rows; y++) {
      grid.put(0,      y, '│', '#888888', '#000000');
      grid.put(cols-1, y, '│', '#888888', '#000000');
    }
    grid.put(0,      0,      '┌', '#888888', '#000000');
    grid.put(cols-1, 0,      '┐', '#888888', '#000000');
    grid.put(0,      rows-1, '└', '#888888', '#000000');
    grid.put(cols-1, rows-1, '┘', '#888888', '#000000');
  }),
};
```

`tuiStory()`:
1. Creates a grid of `cols × rows` cells, all initialised to `{ char: ' ', fg: '#ffffff', bg: '#000000' }`
2. Calls the render function with the grid
3. Passes the grid to ROT.js `Display` for the Storybook preview canvas
4. Stashes the serialised grid on `window.__metaPreviewTUI` for the relay to broadcast

---

## Grid API

```js
// Place a single character
grid.put(col, row, char, fg, bg)

// Fill a rectangle with one character
grid.fill(col, row, width, height, char, fg, bg)

// Write a string horizontally
grid.text(col, row, str, fg, bg)

// Clear all cells to default (space, white on black)
grid.clear()

// Dimensions
grid.cols   // number of columns
grid.rows   // number of rows
```

### Using ROT.js map generators

ROT.js generators integrate naturally with the grid builder:

```js
import * as ROT from 'rot-js';

render: ({ cols, rows }) => tuiStory({ cols, rows }, (grid) => {
  const map = new ROT.Map.Cellular(cols, rows);
  map.randomize(0.5);
  for (let i = 0; i < 4; i++) map.create();
  map.create((col, row, value) => {
    grid.put(col, row, value ? '#' : '.', '#666666', '#000000');
  });
}),
```

---

## Adaptive dimensions

`cols` and `rows` are standard Storybook args with a default of **170 × 47** (confirmed test dimensions). Stories lay out relative to `grid.cols` / `grid.rows`, so they adapt automatically when the args change.

Each meta-preview detects its actual dimensions and signals them back to the relay so the story re-renders at the correct size:

- **Browser meta-preview**: xterm.js FitAddon measures the container → derives cols/rows → sends `{ type: 'resize', cols, rows }` to the relay
- **Terminal meta-preview**: reads `process.stdout.columns` / `process.stdout.rows` on connect and on `SIGWINCH` (terminal resize signal)

The relay forwards resize messages to Storybook as arg updates, triggering a fresh render at the correct dimensions.

---

## Story hierarchy

| Level | Concept | Planned stories |
|---|---|---|
| Atom | Single TUI primitive | Box, Text, ProgressBar, ColorSwatch, Border |
| Molecule | Composed panel component | StatusBar, MenuItem, Dialog, List, Scrollback |
| Organism | Full screen layout | GameHUD, SplitPane, DungeonLevel, OverworldMap |

The `OverworldMap` organism uses ROT.js cellular automata or BSP map generation — the same map data used in the ThreeJS 3D extended setup — providing a direct comparison between ASCII and 3D renderings of the same underlying map.

---

## Storybook preview (ROT.js)

`src/tui/story.js` creates a ROT.js `Display` with `forceSquareRatio: true` so box-drawing characters align correctly. The display canvas is returned as the Storybook preview element.

```js
const display = new ROT.Display({
  width:           cols,
  height:          rows,
  fontSize:        14,
  fontFamily:      'monospace',
  forceSquareRatio: true,
  bg:              '#000000',
  fg:              '#ffffff',
});

// Draw each cell
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const cell = grid.get(x, y);
    display.draw(x, y, cell.char, cell.fg, cell.bg);
  }
}
```

---

## Browser meta-preview (xterm.js)

`public/meta-preview-tui.html` embeds xterm.js and the FitAddon.

On connect:
1. FitAddon fits the terminal to the page container
2. Sends `{ type: 'resize', cols, rows }` to relay
3. Relay forwards to Storybook as arg update

On story update (grid data received):
1. Clears the terminal: `\x1b[2J\x1b[H`
2. Iterates cells, writes ANSI sequences via `gridToAnsi(grid)`
3. Resets: `\x1b[0m`

On terminal resize:
1. FitAddon re-fits
2. Sends updated cols/rows to relay as above

---

## Terminal meta-preview (Node.js)

`src/tui/terminal-preview.js` — run directly, not served as a static file.

```bash
node src/tui/terminal-preview.js
# or with explicit relay host:
RELAY_HOST=192.168.1.x node src/tui/terminal-preview.js
```

On start:
1. Reads `process.stdout.columns` / `process.stdout.rows`
2. Connects to relay WebSocket (`ws://[RELAY_HOST]:3339`)
3. Sends `{ type: 'resize', cols, rows }`
4. Hides cursor: `process.stdout.write('\x1b[?25l')`

On story update:
1. Moves cursor home: `\x1b[H`
2. Writes `gridToAnsi(grid)` to `process.stdout`
3. Resets: `\x1b[0m`

On `SIGWINCH` (terminal resize):
1. Re-reads dimensions
2. Sends updated resize message to relay

On exit (`SIGINT`, `SIGTERM`):
1. Shows cursor: `\x1b[?25h`
2. Resets terminal: `\x1b[0m`
3. Clears screen: `\x1b[2J\x1b[H`
4. Closes WebSocket

---

## ANSI conversion (shared utility)

`src/tui/ansi.js` — used by both meta-previews.

```js
// Convert a grid to an ANSI escape sequence string
export function gridToAnsi(grid) {
  let out = '\x1b[H'; // cursor home
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const { char, fg, bg } = grid.get(x, y);
      const [fr, fg_, fb] = hexToRgb(fg);
      const [br, bg_, bb] = hexToRgb(bg);
      out += `\x1b[38;2;${fr};${fg_};${fb}m`; // foreground (true colour)
      out += `\x1b[48;2;${br};${bg_};${bb}m`; // background (true colour)
      out += char;
    }
    if (y < grid.rows - 1) out += '\r\n';
  }
  out += '\x1b[0m'; // reset
  return out;
}
```

True colour (`38;2;R;G;B`) requires a terminal that supports it — all modern terminals do, including tmux with `set -g default-terminal "tmux-256color"` and `set -ga terminal-overrides ",*256col*:Tc"`.
