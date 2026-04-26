import { tuiStory } from '../story.js';
import {
  BC, seg, priceHistory,
  drawBloombergHeader, drawBloombergSep, drawSectionLabel, drawFnKeyBar,
  drawQuoteHeader, drawKeyStats, drawOrderBook, drawNewsHeadlines,
  drawMarketRow, drawPriceChart, drawSparkline, drawPeriodSelector,
} from '../bloombergComponents.js';

export default { title: 'TUI/Organisms/Bloomberg' };

// ── Shared data helpers ───────────────────────────────────────────────────────

const FN_KEYS = [
  { key: 'F1', label: 'Help'  }, { key: 'F2', label: 'Mntr'  },
  { key: 'F3', label: 'Equty' }, { key: 'F4', label: 'Corp'  },
  { key: 'F5', label: 'Govt'  }, { key: 'F6', label: 'Cmdty' },
  { key: 'F7', label: 'Mtge'  }, { key: 'F8', label: 'M-Mkt' },
  { key: 'F9', label: 'Index' }, { key: 'F10', label: 'Curr' },
  { key: 'F11', label: 'Port' }, { key: 'F12', label: 'Cust' },
];

function makeQuote(ticker, company, price, changePct, seed) {
  const prices   = priceHistory(price, price * 0.006, 390, seed);
  const open     = prices[0];
  const high     = Math.max(...prices);
  const low      = Math.min(...prices);
  const change   = price - open;
  return {
    ticker, company, exchange: 'NASDAQ NMS', currency: 'USD', sector: 'Technology',
    price, change, changePct,
    open, high, low, prevClose: open,
    high52: price * 1.048, low52: price * 0.752,
    prices, open,
  };
}

function makeOrderBook(price, seed) {
  let s = seed >>> 0;
  const rand = (max = 5000) => { s = (s * 1664525 + 1013904223) >>> 0; return Math.floor((s >>> 0) / 0xffffffff * max) + 100; };
  const sp  = 0.01;
  const asks = Array.from({ length: 5 }, (_, i) => [price + sp + i * sp, rand()]);
  const bids = Array.from({ length: 5 }, (_, i) => [price - i * sp, rand()]);
  return { asks, bids };
}

// ── Bloomberg EQS — Equity Summary ───────────────────────────────────────────

