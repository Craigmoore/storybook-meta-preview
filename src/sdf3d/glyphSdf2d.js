// Glyph SDF 2D — exact signed distance field from the Three.js JSON typeface
// font format. No extra dependencies: font data is fetched from the same CDN
// already used for Three.js (cdn.jsdelivr.net).
//
// Distances to quadratic bezier segments use an analytic cubic solve.
// Distances to cubic bezier segments use Newton-refined sampling.
// The sign is determined by the non-zero winding rule (correct for fonts with holes).

const FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json';

// ── Cubic root solver (Cardano) ───────────────────────────────────────────────
// Returns all real roots of at³ + bt² + ct + d = 0.

function solveCubic(a, b, c, d) {
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) return Math.abs(c) < 1e-12 ? [] : [-d / c];
    const disc = c * c - 4 * b * d;
    if (disc < 0) return [];
    const sq = Math.sqrt(disc);
    return [(-c + sq) / (2 * b), (-c - sq) / (2 * b)];
  }
  const B = b / a, C = c / a, D = d / a;
  const p = C - B * B / 3;
  const q = 2 * B * B * B / 27 - B * C / 3 + D;
  const disc = q * q / 4 + p * p * p / 27;

  if (disc > 1e-12) {
    const sq = Math.sqrt(disc);
    return [Math.cbrt(-q / 2 + sq) + Math.cbrt(-q / 2 - sq) - B / 3];
  }
  if (disc < -1e-12) {
    const r     = Math.sqrt(-p * p * p / 27);
    const theta = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
    const m     = 2 * Math.cbrt(r);
    return [
      m * Math.cos(theta / 3) - B / 3,
      m * Math.cos((theta + 2 * Math.PI) / 3) - B / 3,
      m * Math.cos((theta + 4 * Math.PI) / 3) - B / 3,
    ];
  }
  const u = Math.cbrt(-q / 2);
  return [2 * u - B / 3, -u - B / 3];
}

// ── Distance to primitives ────────────────────────────────────────────────────

function sdLine(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-12) return Math.hypot(px - ax, py - ay);
  const t  = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}

// Analytic closest point on a quadratic bezier B(t) = A(1-t)²+2Bt(1-t)+Ct².
// Reduces to: 2|c|²t³ + 3(b·c)t² + (2a·c+|b|²)t + a·b = 0
// where a = A-P, b = 2(B-A), c = A-2B+C.
function sdQuadBezier(px, py, ax, ay, bx, by, cx, cy) {
  const ax_ = ax - px, ay_ = ay - py;
  const bx_ = 2 * (bx - ax), by_ = 2 * (by - ay);
  const cx_ = ax - 2 * bx + cx, cy_ = ay - 2 * by + cy;

  const k3 = 2 * (cx_ * cx_ + cy_ * cy_);
  const k2 = 3 * (bx_ * cx_ + by_ * cy_);
  const k1 = bx_ * bx_ + by_ * by_ + 2 * (ax_ * cx_ + ay_ * cy_);
  const k0 = ax_ * bx_ + ay_ * by_;

  const candidates = [0, 1, ...solveCubic(k3, k2, k1, k0).filter(t => t > 0 && t < 1)];

  let best = Infinity;
  for (const t of candidates) {
    const tc = Math.max(0, Math.min(1, t)), s = 1 - tc;
    const qx = s * s * ax + 2 * s * tc * bx + tc * tc * cx;
    const qy = s * s * ay + 2 * s * tc * by + tc * tc * cy;
    best = Math.min(best, Math.hypot(px - qx, py - qy));
  }
  return best;
}

