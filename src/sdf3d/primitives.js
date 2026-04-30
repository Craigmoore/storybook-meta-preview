import * as THREE from 'three';

// All SDF functions follow the convention: negative inside, positive outside,
// zero on the surface. Each factory returns (p: THREE.Vector3) => number.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const len2  = (a, b)      => Math.sqrt(a * a + b * b);
const len3  = (a, b, c)   => Math.sqrt(a * a + b * b + c * c);

// ── Primitives ────────────────────────────────────────────────────────────────

export const sphere = (r) => (p) => p.length() - r;

export const box = (bx, by, bz) => (p) => {
  const qx = Math.abs(p.x) - bx;
  const qy = Math.abs(p.y) - by;
  const qz = Math.abs(p.z) - bz;
  return len3(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0))
       + Math.min(Math.max(qx, Math.max(qy, qz)), 0);
};

export const roundBox = (bx, by, bz, r) => (p) => {
  const qx = Math.abs(p.x) - bx + r;
  const qy = Math.abs(p.y) - by + r;
  const qz = Math.abs(p.z) - bz + r;
  return len3(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0))
       + Math.min(Math.max(qx, Math.max(qy, qz)), 0) - r;
};

// Torus in the xz-plane. R = major radius, r = tube radius.
export const torus = (R, r) => (p) => {
  const qx = len2(p.x, p.z) - R;
  return len2(qx, p.y) - r;
};

// Capped torus — partial arc controlled by sc = [sin(angle), cos(angle)].
export const cappedTorus = (scx, scy, R, r) => (p) => {
  const px = Math.abs(p.x);
  const k  = (scy * px > scx * p.y) ? len2(px, p.y) * scy - px * scx : 0;
  const kk = k !== 0 ? k : len2(px, p.y);
  return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z + R * R - 2 * R * kk) - r;
};

// Capsule centred on the Y-axis from -h/2 to +h/2.
export const verticalCapsule = (h, r) => (p) => {
  const half = h / 2;
  const py   = p.y - clamp(p.y, -half, half);
  return len3(p.x, py, p.z) - r;
};

// Infinite cylinder along Y, capped by half-height h.
export const cylinder = (r, h) => (p) => {
  const dx = len2(p.x, p.z) - r;
  const dy = Math.abs(p.y) - h;
  return Math.min(Math.max(dx, dy), 0) + len2(Math.max(dx, 0), Math.max(dy, 0));
};

// Rounded cylinder. r = base radius, rr = rim rounding radius, h = half-height.
export const roundedCylinder = (r, rr, h) => (p) => {
  const dx = len2(p.x, p.z) - r + rr;
  const dy = Math.abs(p.y) - h;
  return Math.min(Math.max(dx, dy), 0) + len2(Math.max(dx, 0), Math.max(dy, 0)) - rr;
};

// Capped cone. h = half-height (centred), r1 = bottom radius, r2 = top radius.
export const cappedCone = (h, r1, r2) => (p) => {
  const qx = len2(p.x, p.z);
  const qy = p.y;
  const k2x = r2 - r1, k2y = 2 * h;
  const cax = qx - Math.min(qx, qy < 0 ? r1 : r2);
  const cay = Math.abs(qy) - h;
  const dot = (r2 - qx) * k2x + (h - qy) * k2y;
  const len = k2x * k2x + k2y * k2y;
  const t   = clamp(dot / len, 0, 1);
  const cbx = qx - r2 + k2x * t;
  const cby = qy - h  + k2y * t;
  const s   = (cbx < 0 && cay < 0) ? -1 : 1;
  return s * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
};

// Octahedron. s controls the scale — the shape fits in a cube of side ~2s.
export const octahedron = (s) => (p) =>
  (Math.abs(p.x) + Math.abs(p.y) + Math.abs(p.z) - s) * 0.57735027;

// Chain link. le = link half-length, r1 = ring radius, r2 = tube radius.
export const link = (le, r1, r2) => (p) => {
  const qy    = Math.max(Math.abs(p.y) - le, 0);
  const inner = len2(p.x, qy) - r1;
  return len2(inner, p.z) - r2;
};

