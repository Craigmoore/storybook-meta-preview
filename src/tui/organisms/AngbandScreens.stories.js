import { tuiStory } from '../story.js';
import {
  C, seg, drawSep,
  drawVitalsBlock, drawCombatBlock,
  drawMessageLog, drawCharacterPanel,
} from '../dungeonComponents.js';

export default { title: 'TUI/Organisms/Angband' };

// ── Shared helpers ────────────────────────────────────────────────────────────

function charFromDepth(depth) {
  const lvl   = Math.floor(depth / 50);
  const hpMax = 80 + lvl * 4;
  return {
    name:      'Thorin Oakenshield',
    race:      'Dwarf',
    cls:       'Warrior',
    title:     'Soldier',
    level:     lvl,
    exp:       Math.floor(Math.pow(depth, 1.45)),
    expNext:   Math.floor(Math.pow(depth + 50, 1.45)),
    gold:      1234 + depth * 3,
    attrs:     { str: 18, int: 8, wis: 8, dex: 14, con: 18, chr: 9 },
    combat:    { melee: '(+3,+4)', shoot: '(+0,+0)', blows: 2, shots: 1, ac: 18 + Math.floor(depth / 120) },
    hp:        Math.max(8, hpMax - Math.floor(depth / 40)),
    hpMax,
    sp:        0,
    spMax:     0,
    speed:     'Normal',
    depthStr:  `${depth} ft (level ${lvl})`,
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
  };
}

// ── Character Sheet ───────────────────────────────────────────────────────────