// Closest point on a cubic bezier via 20-sample init + Newton refinement.
function sdCubicBezier(px, py, ax, ay, c1x, c1y, c2x, c2y, bx, by) {
  let bd = Infinity, bt = 0;
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, s = 1 - t;
    const qx = s*s*s*ax + 3*s*s*t*c1x + 3*s*t*t*c2x + t*t*t*bx;
    const qy = s*s*s*ay + 3*s*s*t*c1y + 3*s*t*t*c2y + t*t*t*by;
    const d  = (px - qx) ** 2 + (py - qy) ** 2;
    if (d < bd) { bd = d; bt = t; }
  }
  for (let iter = 0; iter < 5; iter++) {
    const t = Math.max(1e-4, Math.min(1 - 1e-4, bt)), s = 1 - t;
    const ex  = s*s*s*ax + 3*s*s*t*c1x + 3*s*t*t*c2x + t*t*t*bx - px;
    const ey  = s*s*s*ay + 3*s*s*t*c1y + 3*s*t*t*c2y + t*t*t*by - py;
    const d1x = 3*s*s*(c1x-ax) + 6*s*t*(c2x-c1x) + 3*t*t*(bx-c2x);
    const d1y = 3*s*s*(c1y-ay) + 6*s*t*(c2y-c1y) + 3*t*t*(by-c2y);
    const d2x = 6*s*(c2x-2*c1x+ax) + 6*t*(bx-2*c2x+c1x);
    const d2y = 6*s*(c2y-2*c1y+ay) + 6*t*(by-2*c2y+c1y);
    const f = ex*d1x + ey*d1y;
    const g = ex*d2x + ey*d2y + d1x*d1x + d1y*d1y;
    if (Math.abs(g) < 1e-12) break;
    bt -= f / g;
  }
  const t = Math.max(0, Math.min(1, bt)), s = 1 - t;
  const qx = s*s*s*ax + 3*s*s*t*c1x + 3*s*t*t*c2x + t*t*t*bx;
  const qy = s*s*s*ay + 3*s*s*t*c1y + 3*s*t*t*c2y + t*t*t*by;
  return Math.hypot(px - qx, py - qy);
}

// ── Winding number ────────────────────────────────────────────────────────────

function windingLine(px, py, ax, ay, bx, by) {
  if ((ay > py) !== (by > py)) {
    const t = (py - ay) / (by - ay);
    if (px < ax + t * (bx - ax)) return by > ay ? 1 : -1;
  }
  return 0;
}

function windingQuad(px, py, ax, ay, bx, by, cx, cy) {
  const A = ay - 2 * by + cy, B = 2 * (by - ay), C = ay - py;
  const roots = Math.abs(A) < 1e-10
    ? (Math.abs(B) < 1e-10 ? [] : [-C / B])
    : (() => {
        const disc = B * B - 4 * A * C;
        if (disc < 0) return [];
        const sq = Math.sqrt(disc);
        return [(-B + sq) / (2 * A), (-B - sq) / (2 * A)];
      })();
  let w = 0;
  for (const t of roots) {
    if (t < 0 || t > 1) continue;
    const s = 1 - t;
    const ix = s * s * ax + 2 * s * t * bx + t * t * cx;
    if (px < ix) w += 2 * (1 - t) * (by - ay) + 2 * t * (cy - by) > 0 ? 1 : -1;
  }
  return w;
}

function windingCubic(px, py, ax, ay, c1x, c1y, c2x, c2y, bx, by) {
  let w = 0, lx = ax, ly = ay;
  for (let i = 1; i <= 16; i++) {
    const t = i / 16, s = 1 - t;
    const nx = s*s*s*ax + 3*s*s*t*c1x + 3*s*t*t*c2x + t*t*t*bx;
    const ny = s*s*s*ay + 3*s*s*t*c1y + 3*s*t*t*c2y + t*t*t*by;
    w += windingLine(px, py, lx, ly, nx, ny);
    lx = nx; ly = ny;
  }
  return w;
}

// ── Font loading ──────────────────────────────────────────────────────────────

const fontCache = {};

export async function loadThreeFont(url = FONT_URL) {
  if (fontCache[url]) return fontCache[url];
  const res  = await fetch(url);
  fontCache[url] = await res.json();
  return fontCache[url];
}

// ── Path parsing ──────────────────────────────────────────────────────────────
// Three.js typeface JSON 'o' field: space-separated commands
//   m x y          moveto (starts new subpath)
//   l x y          lineto
//   q cpx cpy x y  quadratic bezier
//   b c1x c1y c2x c2y x y  cubic bezier

