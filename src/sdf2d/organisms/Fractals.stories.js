import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Organisms/Fractals' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── Road Network ─────────────────────────────────────────────────────────────
// Seeded procedural road network. An LCG drives per-segment angle deviation,
// length variation, and branching decisions so the same seed always produces
// the same layout. Roads → sdCapsule; junction nodes → sdCircle (slightly wider
// than the road) to smooth out joins. All geometry inlined as GLSL literals.
export const RoadNetwork = {
  args: { seed: 42, depth: 5, roadWidth: 0.020, spread: 40, ...display },
  argTypes: {
    seed:      { control: { type: 'range', min: 0,     max: 9999,  step: 1 } },
    depth:     { control: { type: 'range', min: 2,     max: 7,     step: 1 } },
    roadWidth: { control: { type: 'range', min: 0.008, max: 0.040, step: 0.001 } },
    spread:    { control: { type: 'range', min: 10,    max: 70,    step: 5 } },
    ...displayType,
  },
  render: ({ seed, depth, roadWidth, spread, display }) => {
    let s = seed | 0;
    const rand = () => {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      return (s >>> 0) / 0x100000000;
    };

    const segs = [], junctions = [];

    const grow = (x, y, angle, len, d) => {
      if (d <= 0 || len < 0.04) return;
      const a   = angle + (rand() - 0.5) * spread * Math.PI / 180;
      const seg = len * (0.65 + rand() * 0.55);
      const tx  = x + Math.cos(a) * seg;
      const ty  = y + Math.sin(a) * seg;
      if (Math.abs(tx) > 0.50 || Math.abs(ty) > 0.50) return;
      segs.push([x, y, tx, ty]);
      junctions.push([tx, ty]);
      const r = rand();
      if (r < 0.12) {
        // dead end
      } else if (r < 0.45 || d <= 1) {
        grow(tx, ty, a, len * 0.82, d - 1);
      } else {
        const ba   = (25 + rand() * 45) * Math.PI / 180;
        const side = rand() > 0.5 ? 1 : -1;
        grow(tx, ty, a + ba * side, len * 0.78, d - 1);
        if (rand() > 0.35) {
          grow(tx, ty, a - ba * side, len * 0.72, d - 1);
        } else {
          grow(tx, ty, a + (rand() - 0.5) * 0.4, len * 0.80, d - 1);
        }
      }
    };

    const rootCount = 3 + (rand() * 2 | 0);
    for (let i = 0; i < rootCount; i++) {
      grow(0, 0, (i / rootCount) * Math.PI * 2 + (rand() - 0.5) * 0.6, 0.28, depth);
    }
    junctions.push([0, 0]);

    const rw = roadWidth.toFixed(4);
    const jr = (roadWidth * 1.35).toFixed(4);
    const f  = v => v.toFixed(5);
    const decls = [
      ...segs.map((s, i) =>
        `float s${i} = sdCapsule(p, vec2(${f(s[0])},${f(s[1])}), vec2(${f(s[2])},${f(s[3])}), ${rw});`),
      ...junctions.map((j, i) =>
        `float j${i} = sdCircle(p - vec2(${f(j[0])},${f(j[1])}), ${jr});`),
    ];
    const names = [...segs.map((_, i) => `s${i}`), ...junctions.map((_, i) => `j${i}`)];
    const union = names.length === 0
      ? 'float d = 1.0;'
      : ['float d = ' + names[0] + ';', ...names.slice(1).map(n => `d = opUnion(d, ${n});`)].join('\n        ');

    return sdfStory(`
      vec3 render(vec2 p) {
        ${decls.join('\n        ')}
        ${union}
        return ${col(display)};
      }
    `);
  },
};