export const CharacterSheet = {
  args:     { cols: 170, rows: 47, depth: 250 },
  argTypes: {
    cols:  { control: 'number' },
    rows:  { control: 'number' },
    depth: { control: { type: 'range', min: 50, max: 4950, step: 50 } },
  },
  render: ({ cols, rows, depth }) => tuiStory({ cols, rows }, (grid) => {
    const ch   = charFromDepth(depth);
    const half = Math.floor(cols / 2);
    const mx   = grid.cols;

    // ── Header bar ────────────────────────────────────────────────────────────
    grid.fill(0, 0, cols, 1, ' ', C.B, '#1c1c1c');
    const title = 'Character Sheet';
    grid.text(Math.floor((cols - title.length) / 2), 0, title, C.WHITE, '#1c1c1c');
    const hint = '[Press any key to continue]';
    grid.text(cols - hint.length - 1, 0, hint, C.DIM, '#1c1c1c');

    // ── Left column: identity & progression ───────────────────────────────────
    const left = [
      ['Name     ', ch.name,                          C.WHITE],
      ['Sex      ', 'Male',                            C.FG],
      ['Race     ', ch.race,                           C.FG],
      ['Class    ', ch.cls,                            C.FG],
      ['Title    ', ch.title,                          C.DIM],
      [null],
      ['Age      ', ' 34        Height : 60"',         C.FG],
      ['Weight   ', '164 lbs    Status :  2',          C.FG],
      [null],
      ['Level    ', String(ch.level).padStart(3),      C.HL],
      ['Curr Exp ', String(ch.exp),                    C.HL],
      ['Max Exp  ', String(ch.exp),                    C.HL],
      ['Adv Exp  ', String(ch.expNext),                C.DIM],
      ['Gold     ', String(ch.gold) + ' gp',           '#ffff00'],
    ];

    for (let i = 0; i < left.length; i++) {
      const row = left[i];
      if (!row[0]) continue;
      const [label, value, fg] = row;
      seg(grid, 2, 2 + i, half - 2, [
        ['  ', C.B], [label, C.FG], [': ', C.DIM], [value, fg],
      ]);
    }

    // ── Right column: combat & skills ─────────────────────────────────────────
    const hpFg = ch.hp / ch.hpMax < 0.25 ? C.RED : ch.hp / ch.hpMax < 0.5 ? '#ffaa44' : C.GREEN;
    const right = [
      ['Hit Points  ', `${ch.hp} / ${ch.hpMax}`,              hpFg],
      ['Mana        ', '0 / 0',                                C.HL],
      [null],
      ['Armour (AC) ', String(ch.combat.ac),                   C.HL],
      ['+ To Hit    ', '+3',                                   C.HL],
      ['+ To Damage ', '+4',                                   C.HL],
      ['+ To Speed  ', ' 0',                                   C.FG],
      [null],
    ];

    for (let i = 0; i < right.length; i++) {
      const row = right[i];
      if (!row) continue;
      if (!row[0]) continue;
      const [label, value, fg] = row;
      seg(grid, half + 2, 2 + i, mx, [
        ['  ', C.B], [label, C.FG], [': ', C.DIM], [value, fg],
      ]);
    }

    // Skills (right column, below combat)
    drawSep(grid, half + 2, 10, half - 4);
    seg(grid, half + 2, 11, mx, [['  Skill              ', C.FG], ['Proficiency    ', C.DIM], ['Rating', C.DIM]]);
    drawSep(grid, half + 2, 12, half - 4);
    const skills = [
      ['Fighting       ', 'Heroic    ', '[37]'],
      ['Shooting       ', 'Good      ', '[19]'],
      ['Saving Throw   ', 'Superb    ', '[48]'],
      ['Stealth        ', 'Fair      ', '[12]'],
      ['Disarming      ', 'Fair      ', '[12]'],
      ['Magic Device   ', 'Poor      ', '[ 8]'],
      ['Perception     ', 'Fair      ', '[12]'],
      ['Searching      ', 'Fair      ', '[12]'],
      ['Infravision    ', '50 ft     ', '    '],
    ];
    for (let i = 0; i < skills.length; i++) {
      const [skill, rating, score] = skills[i];
      seg(grid, half + 2, 13 + i, mx, [
        ['  ', C.B], [skill, C.FG], [rating, C.HL], [score, C.DIM],
      ]);
    }

    // ── Attribute breakdown table ─────────────────────────────────────────────
    const tRow = 17;
    drawSep(grid, 0, tRow, cols);
    seg(grid, 2, tRow + 1, mx, [
      ['  Stat       ', C.FG],
      ['Intrnl  ', C.DIM], ['Race  ', C.DIM], ['Class  ', C.DIM],
      ['Equip  ', C.DIM], ['Actual  ', C.DIM], ['Current', C.DIM],
    ]);
    drawSep(grid, 0, tRow + 2, cols);

    const statRows = [
      ['Strength    ', '18/50',  '+2',  '+5',  ' 0', '18/57', '18/57'],
      ['Intelligence', '  8  ',  '-3',  '-2',  ' 0', '  3  ', '  3  '],
      ['Wisdom      ', '  8  ',  '-3',  '-2',  ' 0', '  3  ', '  3  '],
      ['Dexterity   ', ' 14  ',  ' 0',  '+2',  ' 0', ' 16  ', ' 16  '],
      ['Constitution', ' 18  ',  '+2',  '+2',  ' 0', '18/20', '18/20'],
      ['Charisma    ', '  9  ',  '-2',  ' 0',  ' 0', '  7  ', '  7  '],
    ];
    for (let i = 0; i < statRows.length; i++) {
      const [name, intrnl, race, cls, equip, actual, current] = statRows[i];
      seg(grid, 2, tRow + 3 + i, mx, [
        ['  ', C.B], [name, C.FG], [' : ', C.DIM],
        [intrnl.padEnd(8), C.HL],
        [race.padEnd(6),   '#44ff44'],
        [cls.padEnd(7),    '#4488ff'],
        [equip.padEnd(7),  C.FG],
        [actual.padEnd(8), C.WHITE],
        [current,          C.HL],
      ]);
    }

    // ── Resistances ───────────────────────────────────────────────────────────
    const rRow = tRow + 3 + statRows.length + 1;
    drawSep(grid, 0, rRow, cols);
    const resLabels = ['Fire ', 'Cold ', 'Acid ', 'Elec ', 'Pois ', 'Light', 'Dark ', 'Conf ', 'Sound', 'Shard', 'Nexus', 'Chaos', 'Blind'];
    const resSlots  = ['Head ', 'Body ', 'Arms ', 'Hands', 'Feet ', 'Ring1', 'Ring2', 'Neck '];

    seg(grid, 2, rRow + 1, mx, [['  Resistances    ', C.FG], ...resLabels.map(l => [l + ' ', C.DIM])]);
    drawSep(grid, 2, rRow + 2, cols - 4);

    for (let si = 0; si < resSlots.length; si++) {
      const parts = [['  ', C.B], [resSlots[si], C.FG], ['   ', C.B]];
      for (let ri = 0; ri < resLabels.length; ri++) {
        // Head slot has fire/cold resistance from helm (just for flavour)
        const has = (si === 0 && ri < 2) || (si === 1 && ri < 4);
        parts.push([has ? '  +   ' : '  .   ', has ? C.GREEN : C.DIM]);
      }
      seg(grid, 2, rRow + 3 + si, mx, parts);
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const fRow = rows - 1;
    grid.fill(0, fRow, cols, 1, ' ', C.B, '#1c1c1c');
    grid.text(2, fRow, '[c] Change name   [f] File char   [x] Self-knowledge', C.DIM, '#1c1c1c');
  }),
};

// ── Town Level ────────────────────────────────────────────────────────────────

const SHOPS = [
  { num: '1', name: 'General Store',  color: '#ffaa44' },
  { num: '2', name: 'Armory',         color: '#88aaff' },
  { num: '3', name: 'Weaponsmith',    color: '#ff6644' },
  { num: '4', name: 'Temple',         color: '#ffff44' },
  { num: '5', name: 'Alchemy Shop',   color: '#44ff88' },
  { num: '6', name: 'Magic Shop',     color: '#cc44ff' },
  { num: '7', name: 'Black Market',   color: '#ff4444' },
  { num: '8', name: 'Your Home',      color: '#aaaaaa' },
];

function drawBuilding(grid, x, y, w, h, num, name, color) {
  for (let dx = 0; dx < w; dx++) {
    grid.put(x + dx, y,         '#', '#777777', C.B);
    grid.put(x + dx, y + h - 1, '#', '#777777', C.B);
  }
  for (let dy = 1; dy < h - 1; dy++) {
    grid.put(x,         y + dy, '#', '#777777', C.B);
    grid.put(x + w - 1, y + dy, '#', '#777777', C.B);
    grid.fill(x + 1, y + dy, w - 2, 1, ' ', C.B, C.B);
  }
  const doorX = Math.floor(w / 2);
  grid.put(x + doorX, y + h - 1, '+', '#aa6633', C.B);
  const cy  = y + Math.floor(h / 2) - 1;
  grid.put(x + doorX, cy, num, color, C.B);
  const nx = x + Math.max(1, Math.floor((w - name.length) / 2));
  grid.text(nx, cy + 1, name.substring(0, w - 2), '#666666', C.B);
}

export const TownLevel = {
  args:     { cols: 170, rows: 47, depth: 0 },
  argTypes: {
    cols:  { control: 'number' },
    rows:  { control: 'number' },
    depth: { control: { type: 'range', min: 0, max: 4950, step: 50 } },
  },
  render: ({ cols, rows, depth }) => tuiStory({ cols, rows }, (grid) => {
    const msgH = 2;
    const panW = 35;
    const divC = cols - panW - 1;
    const mapX = 0;
    const mapY = msgH;
    const mapW = divC;
    const mapH = rows - msgH - 1;
    const panX = divC + 1;
    const sRow = rows - 1;

    // ── Town map ──────────────────────────────────────────────────────────────

    // Stone streets
    grid.fill(mapX, mapY, mapW, mapH, '.', '#2d2d2d', C.B);

    // Town wall
    for (let dx = 0; dx < mapW; dx++) {
      grid.put(mapX + dx, mapY,          '#', '#888888', C.B);
      grid.put(mapX + dx, mapY + mapH - 1, '#', '#888888', C.B);
    }
    for (let dy = 1; dy < mapH - 1; dy++) {
      grid.put(mapX,           mapY + dy, '#', '#888888', C.B);
      grid.put(mapX + mapW - 1, mapY + dy, '#', '#888888', C.B);
    }

    // Town gate (top, leads to wilderness)
    const gateX = Math.floor(mapW / 2);
    grid.put(mapX + gateX, mapY, '>', '#ffffff', C.B);
    grid.text(mapX + gateX - 6, mapY, ' Wilderness ', '#444444', C.B);

    // Shop layout — 2 rows of 4
    const shopW = 24, shopH = 7, hGap = 5, vGap = 7;
    const totalW = 4 * shopW + 3 * hGap;
    const startX = Math.floor((mapW - totalW) / 2);
    const startY = 3;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const { num, name, color } = SHOPS[row * 4 + col];
        drawBuilding(
          grid,
          mapX + startX + col * (shopW + hGap),
          mapY + startY + row * (shopH + vGap),
          shopW, shopH, num, name, color,
        );
      }
    }

    // Dungeon stairs (below second row of shops)
    const stairY = startY + 2 * shopH + vGap + 4;
    const stairX = Math.floor(mapW / 2);
    grid.put(mapX + stairX,      mapY + stairY,      '<', '#ffffff', C.B);
    grid.text(mapX + stairX - 5, mapY + stairY + 1, '(dungeon)', '#444444', C.B);

    // Player (street between shop rows)
    const playerY = startY + shopH + Math.floor(vGap / 2);
    grid.put(mapX + stairX, mapY + playerY, '@', C.PLAYER, C.B);

    // Townspeople
    const npcs = [
      [startX + 3,                    playerY - 1],
      [startX + shopW + hGap + 10,    playerY + 1],
      [startX + 2 * (shopW + hGap) + 5, playerY],
      [startX + 3 * (shopW + hGap) - 2, startY + shopH + vGap + 2],
      [stairX - 8,                    stairY - 2],
    ];
    for (const [nx, ny] of npcs) {
      if (nx > 0 && nx < mapW - 1 && ny > 0 && ny < mapH - 1) {
        grid.put(mapX + nx, mapY + ny, 'p', '#ffaaff', C.B);
      }
    }

    // ── Messages ──────────────────────────────────────────────────────────────

    grid.fill(0, 0, cols, msgH, ' ', C.FG, C.B);
    drawMessageLog(grid, 0, 0, cols - 1, [
      { text: 'You are in the Town of Angwil.  Day 3.  The sun is shining.', current: true },
      { text: 'You feel better.', current: false },
    ]);

    // ── Divider + panel ───────────────────────────────────────────────────────

    for (let y = msgH; y < sRow; y++) {
      grid.put(divC, y, '│', '#333333', C.B);
    }

    drawCharacterPanel(grid, panX, msgH, panW, charFromDepth(depth));

    // ── Status bar ────────────────────────────────────────────────────────────

    const SBG = '#1c1c1c';
    const ch  = charFromDepth(depth);
    grid.fill(0, sRow, cols, 1, ' ', C.FG, SBG);
    grid.text(0, sRow, ' Angband 4.2.5  Town level', C.DIM, SBG);
    const right = ` HP: ${ch.hp}/${ch.hpMax}   SP: 0/0   Gold: ${ch.gold} gp `;
    grid.text(cols - right.length, sRow, right, C.FG, SBG);
  }),
};

