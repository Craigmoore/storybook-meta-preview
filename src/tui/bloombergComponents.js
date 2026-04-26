// Shared drawing primitives for Bloomberg Terminal-style layouts.
// Amber-on-black colour language; function-key navigation.

export const BC = {
  BG:      '#000000',
  FG:      '#ffaa00',   // amber primary
  DIM:     '#886600',   // dim amber
  WHITE:   '#ffffff',
  HDRBG:   '#ff8800',   // orange header background
  HDRFG:   '#000000',   // black on orange
  UP:      '#00ff44',   // price up
  DOWN:    '#ff3333',   // price down
  FLAT:    '#aaaaaa',
  CYAN:    '#00cccc',   // labels / keys
  MAGENTA: '#ff44ff',
  BLUE:    '#4488ff',
  SEP:     '#443300',
  YELLOW:  '#ffff00',
  ORANGE:  '#ff8800',
  GRID:    '#111100',   // faint chart grid dots
};

export function seg(grid, gx, gy, maxX, parts) {
  let cx = gx;
  for (const [t, fg, bg = BC.BG] of parts) {
    for (let i = 0; i < t.length && cx < maxX; i++, cx++) {
      grid.put(cx, gy, t[i], fg, bg);
    }
    if (cx >= maxX) break;
  }
}

// ── Seeded price data generator ───────────────────────────────────────────────

