import { tuiStory } from '../story.js';
import {
  BC, seg, priceHistory,
  drawQuoteHeader, drawKeyStats, drawOrderBook,
  drawNewsHeadlines, drawMarketRow, drawPriceChart,
} from '../bloombergComponents.js';

export default { title: 'TUI/Molecules/Bloomberg' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ── Quote Header ──────────────────────────────────────────────────────────────

export const QuoteHeader = {
  args: {
    cols: 130, rows: 10,
    ticker: 'AAPL', company: 'Apple Inc', exchange: 'NASDAQ NMS',
    price: 189.34, changePct: 1.31, seed: 42,
  },
  argTypes: {
    cols:      { control: 'number' }, rows:    { control: 'number' },
    ticker:    { control: 'text'   }, company: { control: 'text'   },
    exchange:  { control: 'text'   },
    price:     { control: 'number' },
    changePct: range(-15, 15, 0.01),
    seed:      range(0, 999),
  },
  render: ({ cols, rows, ticker, company, exchange, price, changePct, seed }) => {
    const prices = priceHistory(price, price * 0.007, 390, seed);
    const open   = prices[0];
    const high   = Math.max(...prices);
    const low    = Math.min(...prices);
    const change = price - open;
    return tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor((rows - 5) / 2);
      drawQuoteHeader(grid, 0, y, cols, {
        ticker, company, exchange, currency: 'USD', sector: 'Technology',
        price, change, changePct,
        open, high, low, prevClose: open,
        high52: price * 1.048, low52: price * 0.752,
      });
    });
  },
};

// ── Key Statistics ────────────────────────────────────────────────────────────

export const KeyStatistics = {
  args: { cols: 55, rows: 20, price: 189.34 },
  argTypes: {
    cols:  { control: 'number' },
    rows:  { control: 'number' },
    price: { control: 'number' },
  },
  render: ({ cols, rows, price }) => {
    const mktCap = price * 15.34e9;
    const fmtB = (n) => n >= 1e12 ? (n / 1e12).toFixed(2) + 'T' : n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : (n / 1e6).toFixed(0) + 'M';
    return tuiStory({ cols, rows }, (grid) => {
      drawKeyStats(grid, 1, 1, [
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
        { label: 'Beta',         value: '1.24',  fg: BC.FG },
        { label: 'Div Yield',    value: '0.53%', fg: BC.UP },
      ]);
    });
  },
};

// ── Order Book ────────────────────────────────────────────────────────────────

export const OrderBook = {
  args: { cols: 55, rows: 20, midPrice: 189.36, spread: 0.01, seed: 42 },
  argTypes: {
    cols:     { control: 'number' },
    rows:     { control: 'number' },
    midPrice: { control: 'number' },
    spread:   range(0.01, 2, 0.01),
    seed:     range(0, 999),
  },
  render: ({ cols, rows, midPrice, spread, seed }) => {
    let s = seed >>> 0;
    const rand = (max = 1000) => { s = (s * 1664525 + 1013904223) >>> 0; return Math.floor((s >>> 0) / 0xffffffff * max) + 100; };
    const asks = Array.from({ length: 5 }, (_, i) => [midPrice + spread + i * spread, rand()]);
    const bids = Array.from({ length: 5 }, (_, i) => [midPrice - i * spread, rand()]);
    return tuiStory({ cols, rows }, (grid) => {
      drawOrderBook(grid, 0, 0, cols, asks, bids);
    });
  },
};

// ── News Headlines ────────────────────────────────────────────────────────────

export const NewsHeadlines = {
  args: { cols: 130, rows: 12 },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },
  render: ({ cols, rows }) =>
    tuiStory({ cols, rows }, (grid) => {
      drawNewsHeadlines(grid, 0, 0, cols, [
        { time: '10:34', source: 'BBG', text: 'Apple reports record Q2 earnings; iPhone revenue beats estimates by 4%' },
        { time: '10:21', source: 'WSJ', text: 'Fed signals two rate cuts in 2026 as inflation cools to 2.3%' },
        { time: '09:58', source: 'FT',  text: "EU regulators approve Apple's proposed App Store changes after two-year review" },
        { time: '09:44', source: 'BBG', text: 'AAPL options market implies 5.2% move on earnings; largest since 2020' },
        { time: '09:30', source: 'RTR', text: 'Markets open higher; S&P 500 futures up 0.4% ahead of payrolls data' },
      ]);
    }),
};

// ── Market Row ────────────────────────────────────────────────────────────────

export const MarketRowStory = {
  name: 'MarketRow',
  args: {
    cols: 120, rows: 10,
    name: 'S&P 500 Futures', last: '5,234.56', change: 23.45, changePct: 0.45, time: '10:34',
  },
  argTypes: {
    cols:      { control: 'number' }, rows:      { control: 'number' },
    name:      { control: 'text'   }, last:      { control: 'text' },
    change:    range(-500, 500, 0.01),
    changePct: range(-15, 15, 0.01),
    time:      { control: 'text' },
  },
  render: ({ cols, rows, name, last, change, changePct, time }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor(rows / 2);
      const headers = ['  SECURITY'.padEnd(28), 'LAST'.padStart(14), '  CHG'.padStart(14), '   %CHG'.padStart(14), '  TIME'];
      let cx = 0;
      for (const h of headers) { grid.text(cx, y - 1, h, BC.CYAN, BC.BG); cx += h.length; }
      drawMarketRow(grid, 0, y, cols, { name, last, change, changePct, time });
    }),
};

// ── Mini Chart ────────────────────────────────────────────────────────────────

export const MiniChart = {
  args: {
    cols: 120, rows: 18,
    basePrice: 189.34, changePct: 1.31, seed: 42, volatility: 1.5,
  },
  argTypes: {
    cols:       { control: 'number' },
    rows:       { control: 'number' },
    basePrice:  { control: 'number' },
    changePct:  range(-15, 15, 0.01),
    seed:       range(0, 999),
    volatility: range(0.1, 10, 0.1),
  },
  render: ({ cols, rows, basePrice, changePct, seed, volatility }) => {
    const open   = basePrice / (1 + changePct / 100);
    const prices = priceHistory(open, volatility, 390, seed);
    return tuiStory({ cols, rows }, (grid) => {
      drawPriceChart(grid, 0, 0, cols, rows - 1, prices, open);
    });
  },
};