// ── Inventory Screen ──────────────────────────────────────────────────────────

const INVENTORY = [
  { slot: 'a', desc: 'a Broad Sword (2d5) (+1,+3)',                     wt: ' 3.0', color: '#ffaa44' },
  { slot: 'b', desc: 'a Small Metal Shield (+0,+0)',                     wt: ' 5.0', color: C.FG },
  { slot: 'c', desc: 'Chain Mail (-2) [14,+0]',                         wt: '18.0', color: '#888888' },
  { slot: 'd', desc: 'an Iron Helm [5,+0]',                             wt: ' 7.5', color: '#888888' },
  { slot: 'e', desc: 'a Pair of Leather Boots [2,+0]',                  wt: ' 1.5', color: '#888888' },
  { slot: 'f', desc: 'a Cloak [1,+0]',                                  wt: ' 1.0', color: C.FG },
  { slot: 'g', desc: '7 Rations of Food',                               wt: ' 0.7', color: '#886644' },
  { slot: 'h', desc: 'a Wooden Torch (3000 turns of light)',            wt: ' 1.0', color: '#ffcc44' },
  { slot: 'i', desc: '3 Potions of Cure Light Wounds {!k!d}',          wt: ' 0.3', color: '#4488ff' },
  { slot: 'j', desc: '5 Scrolls titled "blarf unk" {Identify}',        wt: ' 0.5', color: C.WHITE },
  { slot: 'k', desc: 'a Wand of Magic Missile (9 charges)',             wt: ' 0.5', color: '#cc44ff' },
  { slot: 'l', desc: '10 Arrows (+0,+0)',                               wt: ' 0.1', color: '#aa7744' },
  { slot: 'm', desc: '2 Flasks of Oil',                                 wt: ' 0.4', color: '#886644' },
];