export const BloombergEQS = {
  name: 'Equity Summary (EQS)',
  args: {
    cols: 170, rows: 47,
    ticker: 'AAPL', company: 'Apple Inc',
    price: 189.34, changePct: 1.31, seed: 42,
  },
  argTypes: {
    cols:      { control: 'number' },
    rows:      { control: 'number' },
    ticker:    { control: 'text'   },
    company:   { control: 'text'   },
    price:     { control: 'number' },
    changePct: { control: { type: 'range', min: -15, max: 15, step: 0.01 } },
    seed:      { control: { type: 'range', min: 0, max: 999 } },
  },
  render: ({ cols, rows, ticker, company, price, changePct, seed }) => {
    const q         = makeQuote(ticker, company, price, changePct, seed);
    const { asks, bids } = makeOrderBook(price, seed);
    const fmtB = (n) => n >= 1e12 ? (n / 1e12).toFixed(2) + 'T' : (n / 1e9).toFixed(1) + 'B';
    const mktCap = price * 15.34e9;

    return tuiStory({ cols, rows }, (grid) => {
      // ── Header ──
      drawBloombergHeader(grid, 0, cols,
        ticker + ' US Equity   DES  GP  EQS  FA  RELS  HDS',
        'Apr 26 2026  10:34:22 EST');

      // ── Quote header (rows 1-5) ──
      drawQuoteHeader(grid, 0, 1, cols, q);

      // ── Full-width separator ──
      drawBloombergSep(grid, 0, 6, cols);

      // Layout: left=0-31 | divider=32 | chart=33-132 | divider=133 | right=134-169
      const LEFT_W  = 32;
      const CHART_X = 33;
      const CHART_W = 100;
      const RIGHT_X = 134;
      const RIGHT_W = cols - RIGHT_X;
      const PANEL_H = 32; // rows 7-38

      // ── Vertical dividers ──
      for (let row = 7; row <= 38; row++) {
        grid.put(LEFT_W,      row, '│', BC.SEP, BC.BG);
        grid.put(RIGHT_X - 1, row, '│', BC.SEP, BC.BG);
      }

      // ── Left: key statistics ──
      let r = 7;
      drawSectionLabel(grid, 0, r++, LEFT_W, 'KEY STATISTICS');
      drawKeyStats(grid, 0, r, [
        { label: 'Market Cap',   value: '$' + fmtB(mktCap) },
        { label: 'P/E Ratio',    value: (price / 6.41).toFixed(2) },
        { label: 'EPS (TTM)',    value: '$6.41' },
        { label: 'Revenue',      value: '$391B' },
        { label: 'Net Income',   value: '$93.7B' },
        { label: 'Gross Margin', value: '44.5%' },
        { label: 'Volume',       value: '52.3M' },
        { label: 'Avg Volume',   value: '61.2M', fg: BC.DIM },
        { label: 'Shares Out',   value: '15.3B' },
        { label: 'Short Float',  value: '0.68%' },
        { label: 'Inst. Own',    value: '61.3%' },
        { label: 'Insider Own',  value: '0.07%' },
        { label: 'Short Ratio',  value: '1.23', fg: BC.DIM },
      ]);
      r += 13 + 1;
      drawSectionLabel(grid, 0, r++, LEFT_W, 'VALUATION');
      drawKeyStats(grid, 0, r, [
        { label: 'Fwd P/E',  value: '27.12' },
        { label: 'PEG',      value: '2.34' },
        { label: 'P/S',      value: '7.45' },
        { label: 'P/B',      value: '48.72' },
        { label: 'EV/EBITDA',value: '22.3' },
      ]);
      r += 5 + 1;
      drawSectionLabel(grid, 0, r++, LEFT_W, 'DIVIDENDS');
      drawKeyStats(grid, 0, r, [
        { label: 'Yield',   value: '0.53%', fg: BC.UP },
        { label: 'Annual',  value: '$1.00' },
        { label: 'Ex-Date', value: '2026-02-07' },
      ]);
      r += 3 + 1;
      drawSectionLabel(grid, 0, r++, LEFT_W, 'RISK');
      drawKeyStats(grid, 0, r, [
        { label: 'Beta',    value: '1.24' },
        { label: '52W Chg', value: '+33.2%', fg: BC.UP },
        { label: 'ATR(14)', value: '2.87' },
      ]);

      // ── Center: intraday chart ──
      drawPriceChart(grid, CHART_X, 7, CHART_W, PANEL_H, q.prices, q.open);

      // ── Right: order book + last trades ──
      drawOrderBook(grid, RIGHT_X, 7, RIGHT_W, asks, bids);
      let rr = 7 + 2 + asks.length + 1 + bids.length + 1;
      drawSectionLabel(grid, RIGHT_X, rr++, RIGHT_W, 'LAST TRADES');
      seg(grid, RIGHT_X, rr++, cols, [['  ', BC.BG], ['TIME     PRICE    SIZE', BC.DIM]]);
      const now = new Date(2026, 3, 26, 10, 34, 22);
      let s2 = seed >>> 0;
      const r2 = (max) => { s2 = (s2 * 1664525 + 1013904223) >>> 0; return Math.floor((s2 >>> 0) / 0xffffffff * max); };
      for (let i = 0; i < 10 && rr <= 38; i++) {
        const sec  = (now.getSeconds() - i * r2(30)) % 60;
        const p    = price - (r2(20) - 10) * 0.01;
        const sz   = r2(2000) + 100;
        const isFg = i === 0;
        seg(grid, RIGHT_X, rr++, cols, [
          ['  ', BC.BG],
          [`10:34:${String(Math.abs(sec)).padStart(2,'0')}`, BC.DIM], ['  ', BC.BG],
          [p.toFixed(2).padStart(7), isFg ? BC.WHITE : BC.FG], ['  ', BC.BG],
          [String(sz).padStart(6), BC.DIM],
        ]);
      }

      // ── Full-width separator ──
      drawBloombergSep(grid, 0, 39, cols);

      // ── News headlines ──
      drawNewsHeadlines(grid, 0, 40, cols, [
        { time: '10:34', source: 'BBG', text: 'Apple reports record Q2 earnings; iPhone revenue beats estimates by 4%' },
        { time: '10:21', source: 'WSJ', text: 'Fed signals two rate cuts in 2026 as inflation cools to 2.3%' },
        { time: '09:58', source: 'FT',  text: 'EU regulators approve proposed App Store changes after two-year review' },
        { time: '09:44', source: 'BBG', text: 'AAPL options market implies 5.2% move on earnings; largest since 2020' },
      ]);

      // ── Separator + function keys ──
      drawBloombergSep(grid, 0, 45, cols);
      drawFnKeyBar(grid, 46, cols, FN_KEYS);
    });
  },
};

// ── Bloomberg WMQ — World Market Monitor ─────────────────────────────────────

