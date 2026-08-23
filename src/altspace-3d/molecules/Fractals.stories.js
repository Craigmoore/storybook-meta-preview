import { altspace3dStory, hexToVec } from '../story.js';

export default { title: 'Altspace-3D/Molecules/Fractals' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// Mulberry32 seeded PRNG — returns a stateful () => [0,1) function.
function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Fractal Tree ──────────────────────────────────────────────────────────────
// Branch positions and orientations are computed in world space (no pivot
// parents with cascading rotations). Each cylinder is then attached as a child
// of a single root object, so the whole tree can be moved/destroyed as a unit.

function vecCross(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function vecNorm(v) {
  const l = Math.hypot(...v); return l < 1e-9 ? [0,1,0] : v.map(x => x/l);
}

function childDirection(parentDir, angleDeg, azDeg) {
  const ref   = Math.abs(parentDir[1]) > 0.99 ? [1,0,0] : [0,1,0];
  const right = vecNorm(vecCross(parentDir, ref));
  const fwd   = vecNorm(vecCross(right, parentDir));
  const az    = azDeg * Math.PI / 180;
  const ba    = angleDeg * Math.PI / 180;
  const perp  = right.map((r, i) => Math.cos(az)*r + Math.sin(az)*fwd[i]);
  return vecNorm(parentDir.map((d, i) => Math.cos(ba)*d + Math.sin(ba)*perp[i]));
}

// Recursively collect branch segments as { cx, cy, cz, rx, ry, length, radius, cur }.
// Positions are in root-local space (root sits at its own origin).
// rx/ry are YXZ Euler angles orienting the cylinder's +Y axis toward the branch dir.
function collectBranches(base, dir, cur, length, radius, opts, out) {
  const { branchAngle, spread, lengthDecay, rng } = opts;
  const end = base.map((b, i) => b + dir[i] * length);
  const cx  = (base[0]+end[0])/2, cy = (base[1]+end[1])/2, cz = (base[2]+end[2])/2;
  const rx  = Math.acos(Math.max(-1, Math.min(1, dir[1]))) * 180 / Math.PI;
  const ry  = Math.atan2(dir[0], dir[2]) * 180 / Math.PI;
  out.push({ cx, cy, cz, rx, ry, length, radius, cur, end });
  if (cur > 0) {
    const az1 = rng() * 360;
    const az2 = az1 + 180 + (rng() - 0.5) * spread;
    for (const az of [az1, az2]) {
      collectBranches(end, childDirection(dir, branchAngle, az),
        cur - 1, length * lengthDecay, radius * 0.65, opts, out);
    }
  }
}

export const FractalTree = {
  args:     { depth: 3, branchAngle: 30, spread: 60, lengthDecay: 0.70, seed: 42 },
  argTypes: {
    depth:       range(1, 4),
    branchAngle: range(10, 60),
    spread:      range(0, 180, 5),
    lengthDecay: range(0.5, 0.9, 0.05),
    seed:        range(0, 99),
  },
  render: ({ depth, branchAngle, spread, lengthDecay, seed }) => altspace3dStory((_, BS) => {
    const root = new BS.GameObject({ name: 'FractalTree', localPosition: new BS.Vector3(0, -1, 0) });
    const segments = [];
    collectBranches(
      [0, 0, 0], [0, 1, 0], depth, 0.9, 0.06,
      { branchAngle, spread, lengthDecay, rng: mulberry32(seed) },
      segments,
    );
    for (const { cx, cy, cz, rx, ry, length, radius, cur } of segments) {
      const t   = depth > 0 ? cur / depth : 0;
      const obj = new BS.GameObject({
        name:             'branch',
        localPosition:    new BS.Vector3(cx, cy, cz),
        localEulerAngles: new BS.Vector3(rx, ry, 0),
        parent:           root,
      });
      obj.AddComponent(new BS.BanterCylinder({ radiusTop: radius * 0.7, radiusBottom: radius, height: length }));
      obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(
        0.55 - (1 - t) * 0.2,
        0.35 + (1 - t) * 0.5,
        0.1, 1,
      )}));
    }
    return root;
  }, { cameraPosition: { x: 1, y: 1.5, z: 5 } }),
};