export const InventoryScreen = {
  args:     { cols: 170, rows: 47 },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },
  render: ({ cols, rows }) => tuiStory({ cols, rows }, (grid) => {
    const totalWt  = INVENTORY.reduce((s, i) => s + parseFloat(i.wt), 0).toFixed(1);
    const capacity = '120.0';
    const pct      = Math.round((parseFloat(totalWt) / parseFloat(capacity)) * 100);

    // ── Header ────────────────────────────────────────────────────────────────

    grid.fill(0, 0, cols, 1, ' ', C.B, '#1c1c1c');
    const hdr = `  Inventory  —  Carrying ${totalWt} of ${capacity} lbs  (${pct}% full)`;
    grid.text(0, 0, hdr, C.FG, '#1c1c1c');
    const hint = '[Press letter to inspect, ESC to exit]';
    grid.text(cols - hint.length - 1, 0, hint, C.DIM, '#1c1c1c');

    // Weight bar
    const barW   = Math.floor(cols * 0.6);
    const barX   = Math.floor((cols - barW) / 2);
    const filled = Math.round((parseFloat(totalWt) / parseFloat(capacity)) * barW);
    grid.fill(barX,          1, filled,       1, '█', '#44ff44', C.B);
    grid.fill(barX + filled, 1, barW - filled, 1, '░', '#333333', C.B);
    const pctStr = ` ${totalWt} / ${capacity} lbs `;
    grid.text(barX + Math.floor((barW - pctStr.length) / 2), 1, pctStr, C.DIM, C.B);

    drawSep(grid, 0, 2, cols);

    // Column headers
    seg(grid, 0, 3, cols, [
      ['  Slot  Item', C.DIM],
      ['                                                              ', C.B],
      ['Weight', C.DIM],
    ]);
    drawSep(grid, 0, 4, cols);

    // ── Item list ─────────────────────────────────────────────────────────────

    for (let i = 0; i < INVENTORY.length; i++) {
      const { slot, desc, wt, color } = INVENTORY[i];
      const wtStr = wt + ' lbs.';
      const descW = cols - 12 - wtStr.length - 2;
      seg(grid, 0, 5 + i, cols, [
        ['  ', C.B], [slot + ') ', C.DIM], [desc.substring(0, descW).padEnd(descW), color], ['  ', C.B], [wtStr, C.DIM],
      ]);
    }

    drawSep(grid, 0, 5 + INVENTORY.length, cols);

    // Totals
    seg(grid, 0, 6 + INVENTORY.length, cols, [
      ['  Total weight carried:  ', C.FG], [totalWt + ' lbs', C.HL],
      ['   Remaining capacity:  ', C.FG],  [String((parseFloat(capacity) - parseFloat(totalWt)).toFixed(1)) + ' lbs', C.GREEN],
    ]);

    // ── Footer ────────────────────────────────────────────────────────────────

    const fRow = rows - 1;
    grid.fill(0, fRow, cols, 1, ' ', C.B, '#1c1c1c');
    grid.text(2, fRow, '[a-m] Inspect item   [d] Drop   [ESC] Exit', C.DIM, '#1c1c1c');
  }),
};

