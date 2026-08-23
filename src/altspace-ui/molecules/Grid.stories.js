import { altspaceUiStory } from '../story.js';
import { makeGrid } from './components.js';

export default { title: 'Altspace-UI/Molecules/Grid' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });
const select = (...options)          => ({ control: { type: 'select' }, options });

// A grid of coloured Block atoms — the reusable building block behind
// BlockDrop's board and next-piece preview (Organisms/BlockDrop). Patterns
// below exist only to make the grid's configurability visible in isolation.
const PATTERNS = {
  Checkerboard: (r, c) => (r + c) % 2 === 0,
  Border:       (r, c, rows, cols) => r === 0 || c === 0 || r === rows - 1 || c === cols - 1,
  Cross:        (r, c, rows, cols) => r === Math.floor(rows / 2) || c === Math.floor(cols / 2),
  Empty:        () => false,
};

// ─── Grid ────────────────────────────────────────────────────────────────────

export const Grid = {
  args: {
    rows: 10, cols: 10, cellSize: 20, gap: 1,
    emptyColor: '#181b26', fillColor: '#22d3ee',
    pattern: 'Checkerboard',
  },
  argTypes: {
    rows:       range(2, 20, 1),
    cols:       range(2, 20, 1),
    cellSize:   range(8, 40, 2),
    gap:        range(0, 6, 1),
    emptyColor: { control: 'color' },
    fillColor:  { control: 'color' },
    pattern:    select(...Object.keys(PATTERNS)),
  },
  render: ({ rows, cols, cellSize, gap, emptyColor, fillColor, pattern }) => altspaceUiStory((scene, BS) => {
    const gridWidth  = cols * (cellSize + gap) + 40;
    const gridHeight = rows * (cellSize + gap) + 40;

    const obj   = new BS.GameObject({ name: 'Grid' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(gridWidth, gridHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';

    const isFilled = PATTERNS[pattern];
    const { el } = makeGrid(BS, {
      rows, cols, cellSize, gap,
      getColor: (r, c) => (isFilled(r, c, rows, cols) ? fillColor : emptyColor),
    });
    panel.root.AppendChild(el);
    return obj;
  }),
};
