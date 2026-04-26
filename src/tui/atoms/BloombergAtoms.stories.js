import { tuiStory } from '../story.js';
import { BC, seg, priceHistory, drawSparkline, drawFnKeyBar, drawBloombergSep } from '../bloombergComponents.js';

export default { title: 'TUI/Atoms/Bloomberg' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ── Price Tick ────────────────────────────────────────────────────────────────

export const PriceTick = {
  args: {
    cols: 70, rows: 8,
    price: 189.34, change: 2.45, changePct: 1.31,
  },
  argTypes: {
    cols:      { control: 'number' },
    rows:      { control: 'number' },
    price:     { control: 'number' },
    change:    range(-50, 50, 0.01),
    changePct: range(-15, 15, 0.01),
  },
  render: ({ cols, rows, price, change, changePct }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y   = Math.floor(rows / 2) - 1;
      const dir = change >= 0 ? '▲' : '▼';
      const cFg = change >= 0 ? BC.UP : BC.DOWN;
      const ch  = `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
      const pct = `(${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)`;

      seg(grid, 2, y, cols, [
        [price.toFixed(2), BC.WHITE], ['   ', BC.BG],
        [dir + ' ', cFg], [ch + '  ' + pct, cFg],
      ]);
      seg(grid, 2, y + 1, cols, [
        ['LAST TRADE: ', BC.DIM], ['10:34:22 EST', BC.FG],
      ]);
    }),
};

// ── Sparkline ─────────────────────────────────────────────────────────────────

export const Sparkline = {
  args: { cols: 90, rows: 8, width: 60, seed: 42, basePrice: 189.34, volatility: 1.2 },
  argTypes: {
    cols:       { control: 'number' },
    rows:       { control: 'number' },
    width:      range(10, 85),
    seed:       range(0, 999),
    basePrice:  { control: 'number' },
    volatility: range(0.1, 10, 0.1),
  },
  render: ({ cols, rows, width, seed, basePrice, volatility }) =>
    tuiStory({ cols, rows }, (grid) => {
      const prices = priceHistory(basePrice, volatility, width * 4, seed);
      const y = Math.floor(rows / 2);
      grid.text(2, y - 1, 'AAPL  Intraday', BC.DIM, BC.BG);
      drawSparkline(grid, 2, y, width, prices);
      const last   = prices[prices.length - 1];
      const change = last - prices[0];
      const fg     = change >= 0 ? BC.UP : BC.DOWN;
      grid.text(width + 4, y, last.toFixed(2), BC.WHITE, BC.BG);
      grid.text(width + 4 + 8, y, `${change >= 0 ? '+' : ''}${change.toFixed(2)}`, fg, BC.BG);
    }),
};

// ── Function Key Bar ──────────────────────────────────────────────────────────

export const FunctionKeyBar = {
  args: { cols: 170, rows: 5, preset: 'bloomberg' },
  argTypes: {
    cols:   { control: 'number' },
    rows:   { control: 'number' },
    preset: { control: { type: 'select', options: ['bloomberg', 'navigation', 'edit'] } },
  },
  render: ({ cols, rows, preset }) =>
    tuiStory({ cols, rows }, (grid) => {
      const PRESETS = {
        bloomberg: [
          { key: 'F1', label: 'Help'   }, { key: 'F2', label: 'Mntr'   },
          { key: 'F3', label: 'Equty'  }, { key: 'F4', label: 'Corp'   },
          { key: 'F5', label: 'Govt'   }, { key: 'F6', label: 'Muni'   },
          { key: 'F7', label: 'Mtge'   }, { key: 'F8', label: 'M-Mkt'  },
          { key: 'F9', label: 'Cmdty'  }, { key: 'F10', label: 'Index' },
          { key: 'F11', label: 'Curr'  }, { key: 'F12', label: 'Cust'  },
        ],
        navigation: [
          { key: 'F1', label: 'Back'  }, { key: 'F2', label: 'Fwd'   },
          { key: 'F3', label: 'Srch'  }, { key: 'F4', label: 'News'  },
          { key: 'F5', label: 'Chart' }, { key: 'F6', label: 'Anlys' },
          { key: 'F7', label: 'Port'  }, { key: 'F8', label: 'Msgs'  },
          { key: 'F9', label: 'Prefs' }, { key: 'F10', label: 'Prt'  },
          { key: 'F11', label: 'Save' }, { key: 'F12', label: 'Quit' },
        ],
        edit: [
          { key: 'F1', label: 'Cut'  }, { key: 'F2', label: 'Copy' },
          { key: 'F3', label: 'Pste' }, { key: 'F4', label: 'Find' },
          { key: 'F5', label: 'Rplc' }, { key: 'F6', label: 'Goto' },
          { key: 'F7', label: 'Undo' }, { key: 'F8', label: 'Redo' },
          { key: 'F9', label: 'Mark' }, { key: 'F10', label: 'All' },
          { key: 'F11', label: 'Fmt' }, { key: 'F12', label: 'Run' },
        ],
      };
      drawFnKeyBar(grid, Math.floor(rows / 2), cols, PRESETS[preset]);
    }),
};

// ── Section Label ─────────────────────────────────────────────────────────────

export const SectionLabel = {
  args: { cols: 55, rows: 8, label: 'KEY STATISTICS', width: 32 },
  argTypes: {
    cols:  { control: 'number' },
    rows:  { control: 'number' },
    label: { control: 'text' },
    width: range(20, 55),
  },
  render: ({ cols, rows, label, width }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor(rows / 2);
      grid.fill(2, y, width, 1, ' ', BC.HDRFG, '#221100');
      grid.text(3, y, label, BC.HDRFG, '#221100');
      drawBloombergSep(grid, 2, y + 1, width);
      seg(grid, 2, y + 2, 2 + width, [
        ['  Market Cap:'.padEnd(18), BC.CYAN], ['$2.89T', BC.FG],
      ]);
    }),
};