// ── Store Screen ──────────────────────────────────────────────────────────────

const STORE_ITEMS = {
  '1': {
    name: 'General Store',
    color: '#ffaa44',
    stock: [
      { slot: 'a', desc: '3 Rations of Food',              wt: '0.7', price:   15, color: '#886644' },
      { slot: 'b', desc: '5 Flasks of Oil',                wt: '0.5', price:   40, color: '#886644' },
      { slot: 'c', desc: 'a Wooden Torch',                 wt: '1.0', price:    2, color: '#ffcc44' },
      { slot: 'd', desc: 'a Torch',                        wt: '1.0', price:    5, color: '#ffcc44' },
      { slot: 'e', desc: '10 Arrows (+0,+0)',              wt: '0.1', price:   25, color: '#aa7744' },
      { slot: 'f', desc: 'a Pair of Leather Gloves [1,+0]',wt: '0.5', price:   25, color: C.FG },
      { slot: 'g', desc: 'a Shovel (1d2) (+0,+0)',         wt: '3.0', price:   50, color: '#ffaa44' },
    ],
  },
  '2': {
    name: 'Armory',
    color: '#88aaff',
    stock: [
      { slot: 'a', desc: 'Soft Leather Armour [4,+0]',     wt: '8.0', price:   90, color: '#888888' },
      { slot: 'b', desc: 'Chain Mail (-2) [14,+0]',        wt:'18.0', price:  300, color: '#888888' },
      { slot: 'c', desc: 'a Small Metal Shield [+0]',      wt: '5.0', price:   50, color: '#888888' },
      { slot: 'd', desc: 'a Set of Leather Gloves [1,+0]', wt: '0.5', price:   15, color: C.FG },
      { slot: 'e', desc: 'a Pair of Soft Leather Boots',   wt: '1.0', price:    8, color: C.FG },
      { slot: 'f', desc: 'an Iron Helm [5,+0]',            wt: '7.5', price:  100, color: '#888888' },
    ],
  },
};

