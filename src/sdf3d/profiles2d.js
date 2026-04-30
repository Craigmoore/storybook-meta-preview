// 2D SDF profiles for use with revolve() and extrude().
// Each factory returns (x, y) => number — negative inside, positive outside.
// Ported from Inigo Quilez's GLSL originals.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const len2  = (a, b) => Math.sqrt(a * a + b * b);

export const circle2D = (r) => (x, y) => len2(x, y) - r;

export const box2D = (bx, by) => (x, y) => {
  const qx = Math.abs(x) - bx;
  const qy = Math.abs(y) - by;
  return len2(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
};

export const hexagon2D = (r) => (x, y) => {
  const kx = -0.866025404, ky = 0.5, kz = 0.577350269;
  let px = Math.abs(x), py = Math.abs(y);
  const d1 = Math.min(kx * px + ky * py, 0);
  px -= 2 * d1 * kx; py -= 2 * d1 * ky;
  const d2 = Math.min(-kx * px + ky * py, 0);
  px -= 2 * d2 * (-kx); py -= 2 * d2 * ky;
  px -= clamp(px, -kz * r, kz * r);
  py -= r;
  return len2(px, py) * Math.sign(py);
};

export const pentagon2D = (r) => (x, y) => {
  const kx = 0.809016994, ky = 0.587785252, kz = 0.726542528;
  let px = Math.abs(x), py = y;
  const d1 = Math.min(-kx * px + ky * py, 0);
  px -= 2 * d1 * (-kx); py -= 2 * d1 * ky;
  const d2 = Math.min(kx * px + ky * py, 0);
  px -= 2 * d2 * kx; py -= 2 * d2 * ky;
  px -= clamp(px, -r * kz, r * kz);
  py -= r;
  return len2(px, py) * Math.sign(py);
};

export const star5_2D = (r, rf) => (x, y) => {
  const k1x = 0.809016994375, k1y = -0.587785252192;
  const k2x = -0.809016994375, k2y = -0.587785252192;
  let px = Math.abs(x), py = y;
  const d1 = Math.max(k1x * px + k1y * py, 0);
  px -= 2 * d1 * k1x; py -= 2 * d1 * k1y;
  const d2 = Math.max(k2x * px + k2y * py, 0);
  px -= 2 * d2 * k2x; py -= 2 * d2 * k2y;
  px = Math.abs(px);
  py -= r;
  const bax = rf * (-k1y), bay = rf * k1x - 1;
  const h = clamp((px * bax + py * bay) / (bax * bax + bay * bay), 0, r);
  return len2(px - bax * h, py - bay * h) * Math.sign(py * bax - px * bay);
};

export const cross2D = (bx, by, r) => (x, y) => {
  let px = Math.abs(x), py = Math.abs(y);
  if (py > px) { const t = px; px = py; py = t; }
  const qx = px - bx, qy = py - by;
  const k = Math.max(qy, qx);
  const wx = k > 0 ? qx : by - px;
  const wy = k > 0 ? qy : -k;
  return Math.sign(k) * len2(Math.max(wx, 0), Math.max(wy, 0)) - r;
};

export const heart2D = () => (x, y) => {
  const px = Math.abs(x), py = y;
  if (py + px > 1) {
    const dx = px - 0.25, dy = py - 0.75;
    return Math.sqrt(dx * dx + dy * dy) - Math.SQRT2 / 4;
  }
  const t  = Math.max(px + py, 0) * 0.5;
  const d1 = px * px + (py - 1) * (py - 1);
  const d2 = (px - t) * (px - t) + (py - t) * (py - t);
  return Math.sqrt(Math.min(d1, d2)) * Math.sign(px - py);
};

export const egg2D = (ra, rb) => (x, y) => {
  const k = 1.73205080757;
  const px = Math.abs(x);
  const r  = ra - rb;
  let d;
  if (y < 0)                    d = len2(px, y) - r;
  else if (k * (px + r) < y)   d = len2(px, y - k * r);
  else                          d = len2(px + r, y) - 2 * r;
  return d - rb;
};
