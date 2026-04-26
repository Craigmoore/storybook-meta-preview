// Shared drawing primitives for Angband-style dungeon layouts.
// All functions take absolute grid coordinates (x, y).

// ── Palette ───────────────────────────────────────────────────────────────────

export const C = {
  B:       '#000000',
  FG:      '#aaaaaa',
  DIM:     '#555555',
  WHITE:   '#ffffff',
  GOLD:    '#ffff00',
  GREEN:   '#44ff44',
  RED:     '#ff5555',
  BLUE:    '#4488ff',
  CYAN:    '#44cccc',
  MAGENTA: '#ff44ff',
  HL:      '#ffff88',
  SEP:     '#333333',
  WALL:    '#555555',
  FLOOR_L: '#776644',
  FLOOR_D: '#2d2d2d',
  PLAYER:  '#ffff88',
  STAIR:   '#ffffff',
};

// ── Tile / entity catalogue ───────────────────────────────────────────────────

export const TILES = {
  wall:       { ch: '#', fg: C.WALL,    label: 'Wall' },
  floor_lit:  { ch: '.', fg: C.FLOOR_L, label: 'Floor (lit)' },
  floor_dark: { ch: '.', fg: C.FLOOR_D, label: 'Floor (dark)' },
  door:       { ch: '+', fg: '#aa6633', label: 'Door' },
  stair_up:   { ch: '<', fg: C.STAIR,   label: 'Stairs Up' },
  stair_down: { ch: '>', fg: C.STAIR,   label: 'Stairs Down' },
  player:     { ch: '@', fg: C.PLAYER,  label: 'Player' },
  orc:        { ch: 'o', fg: C.GREEN,   label: 'Orc' },
  kobold:     { ch: 'k', fg: '#44aa44', label: 'Kobold' },
  rat:        { ch: 'r', fg: '#aa7744', label: 'Rat' },
  skeleton:   { ch: 's', fg: '#aaaaaa', label: 'Skeleton' },
  bat:        { ch: 'b', fg: '#5555ff', label: 'Bat' },
  troll:      { ch: 'T', fg: '#00cc00', label: 'Troll' },
  dragon:     { ch: 'D', fg: C.RED,     label: 'Dragon' },
  vampire:    { ch: 'V', fg: C.MAGENTA, label: 'Vampire' },
  potion:     { ch: '!', fg: C.BLUE,    label: 'Potion' },
  scroll:     { ch: '?', fg: C.WHITE,   label: 'Scroll' },
  gold:       { ch: '$', fg: C.GOLD,    label: 'Gold' },
  weapon:     { ch: ')', fg: '#ffaa44', label: 'Weapon' },
  armour:     { ch: '[', fg: '#888888', label: 'Armour' },
  food:       { ch: ',', fg: '#886644', label: 'Food' },
};

// ── Low-level helpers ─────────────────────────────────────────────────────────

// Write coloured segments to a row, clipped at maxX
export function seg(grid, gx, gy, maxX, parts) {
  let cx = gx;
  for (const [t, fg, bg = C.B] of parts) {
    for (let i = 0; i < t.length && cx < maxX; i++, cx++) {
      grid.put(cx, gy, t[i], fg, bg);
    }
    if (cx >= maxX) break;
  }
}