export const StoreScreen = {
  args:     { cols: 170, rows: 47, store: '1' },
  argTypes: {
    cols:  { control: 'number' },
    rows:  { control: 'number' },
    store: { control: { type: 'select', options: ['1', '2'] } },
  },
  render: ({ cols, rows, store }) => tuiStory({ cols, rows }, (grid) => {
    const { name, color, stock } = STORE_ITEMS[store] ?? STORE_ITEMS['1'];
    const gold = 3456;

    // ── Store header ──────────────────────────────────────────────────────────

    grid.fill(0, 0, cols, 1, ' ', C.B, '#1c1c1c');
    grid.text(Math.floor((cols - name.length) / 2), 0, name, color, '#1c1c1c');
    grid.text(cols - 20, 0, `Gold: ${gold} gp     `, C.GOLD, '#1c1c1c');

    drawSep(grid, 0, 1, cols);

    // Column headers
    const descW = cols - 30;
    seg(grid, 0, 2, cols, [
      ['  Slot  Item', C.DIM],
      [''.padEnd(descW - 12), C.B],
      ['Weight    Price  ', C.DIM],
    ]);
    drawSep(grid, 0, 3, cols);

    // ── Stock list ────────────────────────────────────────────────────────────

    for (let i = 0; i < stock.length; i++) {
      const { slot, desc, wt, price, color: ic } = stock[i];
      const priceStr = String(price).padStart(6) + ' gp';
      const wtStr    = (wt + ' lbs').padStart(8);
      const dw       = cols - 6 - wtStr.length - priceStr.length - 4;
      seg(grid, 0, 4 + i, cols, [
        ['  ', C.B], [slot + ') ', C.DIM],
        [desc.substring(0, dw).padEnd(dw), ic],
        [wtStr, C.DIM], ['  ', C.B], [priceStr, C.GOLD],
      ]);
    }

    drawSep(grid, 0, 4 + stock.length, cols);

    // ── Sell area ─────────────────────────────────────────────────────────────

    const sellRow = 5 + stock.length;
    seg(grid, 0, sellRow, cols, [
      ['  Items you are selling:                        ', C.DIM],
      ['(bring up inventory with i, select item to sell)', C.DIM],
    ]);

    // ── Divider and your inventory column ─────────────────────────────────────

    const colDiv = Math.floor(cols * 0.6);
    for (let y = sellRow + 1; y < rows - 1; y++) {
      grid.put(colDiv, y, '│', '#333333', C.B);
    }

    seg(grid, colDiv + 2, sellRow + 1, cols, [['  Your Items                    Price', C.DIM]]);
    drawSep(grid, colDiv + 2, sellRow + 2, cols - colDiv - 2);

    const sellable = [
      { slot: 'a', desc: '10 Arrows (+0,+0)',         price:   12, color: '#aa7744' },
      { slot: 'i', desc: 'a Potion of Cure Lt Wounds',price:   25, color: '#4488ff' },
    ];
    for (let i = 0; i < sellable.length; i++) {
      const { slot, desc, price, color: ic } = sellable[i];
      const prStr = String(price).padStart(5) + ' gp';
      seg(grid, colDiv + 2, sellRow + 3 + i, cols, [
        ['  ', C.B], [slot + ') ', C.DIM],
        [desc.substring(0, cols - colDiv - 16).padEnd(cols - colDiv - 16), ic],
        [prStr, C.GOLD],
      ]);
    }

    // ── Footer ────────────────────────────────────────────────────────────────

    const fRow = rows - 1;
    grid.fill(0, fRow, cols, 1, ' ', C.B, '#1c1c1c');
    grid.text(2, fRow, '[a-z] Buy item   [s] Sell   [i] Inspect   [ESC] Leave store', C.DIM, '#1c1c1c');
  }),
};
