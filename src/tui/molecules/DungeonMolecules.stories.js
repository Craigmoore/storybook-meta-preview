import { tuiStory } from '../story.js';
import {
  C, drawSep,
  drawAttributeBlock, drawVitalsBlock, drawCombatBlock,
  drawEquipmentList, drawMessageLog, drawCharacterHeader,
} from '../dungeonComponents.js';

export default { title: 'TUI/Molecules/Dungeon' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ── Attribute Block ───────────────────────────────────────────────────────────

export const AttributeBlock = {
  args: { cols: 50, rows: 10, str: 18, int: 8, wis: 8, dex: 14, con: 18, chr: 9 },
  argTypes: {
    cols: { control: 'number' }, rows: { control: 'number' },
    str: range(3, 25), int: range(3, 25), wis: range(3, 25),
    dex: range(3, 25), con: range(3, 25), chr: range(3, 25),
  },
  render: ({ cols, rows, str, int: INT, wis, dex, con, chr }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor((rows - 3) / 2);
      drawAttributeBlock(grid, 2, y, { str, int: INT, wis, dex, con, chr });
    }),
};

// ── Vitals Block ──────────────────────────────────────────────────────────────

export const VitalsBlock = {
  args: { cols: 45, rows: 8, hp: 45, hpMax: 80, sp: 12, spMax: 30 },
  argTypes: {
    cols:  { control: 'number' }, rows:  { control: 'number' },
    hp:    range(0, 400),         hpMax: range(1, 400),
    sp:    range(0, 200),         spMax: range(0, 200),
  },
  render: ({ cols, rows, hp, hpMax, sp, spMax }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor((rows - 2) / 2);
      drawVitalsBlock(grid, 2, y, hp, hpMax, sp, spMax);
    }),
};

// ── Combat Block ──────────────────────────────────────────────────────────────

export const CombatBlock = {
  args: {
    cols: 55, rows: 10,
    melee: '(+3,+4)', shoot: '(+0,+0)', blows: 2, shots: 1, ac: 23,
  },
  argTypes: {
    cols:  { control: 'number' }, rows:  { control: 'number' },
    melee: { control: 'text'   }, shoot: { control: 'text' },
    blows: range(1, 6),           shots: range(1, 4),
    ac:    range(0, 60),
  },
  render: ({ cols, rows, melee, shoot, blows, shots, ac }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor((rows - 3) / 2);
      drawCombatBlock(grid, 2, y, { melee, shoot, blows, shots, ac });
    }),
};

// ── Equipment List ────────────────────────────────────────────────────────────

export const EquipmentList = {
  args: { cols: 55, rows: 12 },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },
  render: ({ cols, rows }) =>
    tuiStory({ cols, rows }, (grid) => {
      const items = [
        { slot: 'a', name: 'Broad Sword (2d5) (+1,+3)' },
        { slot: 'b', name: 'Small Metal Shield (+0,+0)' },
        { slot: 'c', name: 'Chain Mail (-2) [14,+0]' },
        { slot: 'd', name: 'Iron Helm [5,+0]' },
        { slot: 'e', name: 'Pair of Leather Boots [2,+0]' },
        { slot: 'f', name: 'Cloak [1,+0]' },
      ];
      const y = Math.floor((rows - items.length - 1) / 2);
      drawEquipmentList(grid, 2, y, items);
    }),
};

// ── Message Log ───────────────────────────────────────────────────────────────

export const MessageLog = {
  args: {
    cols: 90, rows: 10,
    msg0: 'The Cave Spider bites you.  You feel poison running through your veins.',
    msg1: 'You hit the Orc.  The Orc misses.',
    msg2: 'You see here: a Potion of Cure Serious Wounds (a).',
  },
  argTypes: {
    cols: { control: 'number' }, rows: { control: 'number' },
    msg0: { control: 'text' },
    msg1: { control: 'text' },
    msg2: { control: 'text' },
  },
  render: ({ cols, rows, msg0, msg1, msg2 }) =>
    tuiStory({ cols, rows }, (grid) => {
      const messages = [
        { text: msg0, current: true  },
        { text: msg1, current: false },
        { text: msg2, current: false },
      ];
      const y = Math.floor((rows - messages.length) / 2);
      drawMessageLog(grid, 1, y, cols - 2, messages);
    }),
};

// ── Character Header ──────────────────────────────────────────────────────────

export const CharacterHeader = {
  args: {
    cols: 55, rows: 14,
    name: 'Thorin Oakenshield', race: 'Dwarf', cls: 'Warrior', title: 'Soldier',
    level: 5, exp: 1234, expNext: 2000, gold: 3456,
  },
  argTypes: {
    cols:    { control: 'number' }, rows:   { control: 'number' },
    name:    { control: 'text'   }, race:   { control: 'text' },
    cls:     { control: 'text'   }, title:  { control: 'text' },
    level:   range(1, 50),
    exp:     { control: 'number' }, expNext: { control: 'number' },
    gold:    { control: 'number' },
  },
  render: ({ cols, rows, name, race, cls, title, level, exp, expNext, gold }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor((rows - 7) / 2);
      drawCharacterHeader(grid, 2, y, { name, race, cls, title, level, exp, expNext, gold });
      drawSep(grid, 2, y + 7, cols - 4);
    }),
};
