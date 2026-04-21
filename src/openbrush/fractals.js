import { path } from './utils.js';

const round = n => Math.round(n * 10000) / 10000;
const pt = (x, y) => `[${round(x)},${round(y)},0]`;

// --- Sierpinski Triangle ---
// Recursively subdivides a triangle. depth=4 → 81 triangles.

export function sierpinskiTriangle(x1, y1, x2, y2, x3, y3, depth) {
  if (depth === 0) {
    return path([[x1, y1], [x2, y2], [x3, y3], [x1, y1]]);
  }
  const m12 = [(x1 + x2) / 2, (y1 + y2) / 2];
  const m23 = [(x2 + x3) / 2, (y2 + y3) / 2];
  const m13 = [(x1 + x3) / 2, (y1 + y3) / 2];
  return [
    ...sierpinskiTriangle(x1, y1, m12[0], m12[1], m13[0], m13[1], depth - 1),
    ...sierpinskiTriangle(m12[0], m12[1], x2, y2, m23[0], m23[1], depth - 1),
    ...sierpinskiTriangle(m13[0], m13[1], m23[0], m23[1], x3, y3, depth - 1),
  ];
}

// --- Koch Snowflake ---
// Each side of an equilateral triangle is recursively replaced with a star bump.
// depth=3 → 4³=64 segments per side, drawn as one connected path per side.

function kochPoints(x1, y1, x2, y2, depth) {
  if (depth === 0) return [[x2, y2]];
  const dx = x2 - x1, dy = y2 - y1;
  const p1 = [x1 + dx / 3,     y1 + dy / 3];
  const p2 = [x1 + 2 * dx / 3, y1 + 2 * dy / 3];
  const angle = Math.atan2(dy, dx) - Math.PI / 3;
  const len   = Math.sqrt(dx * dx + dy * dy) / 3;
  const peak  = [p1[0] + len * Math.cos(angle), p1[1] + len * Math.sin(angle)];
  return [
    ...kochPoints(x1,    y1,    p1[0],   p1[1],   depth - 1),
    ...kochPoints(p1[0], p1[1], peak[0], peak[1], depth - 1),
    ...kochPoints(peak[0], peak[1], p2[0], p2[1], depth - 1),
    ...kochPoints(p2[0], p2[1], x2, y2,          depth - 1),
  ];
}

export function kochSnowflake(cx, cy, radius, depth = 3) {
  const verts = [0, 1, 2].map(i => {
    const a = i * 2 * Math.PI / 3 - Math.PI / 2;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  });
  const [v0, v1, v2] = verts;
  const allPts = [
    v0,
    ...kochPoints(v0[0], v0[1], v1[0], v1[1], depth),
    ...kochPoints(v1[0], v1[1], v2[0], v2[1], depth),
    ...kochPoints(v2[0], v2[1], v0[0], v0[1], depth),
  ];
  return path(allPts);
}

// --- Dragon Curve ---
// L-system: X → X+YF+, Y → -FX-Y. iterations=10 → 1024 F steps.
// Computes all absolute positions and sends as a single draw.path command.

export function dragonCurve(startX, startY, iterations, stepSize) {
  let seq = 'FX';
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const c of seq) {
      if (c === 'X') next += 'X+YF+';
      else if (c === 'Y') next += '-FX-Y';
      else next += c;
    }
    seq = next;
  }

  let x = startX, y = startY, angle = 0;
  const points = [[x, y]];
  for (const c of seq) {
    if (c === 'F') {
      x += stepSize * Math.cos(angle * Math.PI / 180);
      y += stepSize * Math.sin(angle * Math.PI / 180);
      points.push([x, y]);
    } else if (c === '+') {
      angle += 90;
    } else if (c === '-') {
      angle -= 90;
    }
  }
  return path(points);
}

// --- Hilbert Curve ---
// Recursive space-filling curve. order=4 → 256 points.

export function hilbertCurve(cx, cy, size, order) {
  const points = [];

  function hilbert(x, y, xi, xj, yi, yj, n) {
    if (n === 0) {
      points.push([x + (xi + yi) / 2, y + (xj + yj) / 2]);
    } else {
      hilbert(x,              y,              yi / 2,  yj / 2,  xi / 2,  xj / 2,  n - 1);
      hilbert(x + xi / 2,     y + xj / 2,     xi / 2,  xj / 2,  yi / 2,  yj / 2,  n - 1);
      hilbert(x + xi / 2 + yi / 2, y + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
      hilbert(x + xi / 2 + yi, y + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, n - 1);
    }
  }

  hilbert(cx - size / 2, cy - size / 2, size, 0, 0, size, order);
  return path(points);
}

// --- Barnsley Fern ---
// Iterated function system. Dots are batched as multiple draw.path params per GET request.

export function barnsleyFern(cx, cy, scale, iterations = 5000) {
  let x = 0, y = 0;
  const dots = [];

  for (let i = 0; i < iterations; i++) {
    const r = Math.random();
    let nx, ny;
    if (r < 0.01) {
      nx = 0;
      ny = 0.16 * y;
    } else if (r < 0.86) {
      nx =  0.85 * x + 0.04 * y;
      ny = -0.04 * x + 0.85 * y + 1.6;
    } else if (r < 0.93) {
      nx =  0.2 * x - 0.26 * y;
      ny =  0.23 * x + 0.22 * y + 1.6;
    } else {
      nx = -0.15 * x + 0.28 * y;
      ny =  0.26 * x + 0.24 * y + 0.44;
    }
    x = nx; y = ny;

    const sx = cx + (x / 2.5) * scale;
    const sy = cy + ((y - 5) / 5) * scale;
    // Three-point arc — ensures DrawNestedTrList adds the final endpoint
    dots.push(`draw.path=${pt(sx - 0.05, sy)},${pt(sx, sy + 0.05)},${pt(sx + 0.05, sy)}`);
  }

  // Batch 100 draw.path commands per entry — Open Brush splits on & and handles duplicates
  const BATCH = 100;
  const cmds = [];
  for (let i = 0; i < dots.length; i += BATCH) {
    cmds.push(dots.slice(i, i + BATCH).join('&'));
  }
  return cmds;
}
