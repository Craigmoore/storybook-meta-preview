import { tuiStory } from '../story.js';

export default { title: 'TUI/Atoms' };

const DEFAULT_COLS = 170;
const DEFAULT_ROWS = 47;

// ── Box ───────────────────────────────────────────────────────────────────────
// A bordered box drawn with box-drawing characters at a given position/size.

function drawBox(grid, x, y, w, h, fg, bg, style = 'single') {
  const s = style === 'double'
    ? { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' }
    : { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' };

  // Fill interior
  grid.fill(x + 1, y + 1, w - 2, h - 2, ' ', fg, bg);

  // Horizontal edges
  for (let dx = 1; dx < w - 1; dx++) {
    grid.put(x + dx, y,         s.h, fg, bg);
    grid.put(x + dx, y + h - 1, s.h, fg, bg);
  }
  // Vertical edges
  for (let dy = 1; dy < h - 1; dy++) {
    grid.put(x,         y + dy, s.v, fg, bg);
    grid.put(x + w - 1, y + dy, s.v, fg, bg);
  }
  // Corners
  grid.put(x,         y,         s.tl, fg, bg);
  grid.put(x + w - 1, y,         s.tr, fg, bg);
  grid.put(x,         y + h - 1, s.bl, fg, bg);
  grid.put(x + w - 1, y + h - 1, s.br, fg, bg);
}

export const Box = {
  args:     { cols: DEFAULT_COLS, rows: DEFAULT_ROWS, width: 30, height: 10, borderColor: '#888888', fillColor: '#111111', style: 'single' },
  argTypes: {
    cols:        { control: 'number' },
    rows:        { control: 'number' },
    width:       { control: { type: 'range', min: 4, max: 60, step: 1 } },
    height:      { control: { type: 'range', min: 3, max: 30, step: 1 } },
    borderColor: { control: 'color' },
    fillColor:   { control: 'color' },
    style:       { control: { type: 'select', options: ['single', 'double'] } },
  },
  render: ({ cols, rows, width, height, borderColor, fillColor, style }) =>
    tuiStory({ cols, rows }, (grid) => {
      const x = Math.floor((cols - width) / 2);
      const y = Math.floor((rows - height) / 2);
      drawBox(grid, x, y, width, height, borderColor, fillColor, style);
    }),
};

// ── Text ──────────────────────────────────────────────────────────────────────

export const Text = {
  args:     { cols: DEFAULT_COLS, rows: DEFAULT_ROWS, content: 'Hello, TUI world!', fg: '#00ff88', bg: '#000000' },
  argTypes: {
    cols:    { control: 'number' },
    rows:    { control: 'number' },
    content: { control: 'text' },
    fg:      { control: 'color' },
    bg:      { control: 'color' },
  },
  render: ({ cols, rows, content, fg, bg }) =>
    tuiStory({ cols, rows }, (grid) => {
      const x = Math.floor((cols - content.length) / 2);
      const y = Math.floor(rows / 2);
      grid.text(x, y, content, fg, bg);
    }),
};

// ── ProgressBar ───────────────────────────────────────────────────────────────

export const ProgressBar = {
  args:     { cols: DEFAULT_COLS, rows: DEFAULT_ROWS, progress: 65, barWidth: 40, filledColor: '#00cc55', emptyColor: '#222222', label: true },
  argTypes: {
    cols:        { control: 'number' },
    rows:        { control: 'number' },
    progress:    { control: { type: 'range', min: 0, max: 100, step: 1 } },
    barWidth:    { control: { type: 'range', min: 10, max: 70, step: 1 } },
    filledColor: { control: 'color' },
    emptyColor:  { control: 'color' },
    label:       { control: 'boolean' },
  },
  render: ({ cols, rows, progress, barWidth, filledColor, emptyColor, label }) =>
    tuiStory({ cols, rows }, (grid) => {
      const x       = Math.floor((cols - barWidth) / 2);
      const y       = Math.floor(rows / 2);
      const filled  = Math.round((progress / 100) * barWidth);

      grid.fill(x,          y, filled,          1, '█', filledColor, '#000000');
      grid.fill(x + filled, y, barWidth - filled, 1, '░', emptyColor,  '#000000');

      if (label) {
        const pct = `${progress}%`;
        grid.text(Math.floor((cols - pct.length) / 2), y + 2, pct, '#aaaaaa', '#000000');
      }
    }),
};

// ── ColorSwatch ───────────────────────────────────────────────────────────────

const PALETTE = [
  '#ff4444', '#ff8800', '#ffcc00', '#88ff00',
  '#00ff88', '#00ccff', '#4488ff', '#cc44ff',
  '#ff44cc', '#ffffff', '#aaaaaa', '#555555',
];

export const ColorSwatch = {
  args:     { cols: DEFAULT_COLS, rows: DEFAULT_ROWS },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },
  render: ({ cols, rows }) =>
    tuiStory({ cols, rows }, (grid) => {
      const swatchW = 8;
      const swatchH = 3;
      const perRow  = 4;
      const totalW  = perRow * swatchW;
      const totalH  = Math.ceil(PALETTE.length / perRow) * swatchH;
      const startX  = Math.floor((cols - totalW) / 2);
      const startY  = Math.floor((rows - totalH) / 2);

      PALETTE.forEach((color, i) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        const x   = startX + col * swatchW;
        const y   = startY + row * swatchH;
        grid.fill(x, y, swatchW, swatchH, ' ', '#000000', color);
        // Hex label centred in the swatch on the middle row
        const label = color.replace('#', '');
        const lx    = x + Math.floor((swatchW - label.length) / 2);
        grid.text(lx, y + 1, label, '#000000', color);
      });
    }),
};

// ── Border ────────────────────────────────────────────────────────────────────

export const Border = {
  args:     { cols: DEFAULT_COLS, rows: DEFAULT_ROWS, borderColor: '#444466', fillColor: '#000000', style: 'double' },
  argTypes: {
    cols:        { control: 'number' },
    rows:        { control: 'number' },
    borderColor: { control: 'color' },
    fillColor:   { control: 'color' },
    style:       { control: { type: 'select', options: ['single', 'double'] } },
  },
  render: ({ cols, rows, borderColor, fillColor, style }) =>
    tuiStory({ cols, rows }, (grid) => {
      grid.fill(0, 0, cols, rows, ' ', '#ffffff', fillColor);
      drawBox(grid, 0, 0, cols, rows, borderColor, fillColor, style);
    }),
};
