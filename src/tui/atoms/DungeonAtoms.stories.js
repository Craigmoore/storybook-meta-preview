import { tuiStory } from '../story.js';
import { C, TILES, drawStatRow, drawStatusBadge, drawMessageLine } from '../dungeonComponents.js';

export default { title: 'TUI/Atoms/Dungeon' };

// ── Tile Reference ────────────────────────────────────────────────────────────

export const TileReference = {
  args:     { cols: 55, rows: 20 },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },
  render: ({ cols, rows }) => tuiStory({ cols, rows }, (grid) => {
    const x = 2;

    const hdr = (y, label) => {
      grid.fill(x, y, cols - x, 1, '─', C.SEP, C.B);
      grid.text(x + 1, y, ' ' + label + ' ', C.DIM, C.B);
    };

    const row = (y, items) => {
      let cx = x;
      for (const [key, pad] of items) {
        const { ch, fg, label } = TILES[key];
        grid.put(cx, y, ch, fg, C.B);
        grid.text(cx + 2, y, label.padEnd(pad), C.FG, C.B);
        cx += 2 + pad;
      }
    };

    let r = 1;
    hdr(r++, 'Terrain');
    row(r++, [['wall', 16],      ['floor_lit',  14]]);
    row(r++, [['floor_dark', 16],['door',       14]]);
    row(r++, [['stair_up', 16],  ['stair_down', 14]]);
    r++;
    hdr(r++, 'Creatures');
    row(r++, [['player', 12], ['orc',     12], ['kobold',  12]]);
    row(r++, [['rat',    12], ['skeleton',12], ['bat',     12]]);
    row(r++, [['troll',  12], ['dragon',  12], ['vampire', 12]]);
    r++;
    hdr(r++, 'Items');
    row(r++, [['potion', 12], ['scroll', 12], ['gold',   12]]);
    row(r++, [['weapon', 12], ['armour', 12], ['food',   12]]);
  }),
};

// ── Stat Row ──────────────────────────────────────────────────────────────────

export const StatRow = {
  args: {
    cols: 55, rows: 10,
    label: 'Strength', value: '18/50',
    labelFg: C.FG, valueFg: C.HL,
  },
  argTypes: {
    cols:    { control: 'number' },
    rows:    { control: 'number' },
    label:   { control: 'text' },
    value:   { control: 'text' },
    labelFg: { control: 'color' },
    valueFg: { control: 'color' },
  },
  render: ({ cols, rows, label, value, labelFg, valueFg }) =>
    tuiStory({ cols, rows }, (grid) => {
      drawStatRow(grid, 2, Math.floor(rows / 2), label, value, labelFg, valueFg);
    }),
};

// ── Status Badge ──────────────────────────────────────────────────────────────

export const StatusBadge = {
  args: {
    cols: 55, rows: 8,
    hungry: true, weak: false, poisoned: true,
    blind: false, confused: false, afraid: false,
  },
  argTypes: {
    cols:     { control: 'number' },
    rows:     { control: 'number' },
    hungry:   { control: 'boolean' },
    weak:     { control: 'boolean' },
    poisoned: { control: 'boolean' },
    blind:    { control: 'boolean' },
    confused: { control: 'boolean' },
    afraid:   { control: 'boolean' },
  },
  render: ({ cols, rows, hungry, weak, poisoned, blind, confused, afraid }) =>
    tuiStory({ cols, rows }, (grid) => {
      const badges = [
        [hungry,   'Hungry',   '#ffcc44'],
        [weak,     'Weak',     '#ff8844'],
        [poisoned, 'Poisoned', '#44ff88'],
        [blind,    'Blind',    '#aaaaaa'],
        [confused, 'Confused', '#aa44ff'],
        [afraid,   'Afraid',   '#ff4444'],
      ].filter(b => b[0]);

      const y = Math.floor(rows / 2);
      let x = 2;
      for (const [, text, fg] of badges) {
        drawStatusBadge(grid, x, y, text, fg);
        x += text.length + 2;
      }
    }),
};

// ── Message Line ──────────────────────────────────────────────────────────────

export const MessageLine = {
  args: {
    cols: 90, rows: 8,
    text: 'The Cave Spider bites you.  You feel poison running through your veins.',
    severity: 'current',
  },
  argTypes: {
    cols:     { control: 'number' },
    rows:     { control: 'number' },
    text:     { control: 'text' },
    severity: { control: { type: 'select', options: ['current', 'recent', 'old'] } },
  },
  render: ({ cols, rows, text, severity }) =>
    tuiStory({ cols, rows }, (grid) => {
      const fg = severity === 'current' ? '#ffff88'
               : severity === 'recent'  ? C.FG
               :                          C.DIM;
      drawMessageLine(grid, 1, Math.floor(rows / 2), cols - 2, text, fg);
    }),
};