const MARKETS = {
  Americas: [
    { name: 'S&P 500 Futures',    last: '5,234.56',  change: 23.45,  changePct: 0.45,  time: '10:34' },
    { name: 'DJIA Futures',       last: '38,567.34', change: -89.23, changePct: -0.23, time: '10:34' },
    { name: 'NASDAQ 100',         last: '16,432.11', change: 67.89,  changePct: 0.41,  time: '10:34' },
    { name: 'Russell 2000',       last: '1,956.78',  change: 8.23,   changePct: 0.42,  time: '10:34' },
    { name: 'TSX Composite',      last: '21,234.56', change: 45.67,  changePct: 0.22,  time: '10:34' },
    { name: 'Bovespa',            last: '128,456.7', change: -234.5, changePct: -0.18, time: '14:34' },
    { name: 'Merval',             last: '890,123.4', change: 1234.5, changePct: 0.14,  time: '14:34' },
  ],
  Europe: [
    { name: 'Euro Stoxx 50',      last: '4,923.45',  change: 12.34,  changePct: 0.25,  time: '15:34 CET' },
    { name: 'FTSE 100',           last: '7,834.23',  change: 15.67,  changePct: 0.20,  time: '15:34 GMT' },
    { name: 'DAX',                last: '17,234.56', change: -45.67, changePct: -0.26, time: '15:34 CET' },
    { name: 'CAC 40',             last: '7,456.78',  change: 23.45,  changePct: 0.32,  time: '15:34 CET' },
    { name: 'IBEX 35',            last: '10,234.56', change: -12.34, changePct: -0.12, time: '15:34 CET' },
    { name: 'FTSE MIB',           last: '32,456.78', change: 123.45, changePct: 0.38,  time: '15:34 CET' },
  ],
  'Asia-Pacific': [
    { name: 'Nikkei 225',         last: '38,234.56', change: 234.56, changePct: 0.62,  time: 'CLOSED' },
    { name: 'Hang Seng',          last: '17,456.78', change: -145.6, changePct: -0.83, time: 'CLOSED' },
    { name: 'Shanghai Comp',      last: '3,123.45',  change: 12.34,  changePct: 0.40,  time: 'CLOSED' },
    { name: 'ASX 200',            last: '7,789.12',  change: 23.45,  changePct: 0.30,  time: 'CLOSED' },
    { name: 'KOSPI',              last: '2,567.89',  change: -8.90,  changePct: -0.35, time: 'CLOSED' },
    { name: 'Sensex',             last: '74,234.56', change: 234.56, changePct: 0.32,  time: 'CLOSED' },
  ],
  Commodities: [
    { name: 'WTI Crude ($/bbl)',  last: '78.45',     change: 0.45,   changePct: 0.58,  time: '10:34' },
    { name: 'Brent Crude ($/bbl)',last: '82.34',     change: 0.67,   changePct: 0.82,  time: '10:34' },
    { name: 'Gold ($/oz)',        last: '2,345.67',  change: 12.34,  changePct: 0.53,  time: '10:34' },
    { name: 'Silver ($/oz)',      last: '28.45',     change: 0.23,   changePct: 0.81,  time: '10:34' },
    { name: 'Nat Gas ($/MMBtu)',  last: '2.123',     change: -0.034, changePct: -1.58, time: '10:34' },
  ],
  'Fixed Income': [
    { name: 'US 10Y Tsy Yld',    last: '4.523%',    change: -0.034, changePct: -0.75, time: '10:34' },
    { name: 'US 2Y Tsy Yld',     last: '4.812%',    change: -0.012, changePct: -0.25, time: '10:34' },
    { name: 'German Bund 10Y',   last: '2.123%',    change: 0.018,  changePct: 0.86,  time: '15:34 CET' },
    { name: 'UK Gilt 10Y',       last: '4.234%',    change: 0.023,  changePct: 0.55,  time: '15:34 GMT' },
    { name: 'Japan JGB 10Y',     last: '1.034%',    change: 0.004,  changePct: 0.39,  time: 'CLOSED' },
  ],
};

export const BloombergWMQ = {
  name: 'World Market Monitor (WMQ)',
  args: { cols: 170, rows: 47 },
  argTypes: {
    cols: { control: 'number' },
    rows: { control: 'number' },
  },
  render: ({ cols, rows }) =>
    tuiStory({ cols, rows }, (grid) => {
      drawBloombergHeader(grid, 0, cols,
        'WMQ  World Equity Markets Monitor',
        'Apr 26 2026  10:34:22 EST');

      // Column header
      grid.fill(0, 1, cols, 1, ' ', BC.BG, BC.BG);
      seg(grid, 0, 2, cols, [
        ['  SECURITY'.padEnd(28), BC.CYAN],
        ['LAST PRICE'.padStart(14), BC.CYAN],
        ['    CHANGE'.padStart(14), BC.CYAN],
        ['      %CHG'.padStart(14), BC.CYAN],
        ['  TIME', BC.DIM],
      ]);
      drawBloombergSep(grid, 0, 3, cols);

      let row = 4;
      for (const [region, markets] of Object.entries(MARKETS)) {
        // Region header
        grid.fill(0, row, cols, 1, ' ', BC.HDRFG, '#221100');
        grid.text(2, row, '── ' + region.toUpperCase(), BC.FG, '#221100');
        row++;
        for (const m of markets) {
          drawMarketRow(grid, 0, row++, cols, m);
        }
      }

      // Fill remainder
      while (row < rows - 1) {
        grid.fill(0, row++, cols, 1, ' ', BC.BG, BC.BG);
      }

      drawFnKeyBar(grid, rows - 1, cols, FN_KEYS);
    }),
};