function parseSegments(glyph) {
  const cmds = glyph.o ? glyph.o.split(' ') : [];
  const segs = [];
  let i = 0, x = 0, y = 0, sx = 0, sy = 0;

  while (i < cmds.length) {
    const cmd = cmds[i++];
    if (cmd === 'm') {
      // Close previous subpath if needed
      if (segs.length && (x !== sx || y !== sy)) {
        segs.push({ type: 'l', x0: x, y0: y, x1: sx, y1: sy });
      }
      x = parseFloat(cmds[i++]); y = parseFloat(cmds[i++]);
      sx = x; sy = y;
    } else if (cmd === 'l') {
      const nx = parseFloat(cmds[i++]), ny = parseFloat(cmds[i++]);
      segs.push({ type: 'l', x0: x, y0: y, x1: nx, y1: ny });
      x = nx; y = ny;
    } else if (cmd === 'q') {
      const cpx = parseFloat(cmds[i++]), cpy = parseFloat(cmds[i++]);
      const nx  = parseFloat(cmds[i++]), ny  = parseFloat(cmds[i++]);
      segs.push({ type: 'q', x0: x, y0: y, cpx, cpy, x1: nx, y1: ny });
      x = nx; y = ny;
    } else if (cmd === 'b') {
      const c1x = parseFloat(cmds[i++]), c1y = parseFloat(cmds[i++]);
      const c2x = parseFloat(cmds[i++]), c2y = parseFloat(cmds[i++]);
      const nx  = parseFloat(cmds[i++]), ny  = parseFloat(cmds[i++]);
      segs.push({ type: 'b', x0: x, y0: y, c1x, c1y, c2x, c2y, x1: nx, y1: ny });
      x = nx; y = ny;
    }
  }
  // Close last subpath
  if (segs.length && (x !== sx || y !== sy)) {
    segs.push({ type: 'l', x0: x, y0: y, x1: sx, y1: sy });
  }
  return segs;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Build an exact 2D SDF for a text string from a loaded Three.js typeface font.
 * fontData   result of loadThreeFont()
 * text       string to render
 * opts.worldWidth / worldHeight  world-space bounding box (default 3 × 2)
 */
export function textToGlyphSdf2D(fontData, text, opts = {}) {
  const { worldWidth = 3, worldHeight = 2 } = opts;
  const res  = fontData.resolution ?? 1000;
  const asc  = fontData.ascender   ?? 800;
  const desc = fontData.descender  ?? -200;

  // Scale so the ascender–descender span fits in worldHeight
  const scale = worldHeight / (asc - desc);

  // Collect segments for each character, tracking horizontal advance
  let xAdv = 0;
  const charSegs = [];
  for (const ch of text) {
    const glyph = fontData.glyphs[ch] ?? fontData.glyphs['?'];
    if (!glyph) { xAdv += res * 0.5; continue; }
    charSegs.push({ segs: parseSegments(glyph), xOff: xAdv });
    xAdv += glyph.ha ?? res * 0.6;
  }

  // Centre the text block in world space
  const totalW = xAdv * scale;
  const xShift = -totalW / 2;
  const yShift = -(asc + desc) / 2 * scale;

  const allSegs = charSegs.flatMap(({ segs, xOff }) =>
    segs.map(s => ({ ...s, xOff }))
  );

  return (wx, wy) => {
    // World coords → font units
    const fx = (wx - xShift) / scale;
    const fy = (wy - yShift) / scale;

    let minDist = Infinity, winding = 0;

    for (const s of allSegs) {
      const ox = s.xOff;
      if (s.type === 'l') {
        minDist = Math.min(minDist, sdLine(fx, fy, s.x0+ox, s.y0, s.x1+ox, s.y1));
        winding += windingLine(fx, fy, s.x0+ox, s.y0, s.x1+ox, s.y1);
      } else if (s.type === 'q') {
        minDist = Math.min(minDist, sdQuadBezier(fx, fy, s.x0+ox, s.y0, s.cpx+ox, s.cpy, s.x1+ox, s.y1));
        winding += windingQuad(fx, fy, s.x0+ox, s.y0, s.cpx+ox, s.cpy, s.x1+ox, s.y1);
      } else if (s.type === 'b') {
        minDist = Math.min(minDist, sdCubicBezier(fx, fy, s.x0+ox, s.y0, s.c1x+ox, s.c1y, s.c2x+ox, s.c2y, s.x1+ox, s.y1));
        winding += windingCubic(fx, fy, s.x0+ox, s.y0, s.c1x+ox, s.c1y, s.c2x+ox, s.c2y, s.x1+ox, s.y1);
      }
    }

    return (winding !== 0 ? -1 : 1) * minDist * scale;
  };
}