// ── Sierpinski Tetrahedron ────────────────────────────────────────────────────
// IFS: 4 contractions f_i(x) = (x + Vi) / 2 where Vi are the vertices of a
// regular tetrahedron. Iterating all composition paths of length `order` gives
// the deterministic attractor sample: 4^order points.
//   order 1 →  4 spheres
//   order 2 → 16 spheres
//   order 3 → 64 spheres

function sierpinskiPoints(V, order, pos = [0, 0, 0], group = -1) {
  if (order === 0) return [{ pos, group: group < 0 ? 0 : group }];
  return V.flatMap((v, j) => sierpinskiPoints(
    V, order - 1,
    [(pos[0] + v[0]) / 2, (pos[1] + v[1]) / 2, (pos[2] + v[2]) / 2],
    group < 0 ? j : group,
  ));
}

const STET_COLORS = [
  [0.91, 0.27, 0.38, 1],
  [0.27, 0.53, 1,    1],
  [0.27, 0.8,  0.47, 1],
  [1,    0.67, 0.13, 1],
];

export const SierpinskiTetrahedron = {
  args:     { order: 2, scale: 1.0 },
  argTypes: { order: range(1, 3), scale: range(0.5, 2.0, 0.1) },
  render: ({ order, scale }) => altspace3dStory((_, BS) => {
    const root   = new BS.GameObject({ name: 'SierpinskiTetrahedron' });
    const V      = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v => v.map(c => c * scale));
    const radius = scale * 0.25 / Math.pow(2, order - 1);
    for (const { pos: [x, y, z], group } of sierpinskiPoints(V, order)) {
      const [cr, cg, cb, ca] = STET_COLORS[group % 4];
      const obj = new BS.GameObject({ name: `stet_g${group}`, localPosition: new BS.Vector3(x, y, z), parent: root });
      obj.AddComponent(new BS.BanterSphere({ radius }));
      obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(cr, cg, cb, ca) }));
    }
    return root;
  }, { cameraPosition: { x: 2.5, y: 1.5, z: 2.5 } }),
};

// ── Menger Sponge ─────────────────────────────────────────────────────────────
// IFS: 20 contractions mapping the unit cube to 1/3-scale copies, omitting the
// 7 cells whose position has ≥2 zero-coordinates (through-tunnels + centre).
//   level 1 →  20 cubes
//   level 2 → 400 cubes  (heavier — preview is fine, Banter inject may be slow)

function mengerCells(level, x, y, z, scale) {
  if (level === 0) return [{ x, y, z, scale }];
  const s = scale / 3;
  const cells = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if ([dx, dy, dz].filter(c => c === 0).length >= 2) continue;
        cells.push(...mengerCells(level - 1, x + dx * s, y + dy * s, z + dz * s, s));
      }
    }
  }
  return cells;
}

export const MengerSponge = {
  args:     { level: 1, color: '#66b3ff' },
  argTypes: { level: range(1, 2), color: { control: 'color' } },
  render: ({ level, color }) => altspace3dStory((_, BS) => {
    const root       = new BS.GameObject({ name: 'MengerSponge' });
    const [cr, cg, cb] = hexToVec(color);
    for (const { x, y, z, scale } of mengerCells(level, 0, 0, 0, 1.2)) {
      const size = scale * 0.9;
      const obj  = new BS.GameObject({ name: 'mcube', localPosition: new BS.Vector3(x, y, z), parent: root });
      obj.AddComponent(new BS.BanterBox({ width: size, height: size, depth: size }));
      obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(cr, cg, cb, 1) }));
    }
    return root;
  }, { cameraPosition: { x: 2, y: 2, z: 2.5 } }),
};
