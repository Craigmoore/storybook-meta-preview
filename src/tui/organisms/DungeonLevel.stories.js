import * as ROT from 'rot-js';
import { tuiStory } from '../story.js';
import { C, drawMessageLog, drawCharacterPanel } from '../dungeonComponents.js';

export default { title: 'TUI/Organisms/Angband' };

export const AngbandLevel = {
  args:     { cols: 170, rows: 47, seed: 42, depth: 250 },
  argTypes: {
    cols:  { control: 'number' },
    rows:  { control: 'number' },
    seed:  { control: { type: 'range', min: 0, max: 999 } },
    depth: { control: { type: 'range', min: 50, max: 4950, step: 50 } },
  },
  render: ({ cols, rows, seed, depth }) => tuiStory({ cols, rows }, (grid) => {
    const msgH = 2;
    const panW = 35;
    const divC = cols - panW - 1;
    const mapX = 0;
    const mapY = msgH;
    const mapW = divC;
    const mapH = rows - msgH - 1;
    const panX = divC + 1;
    const sRow = rows - 1;

    ROT.RNG.setSeed(seed);

    // ── Dungeon generation ────────────────────────────────────────────────────

    const tiles  = new Uint8Array(mapW * mapH).fill(1);
    const digger = new ROT.Map.Digger(mapW, mapH);
    digger.create((x, y, v) => { tiles[y * mapW + x] = v; });

    const rooms = digger.getRooms();

    const lit = new Set();
    for (const room of rooms) {
      for (let ry = room.getTop(); ry <= room.getBottom(); ry++) {
        for (let rx = room.getLeft(); rx <= room.getRight(); rx++) {
          lit.add(rx + ry * mapW);
        }
      }
    }

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        if (tiles[y * mapW + x]) {
          grid.put(mapX + x, mapY + y, '#', C.WALL, C.B);
        } else {
          grid.put(mapX + x, mapY + y, '.', lit.has(x + y * mapW) ? C.FLOOR_L : C.FLOOR_D, C.B);
        }
      }
    }

    // ── Entity placement ──────────────────────────────────────────────────────

    const rs = rooms.slice();
    for (let i = rs.length - 1; i > 0; i--) {
      const j = Math.floor(ROT.RNG.getUniform() * (i + 1));
      [rs[i], rs[j]] = [rs[j], rs[i]];
    }

    function roomCell(room) {
      return [
        room.getLeft()  + Math.floor(ROT.RNG.getUniform() * (room.getRight()  - room.getLeft()  + 1)),
        room.getTop()   + Math.floor(ROT.RNG.getUniform() * (room.getBottom() - room.getTop()   + 1)),
      ];
    }

    const occupied = new Set();
    function place(x, y, ch, fg) {
      const key = `${x},${y}`;
      if (occupied.has(key)) return;
      occupied.add(key);
      grid.put(mapX + x, mapY + y, ch, fg, C.B);
    }

    if (rs.length > 0) place(...rs[0].getCenter(), '<', C.STAIR);
    if (rs.length > 1) place(...rs[rs.length - 1].getCenter(), '>', C.STAIR);

    const lvl  = Math.floor(depth / 50);
    const MONS = lvl < 5
      ? [['r','#aa7744'],['b','#5555ff'],['k','#44aa44'],['s','#aaaaaa'],['p','#ffaaff']]
      : lvl < 15
      ? [['o','#44ff44'],['C','#88aaff'],['Z','#cc6644'],['n','#cc88ff'],['q','#888844']]
      : [['T','#00cc00'],['O','#ffff44'],['D','#ff4444'],['V','#ff44ff'],['G','#00ffff']];

    const ITEMS = [
      ['!','#4488ff'], ['?','#ffffff'], [',','#886644'],
      ['$', C.GOLD],   [')','#ffaa44'], ['[','#888888'],
    ];

    for (let i = 2; i < rs.length - 1; i++) {
      const count = ROT.RNG.getUniform() > 0.4 ? 2 : 1;
      for (let n = 0; n < count; n++) {
        const [ch, fg] = MONS[Math.floor(ROT.RNG.getUniform() * MONS.length)];
        place(...roomCell(rs[i]), ch, fg);
      }
    }

    for (let i = 3; i < rs.length; i++) {
      if (ROT.RNG.getUniform() > 0.45) {
        const [ch, fg] = ITEMS[Math.floor(ROT.RNG.getUniform() * ITEMS.length)];
        place(...roomCell(rs[i]), ch, fg);
      }
    }

    const [px, py] = rs.length > 1 ? rs[1].getCenter() : [Math.floor(mapW / 2), Math.floor(mapH / 2)];
    place(px, py, '@', C.PLAYER);

    // ── Messages ──────────────────────────────────────────────────────────────

    grid.fill(0, 0, cols, msgH, ' ', C.FG, C.B);
    drawMessageLog(grid, 0, 0, cols - 1, [
      { text: depth > 1000
          ? 'The Young Dragon breathes fire!  You are enveloped in flames.'
          : 'The Cave Spider bites you.  You feel poison running through your veins.',
        current: true },
      { text: depth > 1000
          ? 'You see here: a Dragon Scale Mail [30] (+8,+8).'
          : 'You see here: a Potion of Cure Serious Wounds (a).',
        current: false },
    ]);

    // ── Pane divider ──────────────────────────────────────────────────────────

    for (let y = msgH; y < sRow; y++) {
      grid.put(divC, y, '│', '#333333', C.B);
    }

    // ── Character panel ───────────────────────────────────────────────────────

    const hpMax = 80 + lvl * 4;
    const hpCur = Math.max(8, hpMax - Math.floor(ROT.RNG.getUniform() * 45));

    drawCharacterPanel(grid, panX, msgH, panW, {
      name:     'Thorin Oakenshield',
      race:     'Dwarf',
      cls:      'Warrior',
      title:    'Soldier',
      level:    lvl,
      exp:      Math.floor(Math.pow(depth, 1.45)),
      expNext:  Math.floor(Math.pow(depth + 50, 1.45)),
      gold:     1234 + depth * 3,
      attrs:    { str: 18, int: 8, wis: 8, dex: 14, con: 18, chr: 9 },
      combat:   { melee: '(+3,+4)', shoot: '(+0,+0)', blows: 2, shots: 1, ac: 18 + Math.floor(depth / 120) },
      hp:       hpCur,
      hpMax,
      sp:       0,
      spMax:    0,
      speed:    'Normal',
      depthStr: `${depth} ft (level ${lvl})`,
      equipment: [
        { slot: 'a', name: 'Broad Sword (2d5) (+1,+3)' },
        { slot: 'b', name: 'Small Metal Shield (+0,+0)' },
        { slot: 'c', name: 'Chain Mail (-2) [14,+0]' },
        { slot: 'd', name: 'Iron Helm [5,+0]' },
      ],
      statusEffects: [
        { text: 'Hungry',   fg: '#ffcc44' },
        { text: 'Poisoned', fg: '#44ff88' },
      ],
    });

    // ── Status bar ────────────────────────────────────────────────────────────

    const SBG = '#1c1c1c';
    grid.fill(0, sRow, cols, 1, ' ', C.FG, SBG);
    grid.text(0, sRow, ' Angband 4.2.5', C.DIM, SBG);
    const right = ` Depth: ${depth} ft   Level: ${lvl}   HP: ${hpCur}/${hpMax}   SP: 0/0   AC: ${18 + Math.floor(depth / 120)} `;
    grid.text(cols - right.length, sRow, right, C.FG, SBG);
  }),
};