// ── Bloomberg GP — Price Chart ────────────────────────────────────────────────

const PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

function periodParams(period, basePrice, changePct) {
  const open = basePrice / (1 + changePct / 100);
  const configs = {
    '1D':  { count: 390,  vol: 0.6,  labels: ['9:30','10:00','11:00','12:00','13:00','14:00','15:00','16:00'] },
    '1W':  { count: 5,    vol: 3,    labels: ['Mon','Tue','Wed','Thu','Fri'] },
    '1M':  { count: 22,   vol: 5,    labels: ['Apr 1','Apr 7','Apr 14','Apr 21','Apr 26'] },
    '3M':  { count: 65,   vol: 7,    labels: ['Jan','Feb','Mar','Apr'] },
    '6M':  { count: 130,  vol: 10,   labels: ['Nov','Dec','Jan','Feb','Mar','Apr'] },
    '1Y':  { count: 252,  vol: 14,   labels: ['Apr25','Jul','Oct','Jan','Apr26'] },
    '5Y':  { count: 1260, vol: 25,   labels: ['2021','2022','2023','2024','2025','2026'] },
  };
  return { open, ...configs[period] };
}

export const BloombergGP = {
  name: 'Price Chart (GP)',
  args: {
    cols: 170, rows: 47,
    ticker: 'AAPL', company: 'Apple Inc',
    price: 189.34, changePct: 1.31,
    seed: 42, period: '1D',
  },
  argTypes: {
    cols:      { control: 'number' },
    rows:      { control: 'number' },
    ticker:    { control: 'text'   },
    company:   { control: 'text'   },
    price:     { control: 'number' },
    changePct: { control: { type: 'range', min: -15, max: 15, step: 0.01 } },
    seed:      { control: { type: 'range', min: 0, max: 999 } },
    period:    { control: { type: 'select', options: PERIODS } },
  },
  render: ({ cols, rows, ticker, company, price, changePct, seed, period }) => {
    const { open, count, vol } = periodParams(period, price, changePct);
    const prices = priceHistory(open, vol, count, seed);
    const last   = prices[prices.length - 1];
    const change = last - open;
    const high   = Math.max(...prices);
    const low    = Math.min(...prices);
    const dir    = change >= 0 ? '▲' : '▼';
    const cFg    = change >= 0 ? BC.UP : BC.DOWN;

    return tuiStory({ cols, rows }, (grid) => {
      // ── Header ──
      drawBloombergHeader(grid, 0, cols,
        ticker + ' US Equity   GP   Price Graph',
        'Apr 26 2026  10:34:22 EST');

      // ── Price info ──
      seg(grid, 0, 1, cols, [
        ['  ', BC.BG], [ticker + ' US Equity', BC.WHITE], ['    ', BC.BG],
        [company.toUpperCase(), BC.DIM], ['    ', BC.BG],
        [last.toFixed(2), BC.WHITE], ['  ', BC.BG],
        [dir + ' ', cFg],
        [`${change >= 0 ? '+' : ''}${change.toFixed(2)}  (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)`, cFg],
      ]);
      seg(grid, 0, 2, cols, [
        ['  HIGH: ', BC.CYAN], [high.toFixed(2), BC.UP], ['   ', BC.BG],
        ['LOW: ',  BC.CYAN],   [low.toFixed(2),  BC.DOWN], ['   ', BC.BG],
        ['OPEN: ', BC.CYAN],   [open.toFixed(2), BC.FG],
      ]);

      // ── Period selector ──
      drawPeriodSelector(grid, 0, 3, PERIODS, period);
      drawBloombergSep(grid, 0, 4, cols);

      // ── Full chart ──
      drawPriceChart(grid, 0, 5, cols, rows - 7, prices, open);

      // ── Separator + stats ──
      drawBloombergSep(grid, 0, rows - 2, cols);
      seg(grid, 0, rows - 1, cols, [
        ['  ', BC.BG],
        ['Period: ', BC.CYAN], [period.padEnd(5), BC.WHITE],
        ['  High: ', BC.CYAN], [high.toFixed(2), BC.UP],
        ['  Low: ',  BC.CYAN], [low.toFixed(2),  BC.DOWN],
        ['  Open: ', BC.CYAN], [open.toFixed(2), BC.FG],
        ['  Chg: ',  BC.CYAN], [change.toFixed(2), cFg],
        ['  ' + changePct.toFixed(2) + '%', cFg],
      ]);
    });
  },
};