export function priceHistory(basePrice, volatility, count, seed) {
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const prices = [basePrice];
  for (let i = 1; i < count; i++) {
    const chg = (rand() - 0.485) * volatility;
    prices.push(Math.max(basePrice * 0.6, prices[i - 1] + chg));
  }
  return prices;
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

export function drawBloombergHeader(grid, y, cols, left, right) {
  grid.fill(0, y, cols, 1, ' ', BC.HDRFG, BC.HDRBG);
  grid.text(2, y, left, BC.HDRFG, BC.HDRBG);
  grid.text(cols - right.length - 2, y, right, BC.HDRFG, BC.HDRBG);
}

// Block-char sparkline — values is array of numbers
export function drawSparkline(grid, x, y, w, values) {
  const BLOCKS = ' ▁▂▃▄▅▆▇█';
  if (!values || !values.length) return;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  for (let i = 0; i < w; i++) {
    const idx = Math.min(Math.floor(i * values.length / w), values.length - 1);
    const norm = (values[idx] - min) / range;
    const bi   = Math.min(8, Math.round(norm * 8));
    const fg   = norm < 0.33 ? BC.DOWN : norm > 0.66 ? BC.UP : BC.FG;
    grid.put(x + i, y, BLOCKS[bi], fg, BC.BG);
  }
}

// Function-key navigation bar — keys = [{ key, label }]
export function drawFnKeyBar(grid, y, cols, keys) {
  grid.fill(0, y, cols, 1, ' ', BC.FG, '#110f00');
  let x = 0;
  for (const { key, label } of keys) {
    grid.text(x, y, key, BC.WHITE, '#110f00');
    grid.text(x + key.length, y, label, BC.HDRFG, BC.HDRBG);
    x += key.length + label.length + 1;
    if (x >= cols) break;
  }
}

export function drawBloombergSep(grid, x, y, w) {
  grid.fill(x, y, w, 1, '─', BC.SEP, BC.BG);
}

export function drawSectionLabel(grid, x, y, w, label) {
  grid.fill(x, y, w, 1, ' ', BC.HDRFG, '#221100');
  grid.text(x + 1, y, label, BC.HDRFG, '#221100');
}

// ── Molecules ─────────────────────────────────────────────────────────────────

// Full quote header — 5 rows
// q = { ticker, company, exchange, currency, sector,
//       price, change, changePct, open, high, low, prevClose, high52, low52 }
export function drawQuoteHeader(grid, x, y, w, q) {
  const mx  = x + w;
  const dir = q.change >= 0 ? '▲' : '▼';
  const cFg = q.change >= 0 ? BC.UP : BC.DOWN;
  const chStr = `${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)}`;
  const pctStr = `(${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%)`;

  seg(grid, x, y,   mx, [['  ', BC.BG], [q.ticker + ' US Equity', BC.WHITE], ['  ', BC.BG], [q.company.toUpperCase(), BC.FG]]);
  seg(grid, x, y+1, mx, [['  ', BC.BG], [q.exchange + '   ' + q.currency + '   ' + q.sector, BC.DIM]]);
  seg(grid, x, y+2, mx, [
    ['  ', BC.BG], [q.price.toFixed(2).padStart(10), BC.WHITE], ['   ', BC.BG],
    [dir + ' ', cFg], [chStr + '  ' + pctStr, cFg],
  ]);
  seg(grid, x, y+3, mx, [
    ['  OPEN: ', BC.CYAN], [q.open.toFixed(2), BC.FG], ['   ', BC.BG],
    ['HIGH: ', BC.CYAN],   [q.high.toFixed(2), BC.UP], ['   ', BC.BG],
    ['LOW: ',  BC.CYAN],   [q.low.toFixed(2),  BC.DOWN], ['   ', BC.BG],
    ['PREV: ', BC.CYAN],   [q.prevClose.toFixed(2), BC.FG],
  ]);
  seg(grid, x, y+4, mx, [
    ['  52W H: ', BC.CYAN], [q.high52.toFixed(2), BC.UP], ['   ', BC.BG],
    ['52W L: ', BC.CYAN],   [q.low52.toFixed(2),  BC.DOWN],
  ]);
}

// Key stats list — stats = [{ label, value, fg? }]
export function drawKeyStats(grid, x, y, stats) {
  const mx = grid.cols;
  for (let i = 0; i < stats.length; i++) {
    const { label, value, fg = BC.FG } = stats[i];
    seg(grid, x, y + i, mx, [
      ['  ', BC.BG], [(label + ':').padEnd(16), BC.CYAN], [String(value), fg],
    ]);
  }
}

// Order book — asks/bids = [[price, size], ...] asks: low→high, bids: high→low
export function drawOrderBook(grid, x, y, w, asks, bids) {
  const mx = x + w;
  drawSectionLabel(grid, x, y, w, 'ORDER BOOK');
  seg(grid, x, y+1, mx, [['  ', BC.BG], ['PRICE'.padStart(9), BC.DIM], ['   ', BC.BG], ['SIZE'.padStart(7), BC.DIM]]);
  for (let i = asks.length - 1; i >= 0; i--) {
    const [p, s] = asks[i];
    seg(grid, x, y + 2 + (asks.length - 1 - i), mx, [
      ['  ', BC.BG], [p.toFixed(2).padStart(9), BC.DOWN], ['   ', BC.BG], [String(s).padStart(7), BC.FG],
    ]);
  }
  const midRow = y + 2 + asks.length;
  grid.fill(x, midRow, w, 1, '─', BC.SEP, BC.BG);
  for (let i = 0; i < bids.length; i++) {
    const [p, s] = bids[i];
    seg(grid, x, midRow + 1 + i, mx, [
      ['  ', BC.BG], [p.toFixed(2).padStart(9), BC.UP], ['   ', BC.BG], [String(s).padStart(7), BC.FG],
    ]);
  }
}

// News headlines — headlines = [{ time, source, text }]
export function drawNewsHeadlines(grid, x, y, w, headlines) {
  const mx = x + w;
  drawSectionLabel(grid, x, y, w, 'TOP STORIES');
  for (let i = 0; i < headlines.length; i++) {
    const { time, source, text } = headlines[i];
    const available = w - time.length - source.length - 5;
    seg(grid, x, y + 1 + i, mx, [
      [' ' + time + ' ', BC.DIM],
      ['[' + source + '] ', BC.CYAN],
      [text.substring(0, available), i === 0 ? BC.WHITE : BC.FG],
    ]);
  }
}

// Single market row for WMQ
// m = { name, last, change, changePct, time }
export function drawMarketRow(grid, x, y, w, m) {
  const mx  = x + w;
  const dir = m.change >= 0 ? '▲' : '▼';
  const cFg = m.change >= 0 ? BC.UP : BC.DOWN;
  const ch  = `${m.change >= 0 ? '+' : ''}${m.change}`;
  const pct = `${m.changePct >= 0 ? '+' : ''}${m.changePct}%`;
  seg(grid, x, y, mx, [
    ['  ', BC.BG],
    [m.name.padEnd(26), BC.FG],
    [m.last.padStart(14), BC.WHITE],
    ['  ', BC.BG], [dir + ' ', cFg],
    [ch.padStart(10), cFg],
    ['  (', BC.DIM], [pct, cFg], [')'.padEnd(7), BC.DIM],
    [m.time, BC.DIM],
  ]);
}

// Period selector tab bar — periods = ['1D','1W','1M',...], active = '1D'
export function drawPeriodSelector(grid, x, y, periods, active) {
  let cx = x + 2;
  for (const p of periods) {
    const isActive = p === active;
    const fg = isActive ? BC.HDRFG : BC.DIM;
    const bg = isActive ? BC.HDRBG : BC.BG;
    grid.put(cx, y, '[', isActive ? BC.HDRBG : BC.SEP, BC.BG);
    grid.text(cx + 1, y, p, fg, bg);
    grid.put(cx + 1 + p.length, y, ']', isActive ? BC.HDRBG : BC.SEP, BC.BG);
    cx += p.length + 3;
  }
}

// ASCII line chart — prices array, open is the reference price for color
export function drawPriceChart(grid, x, y, w, h, prices, open) {
  if (!prices || !prices.length) return;

  const LABEL_W = 9;
  const chartX  = x + LABEL_W;
  const chartW  = w - LABEL_W;
  const chartH  = h - 2;

  const min = Math.min(...prices) * 0.9995;
  const max = Math.max(...prices) * 1.0005;
  const range = max - min || 1;

  grid.fill(x, y, w, h, ' ', BC.FG, BC.BG);

  // Compute grid-line rows
  const GRID_LINES = 6;
  const gridRows = new Set();
  for (let i = 0; i <= GRID_LINES; i++) {
    gridRows.add(Math.round(i * (chartH - 1) / GRID_LINES));
  }

  // Faint horizontal grid dots
  for (const row of gridRows) {
    if (row > 0 && row < chartH - 1) {
      for (let cx = chartX; cx < x + w; cx++) grid.put(cx, y + row, '·', BC.GRID, BC.BG);
    }
  }

  // Y-axis labels and ticks
  for (let i = 0; i <= GRID_LINES; i++) {
    const row   = Math.round(i * (chartH - 1) / GRID_LINES);
    const price = max - (row / (chartH - 1)) * range;
    grid.text(x, y + row, price.toFixed(2).padStart(LABEL_W - 1), BC.DIM, BC.BG);
    grid.put(chartX - 1, y + row, '┤', BC.SEP, BC.BG);
  }
  for (let row = 0; row < chartH; row++) {
    if (!gridRows.has(row)) grid.put(chartX - 1, y + row, '│', BC.SEP, BC.BG);
  }

  // Resample to chartW
  const samples = Array.from({ length: chartW }, (_, i) => {
    const idx = Math.min(Math.floor(i * prices.length / chartW), prices.length - 1);
    return prices[idx];
  });

  const toRow = (p) => Math.min(chartH - 1, Math.max(0, Math.round((max - p) / range * (chartH - 1))));

  for (let i = 0; i < chartW; i++) {
    const p  = samples[i];
    const pn = i + 1 < chartW ? samples[i + 1] : p;
    const r  = toRow(p);
    const rn = toRow(pn);
    const fg = p >= open ? BC.UP : BC.DOWN;

    if (r === rn) {
      grid.put(chartX + i, y + r, '─', fg, BC.BG);
    } else if (rn < r) {
      grid.put(chartX + i, y + r, '╱', fg, BC.BG);
      for (let ri = rn + 1; ri < r; ri++) grid.put(chartX + i, y + ri, '│', fg, BC.BG);
    } else {
      grid.put(chartX + i, y + r, '╲', fg, BC.BG);
      for (let ri = r + 1; ri < rn; ri++) grid.put(chartX + i, y + ri, '│', fg, BC.BG);
    }
  }

  // X axis
  grid.fill(chartX - 1, y + chartH, chartW + 1, 1, '─', BC.SEP, BC.BG);
  grid.put(chartX - 1, y + chartH, '└', BC.SEP, BC.BG);

  // Time labels
  const tLabels = ['9:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:00'];
  for (let i = 0; i < tLabels.length; i++) {
    const tx = chartX + Math.round(i * (chartW - 1) / (tLabels.length - 1));
    if (tx + tLabels[i].length <= x + w) grid.text(tx, y + chartH + 1, tLabels[i], BC.DIM, BC.BG);
  }
}