// Box frame (wireframe-like box). b* = half-extents, e = edge thickness.
export const boxFrame = (bx, by, bz, e) => (p) => {
  const px = Math.abs(p.x) - bx;
  const py = Math.abs(p.y) - by;
  const pz = Math.abs(p.z) - bz;
  const qx = Math.abs(px + e) - e;
  const qy = Math.abs(py + e) - e;
  const qz = Math.abs(pz + e) - e;
  const d1 = len3(Math.max(px,0), Math.max(qy,0), Math.max(qz,0)) + Math.min(Math.max(px, Math.max(qy, qz)), 0);
  const d2 = len3(Math.max(qx,0), Math.max(py,0), Math.max(qz,0)) + Math.min(Math.max(qx, Math.max(py, qz)), 0);
  const d3 = len3(Math.max(qx,0), Math.max(qy,0), Math.max(pz,0)) + Math.min(Math.max(qx, Math.max(qy, pz)), 0);
  return Math.min(d1, Math.min(d2, d3));
};

// ── Boolean operations ────────────────────────────────────────────────────────

export const union    = (...fns) => (p) => fns.reduce((d, f) => Math.min(d, f(p)), Infinity);
export const intersect = (a, b)  => (p) => Math.max(a(p), b(p));
export const subtract  = (a, b)  => (p) => Math.max(a(p), -b(p));

export const smoothUnion = (k, a, b) => (p) => {
  const d1 = a(p), d2 = b(p);
  const h  = clamp(0.5 + 0.5 * (d2 - d1) / k, 0, 1);
  return d2 * (1 - h) + d1 * h - k * h * (1 - h);
};

export const smoothIntersect = (k, a, b) => (p) => {
  const d1 = a(p), d2 = b(p);
  const h  = clamp(0.5 - 0.5 * (d2 - d1) / k, 0, 1);
  return d2 * (1 - h) + d1 * h + k * h * (1 - h);
};

export const smoothSubtract = (k, a, b) => (p) => {
  const d1 = a(p), d2 = b(p);
  const h  = clamp(0.5 - 0.5 * (d2 + d1) / k, 0, 1);
  return d2 * (1 - h) - d1 * h + k * h * (1 - h);
};

// ── Domain operations ─────────────────────────────────────────────────────────

export const translate = (tx, ty, tz, f) => {
  const _p = new THREE.Vector3();
  return (p) => f(_p.set(p.x - tx, p.y - ty, p.z - tz));
};

export const scale = (s, f) => {
  const _p = new THREE.Vector3();
  return (p) => f(_p.set(p.x / s, p.y / s, p.z / s)) * s;
};

export const rotateY = (angle, f) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  const _p = new THREE.Vector3();
  return (p) => f(_p.set(c * p.x + s * p.z, p.y, -s * p.x + c * p.z));
};

export const rotateX = (angle, f) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  const _p = new THREE.Vector3();
  return (p) => f(_p.set(p.x, c * p.y - s * p.z, s * p.y + c * p.z));
};

export const rotateZ = (angle, f) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  const _p = new THREE.Vector3();
  return (p) => f(_p.set(c * p.x - s * p.y, s * p.x + c * p.y, p.z));
};

// Symmetry on X — folds negative-X into positive-X.
export const mirrorX = (f) => {
  const _p = new THREE.Vector3();
  return (p) => f(_p.set(Math.abs(p.x), p.y, p.z));
};

// Hollow shell — turns a solid SDF into a thin shell of thickness t.
export const onion = (t, f) => (p) => Math.abs(f(p)) - t;

// Twist around the Y axis. k = radians of twist per unit of Y.
export const twist = (k, f) => {
  const _p = new THREE.Vector3();
  return (p) => {
    const c = Math.cos(k * p.y), s = Math.sin(k * p.y);
    return f(_p.set(c * p.x - s * p.z, p.y, s * p.x + c * p.z));
  };
};

// Elongate a primitive by h along each axis, preserving its exact SDF outside.
export const elongate = (hx, hy, hz, f) => {
  const _p = new THREE.Vector3();
  return (p) => {
    const qx = p.x - clamp(p.x, -hx, hx);
    const qy = p.y - clamp(p.y, -hy, hy);
    const qz = p.z - clamp(p.z, -hz, hz);
    return f(_p.set(qx, qy, qz));
  };
};

// Repeat n times with radial (polar) symmetry around the Y axis.
export const repeatPolar = (n, f) => {
  const angle = (2 * Math.PI) / n;
  const half  = angle / 2;
  const _p    = new THREE.Vector3();
  return (p) => {
    const r = len2(p.x, p.z);
    let a = Math.atan2(p.z, p.x) + half;
    a = ((a % angle) + angle) % angle - half;
    return f(_p.set(Math.cos(a) * r, p.y, Math.sin(a) * r));
  };
};