// Horizontal separator line
export function drawSep(grid, x, y, w) {
  grid.fill(x, y, w, 1, '─', C.SEP, C.B);
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

// Single "Label : value" stat row
export function drawStatRow(grid, x, y, label, value, labelFg = C.FG, valueFg = C.HL) {
  seg(grid, x, y, grid.cols, [
    ['  ', C.B], [label, labelFg], [' : ', C.DIM], [value, valueFg],
  ]);
}

// Single status-effect badge (coloured word)
export function drawStatusBadge(grid, x, y, text, fg = '#ffcc44') {
  grid.text(x, y, text, fg, C.B);
}

// Single message line, clipped to width w
export function drawMessageLine(grid, x, y, w, text, fg = C.FG) {
  grid.text(x, y, text.substring(0, w), fg, C.B);
}

// ── Molecules ─────────────────────────────────────────────────────────────────

// Six D&D attributes in a 2-column layout — 3 rows tall
// attrs = { str, int, wis, dex, con, chr }
export function drawAttributeBlock(grid, x, y, { str, int: INT, wis, dex, con, chr }) {
  const f = (n) => String(n).padStart(2);
  const mx = grid.cols;
  seg(grid, x, y,   mx, [['  STR : ', C.FG], [f(str), C.HL], ['    ', C.B], ['INT : ', C.FG], [f(INT), C.HL]]);
  seg(grid, x, y+1, mx, [['  DEX : ', C.FG], [f(dex), C.HL], ['    ', C.B], ['CON : ', C.FG], [f(con), C.HL]]);
  seg(grid, x, y+2, mx, [['  WIS : ', C.FG], [f(wis), C.HL], ['    ', C.B], ['CHR : ', C.FG], [f(chr), C.HL]]);
}

// HP and SP — 2 rows tall
export function drawVitalsBlock(grid, x, y, hp, hpMax, sp, spMax) {
  const hpFg = hp / hpMax < 0.25 ? C.RED : hp / hpMax < 0.5 ? '#ffaa44' : C.GREEN;
  const mx   = grid.cols;
  seg(grid, x, y,   mx, [['  HP  : ', C.FG], [String(hp).padStart(4),  hpFg], [' / ', C.DIM], [String(hpMax), C.WHITE]]);
  seg(grid, x, y+1, mx, [['  SP  : ', C.FG], [String(sp).padStart(4),  C.HL], [' / ', C.DIM], [String(spMax), C.FG]]);
}

// Melee / shoot / AC — 3 rows tall
// combat = { melee, shoot, blows, shots, ac }
export function drawCombatBlock(grid, x, y, { melee, shoot, blows, shots, ac }) {
  const mx = grid.cols;
  seg(grid, x, y,   mx, [['  Melee  ', C.FG], [melee,        C.HL], ['   Blows : ', C.FG], [String(blows), C.HL]]);
  seg(grid, x, y+1, mx, [['  Shoot  ', C.FG], [shoot,        C.HL], ['   Shots : ', C.FG], [String(shots), C.HL]]);
  seg(grid, x, y+2, mx, [['  AC     : ', C.FG], [String(ac), C.HL]]);
}

// Equipped item list — 1 header + items.length rows
// items = [{ slot, name }]
export function drawEquipmentList(grid, x, y, items) {
  const mx = grid.cols;
  seg(grid, x, y, mx, [['  Equipped:', C.WHITE]]);
  for (let i = 0; i < items.length; i++) {
    seg(grid, x, y + 1 + i, mx, [['   ', C.B], [items[i].slot + ') ', C.DIM], [items[i].name, C.FG]]);
  }
}

// Recent message history — messages[0] is most recent
// messages = [{ text, current }]
export function drawMessageLog(grid, x, y, w, messages) {
  for (let i = 0; i < messages.length; i++) {
    const fg = messages[i].current ? '#ffff88' : C.DIM;
    grid.text(x, y + i, messages[i].text.substring(0, w), fg, C.B);
  }
}

// Character name / race / class / level / exp / gold — 6 rows (row+3 is blank)
// char = { name, race, cls, title, level, exp, expNext, gold }
export function drawCharacterHeader(grid, x, y, { name, race, cls, title, level, exp, expNext, gold }) {
  const mx = grid.cols;
  seg(grid, x, y,   mx, [['  ', C.B], [name, C.WHITE]]);
  seg(grid, x, y+1, mx, [['  ', C.B], [race + ' ' + cls, C.FG]]);
  seg(grid, x, y+2, mx, [['  ', C.B], [title, C.DIM]]);
  // y+3 intentionally blank (breathing room between title and stats)
  seg(grid, x, y+4, mx, [
    ['  Level  ', C.FG], [String(level).padEnd(5), C.HL],
    ['Exp  ', C.FG], [String(exp), C.HL], ['/', C.DIM], [String(expNext), C.DIM],
  ]);
  seg(grid, x, y+5, mx, [['  Gold   ', C.FG], [String(gold), C.GOLD], [' gp', C.DIM]]);
}

// ── Organism: full character panel ────────────────────────────────────────────

// char shape:
// { name, race, cls, title, level, exp, expNext, gold,
//   attrs: { str, int, wis, dex, con, chr },
//   combat: { melee, shoot, blows, shots, ac },
//   hp, hpMax, sp, spMax,
//   speed, depthStr,
//   equipment: [{ slot, name }],
//   statusEffects: [{ text, fg }] }
export function drawCharacterPanel(grid, x, y, w, char) {
  let r = y;
  const sp = () => { drawSep(grid, x, r, w); r++; };
  const mx = grid.cols;

  drawCharacterHeader(grid, x, r, char);  r += 6;
  r++;  // blank below gold
  sp();
  drawAttributeBlock(grid, x, r, char.attrs);   r += 3;
  sp();
  drawCombatBlock(grid, x, r, char.combat);     r += 3;
  sp();
  drawVitalsBlock(grid, x, r, char.hp, char.hpMax, char.sp, char.spMax);  r += 2;
  sp();
  seg(grid, x, r++, mx, [['  Speed : ', C.FG], [char.speed,    C.HL]]);
  seg(grid, x, r++, mx, [['  Depth : ', C.FG], [char.depthStr, C.HL]]);
  sp();
  drawEquipmentList(grid, x, r, char.equipment);  r += char.equipment.length + 1;
  sp();
  let bx = x + 2;
  for (const { text, fg } of (char.statusEffects ?? [])) {
    drawStatusBadge(grid, bx, r, text, fg);
    bx += text.length + 2;
  }
}
