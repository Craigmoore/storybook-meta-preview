const round = n => Math.round(n * 10000) / 10000;
const pt = (x, y) => `[${round(x)},${round(y)},0]`;

export const setColor = (r, g, b) =>
  `color.set.rgb=${round(r)},${round(g)},${round(b)}`;

export const setSize = s => `brush.size.set=${round(s)}`;

// Draws an absolute-coordinate path using the draw.path API command.
// Brush must be at origin (brush.move.to=0,0,0) for coordinates to be world-space.
export function path(points) {
  if (points.length < 2) return [];
  return [`draw.path=${points.map(([x, y]) => pt(x, y)).join(',')}`];
}

export function line(x1, y1, x2, y2) {
  return path([[x1, y1], [x2, y2]]);
}

export function rect(cx, cy, w, h) {
  const hw = w / 2, hh = h / 2;
  return path([
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh],
    [cx - hw, cy + hh],
    [cx - hw, cy - hh],
  ]);
}

// Regular polygon, flat-topped by default (rotation = 0 points right)
export function polygon(cx, cy, radius, sides, rotation = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 + rotation;
    pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
  }
  return path(pts);
}

export function circle(cx, cy, radius, segments = 64) {
  return polygon(cx, cy, radius, segments, 0);
}

export function star(cx, cy, outerR, innerR, points) {
  const pts = [];
  for (let i = 0; i <= points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return path(pts);
}