// ── Koch Snowflake ────────────────────────────────────────────────────────────
// JS subdivides segments: each edge → 4 (keep outer thirds, replace middle with
// equilateral bump). CCW triangle + rotate(−60°) = outward bumps. At iter N,
// 3×4^N capsules are inlined as GLSL literals — same pattern as WireframeTriangle.
// Koch bump apices always land on the original circumscribed circle, so the
// snowflake stays within canvas for size ≤ 0.45 at any iteration depth.
export const KochSnowflake = {
  args: { iterations: 2, size: 0.40, thickness: 0.008, ...display },
  argTypes: {
    iterations: { control: { type: 'range', min: 0, max: 3, step: 1 } },
    size:       { control: { type: 'range', min: 0.15, max: 0.45, step: 0.01 } },
    thickness:  { control: { type: 'range', min: 0.002, max: 0.025, step: 0.001 } },
    ...displayType,
  },
  render: ({ iterations, size, thickness, display }) => {
    const R   = size;
    const s60 = Math.sqrt(3) / 2;
    const vx  = R * s60;
    const c60 = 0.5;

    const subdivide = (segs) => {
      const out = [];
      for (const [ax, ay, bx, by] of segs) {
        const dx = (bx - ax) / 3, dy = (by - ay) / 3;
        const p1x = ax + dx,       p1y = ay + dy;
        const p3x = ax + 2 * dx,   p3y = ay + 2 * dy;
        const rx  = c60 * dx + s60 * dy;   // rotate(d, −60°) → outward apex
        const ry  = -s60 * dx + c60 * dy;
        const p2x = p1x + rx,      p2y = p1y + ry;
        out.push([ax, ay, p1x, p1y], [p1x, p1y, p2x, p2y],
                 [p2x, p2y, p3x, p3y], [p3x, p3y, bx, by]);
      }
      return out;
    };

    let segs = [
      [0, R, -vx, -R * 0.5],             // top → BL  (CCW)
      [-vx, -R * 0.5, vx, -R * 0.5],     // BL → BR
      [vx, -R * 0.5, 0, R],              // BR → top
    ];
    for (let i = 0; i < iterations; i++) segs = subdivide(segs);

    const th = thickness.toFixed(4);
    const f  = v => v.toFixed(4);
    const decls = segs.map((s, i) =>
      `float s${i} = sdCapsule(p, vec2(${f(s[0])},${f(s[1])}), vec2(${f(s[2])},${f(s[3])}), ${th});`
    );
    const union = [
      'float d = s0;',
      ...segs.slice(1).map((_, i) => `d = opUnion(d, s${i + 1});`),
    ].join('\n      ');

    return sdfStory(`
      vec3 render(vec2 p) {
        ${decls.join('\n        ')}
        ${union}
        return ${col(display)};
      }
    `);
  },
};

// ── Sierpinski Triangle ───────────────────────────────────────────────────────
// IFS nearest-vertex iteration: at each step, find which sub-triangle the pixel
// is in (nearest vertex), apply the inverse map p = 2p − v to zoom in on it,
// accumulate scale. Final SDF = sdEquilateralTriangle / 2^N.
// r = R*√3/2 so the SDF's vertices align exactly with the IFS vertex positions.
export const Sierpinski = {
  args: { iterations: 5, size: 0.42, ...display },
  argTypes: {
    iterations: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    size:       { control: { type: 'range', min: 0.15, max: 0.48, step: 0.01 } },
    ...displayType,
  },
  render: ({ iterations, size, display }) => {
    const vty = size.toFixed(4);
    const vbx = (size * 0.866025).toFixed(4);
    const vby = (size * 0.5).toFixed(4);
    const r   = (size * 0.866025).toFixed(4);

    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  va    = vec2(0.0,    ${vty});
        vec2  vb    = vec2(-${vbx}, -${vby});
        vec2  vc    = vec2( ${vbx}, -${vby});
        float scale = 1.0;
        for (int i = 0; i < ${iterations}; i++) {
          float da = dot(p - va, p - va);
          float db = dot(p - vb, p - vb);
          float dc = dot(p - vc, p - vc);
          if      (da < db && da < dc) { p = 2.0 * p - va; }
          else if (db < dc)            { p = 2.0 * p - vb; }
          else                         { p = 2.0 * p - vc; }
          scale *= 2.0;
        }
        float d = sdEquilateralTriangle(p, ${r}) / scale;
        return ${col(display)};
      }
    `);
  },
};

// ── Sierpinski Carpet ─────────────────────────────────────────────────────────
// Square analogue of the Sierpinski triangle. At each iteration, tile the plane
// with the current cell size and carve out the centre third using sdBox:
//   q  = mod(p·sc + sz, 2·sz) − sz   (normalise p into one tile)
//   d  = max(d, −sdBox(q, sz/3) / sc) (subtract centre hole, scale back)
// sc doubles every iteration; already-removed cells stay positive so they are
// unaffected by subsequent max() calls.
export const SierpinskiCarpet = {
  args: { iterations: 4, size: 0.42, ...display },
  argTypes: {
    iterations: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    size:       { control: { type: 'range', min: 0.15, max: 0.48, step: 0.01 } },
    ...displayType,
  },
  render: ({ iterations, size, display }) => {
    const sz  = size.toFixed(5);
    const sz3 = (size / 3).toFixed(6);

    return sdfStory(`
      vec3 render(vec2 p) {
        float d  = sdBox(p, vec2(${sz}));
        float sc = 1.0;
        for (int n = 0; n < ${iterations}; n++) {
          vec2 q = mod(p * sc + ${sz}, 2.0 * ${sz}) - ${sz};
          d = max(d, -sdBox(q, vec2(${sz3})) / sc);
          sc *= 3.0;
        }
        return ${col(display)};
      }
    `);
  },
};

// ── Dragon Curve ─────────────────────────────────────────────────────────────
// IFS with two contractions: f1(p) = scale*(p rotated +45°), f2(p) = offset +
// scale*(p rotated −45°). Equivalent turn-sequence method: build R/L sequence
// by appending L then reversing+flipping previous sequence each iteration.
// 2^N capsules inlined as GLSL literals (same pattern as Koch / FractalTree).
export const DragonCurve = {
  args: { iterations: 9, thickness: 0.004, ...display },
  argTypes: {
    iterations: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    thickness:  { control: { type: 'range', min: 0.001, max: 0.015, step: 0.001 } },
    ...displayType,
  },
  render: ({ iterations, thickness, display }) => {
    let turns = [];
    for (let i = 0; i < iterations; i++) {
      turns = [...turns, 1, ...[...turns].reverse().map(t => -t)];
    }

    let x = 0, y = 0, dx = 1, dy = 0;
    const pts = [[x, y]];
    for (const t of turns) {
      x += dx; y += dy;
      pts.push([x, y]);
      if (t === 1) { [dx, dy] = [-dy, dx]; } else { [dx, dy] = [dy, -dx]; }
    }
    x += dx; y += dy;
    pts.push([x, y]);

    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const sc = 0.88 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));

    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      segs.push([(pts[i][0]-cx)*sc, (pts[i][1]-cy)*sc, (pts[i+1][0]-cx)*sc, (pts[i+1][1]-cy)*sc]);
    }

    const th = thickness.toFixed(4), f = v => v.toFixed(5);
    const decls = segs.map((s, i) =>
      `float s${i} = sdCapsule(p, vec2(${f(s[0])},${f(s[1])}), vec2(${f(s[2])},${f(s[3])}), ${th});`
    );
    const union = ['float d = s0;', ...segs.slice(1).map((_, i) => `d = opUnion(d, s${i+1});`)].join('\n      ');

    return sdfStory(`
      vec3 render(vec2 p) {
        ${decls.join('\n        ')}
        ${union}
        return ${col(display)};
      }
    `);
  },
};

// ── Lévy C Curve ──────────────────────────────────────────────────────────────
// Each segment [a,b] → two segments meeting at c = midpoint(a,b) + 90°-rotated
// half-vector. Each child is 1/√2 the parent's length at ±45°. 2^N capsules.
export const LevyCCurve = {
  args: { iterations: 9, thickness: 0.004, ...display },
  argTypes: {
    iterations: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    thickness:  { control: { type: 'range', min: 0.001, max: 0.015, step: 0.001 } },
    ...displayType,
  },
  render: ({ iterations, thickness, display }) => {
    const subdivide = (segs) => {
      const out = [];
      for (const [ax, ay, bx, by] of segs) {
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const hx = (bx - ax) / 2, hy = (by - ay) / 2;
        const cx = mx - hy, cy = my + hx;
        out.push([ax, ay, cx, cy], [cx, cy, bx, by]);
      }
      return out;
    };

    const size = 0.6;
    let segs = [[-size, 0, size, 0]];
    for (let i = 0; i < iterations; i++) segs = subdivide(segs);

    const xs = segs.flatMap(s => [s[0], s[2]]), ys = segs.flatMap(s => [s[1], s[3]]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const sc = 0.88 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const norm = segs.map(s => [(s[0]-cx)*sc, (s[1]-cy)*sc, (s[2]-cx)*sc, (s[3]-cy)*sc]);

    const th = thickness.toFixed(4), f = v => v.toFixed(5);
    const decls = norm.map((s, i) =>
      `float s${i} = sdCapsule(p, vec2(${f(s[0])},${f(s[1])}), vec2(${f(s[2])},${f(s[3])}), ${th});`
    );
    const union = ['float d = s0;', ...norm.slice(1).map((_, i) => `d = opUnion(d, s${i+1});`)].join('\n      ');

    return sdfStory(`
      vec3 render(vec2 p) {
        ${decls.join('\n        ')}
        ${union}
        return ${col(display)};
      }
    `);
  },
};

// ── Fractal Tree ──────────────────────────────────────────────────────────────
// JS computes all branch segments (same capsule-union approach as WireframeTriangle).
// Each level doubles the branch count; depth 5 = 63 capsules inlined as GLSL literals.
export const FractalTree = {
  args: { depth: 4, branchAngle: 25, lengthDecay: 0.67, thickness: 0.009, ...display },
  argTypes: {
    depth:       { control: { type: 'range', min: 1, max: 6, step: 1 } },
    branchAngle: { control: { type: 'range', min: 5,   max: 70,   step: 1 } },
    lengthDecay: { control: { type: 'range', min: 0.40, max: 0.85, step: 0.01 } },
    thickness:   { control: { type: 'range', min: 0.002, max: 0.025, step: 0.001 } },
    ...displayType,
  },
  render: ({ depth, branchAngle, lengthDecay, thickness, display }) => {
    const angleRad = branchAngle * Math.PI / 180;
    const th = thickness.toFixed(4);
    const rootLen = 0.28;

    const segments = [];
    let level = [{ x: 0, y: -0.38, len: rootLen, angle: Math.PI / 2 }];

    for (let d = 0; d <= depth; d++) {
      const next = [];
      for (const b of level) {
        const tx = b.x + Math.cos(b.angle) * b.len;
        const ty = b.y + Math.sin(b.angle) * b.len;
        segments.push([b.x, b.y, tx, ty]);
        if (d < depth) {
          const cl = b.len * lengthDecay;
          next.push({ x: tx, y: ty, len: cl, angle: b.angle + angleRad });
          next.push({ x: tx, y: ty, len: cl, angle: b.angle - angleRad });
        }
      }
      level = next;
    }

    const f = v => v.toFixed(4);
    const decls = segments.map((s, i) =>
      `float s${i} = sdCapsule(p, vec2(${f(s[0])},${f(s[1])}), vec2(${f(s[2])},${f(s[3])}), ${th});`
    );
    const union = [
      'float d = s0;',
      ...segments.slice(1).map((_, i) => `d = opUnion(d, s${i + 1});`),
    ].join('\n      ');

    return sdfStory(`
      vec3 render(vec2 p) {
        ${decls.join('\n        ')}
        ${union}
        return ${col(display)};
      }
    `);
  },
};
