import { sdf3dStory, displayArgType, cameraArgType } from '../story.js';
import { projectionSdf3D } from '../rasterSdf2d.js';

export default { title: 'SDF3D/Molecules/ProjectionSdf' };

const shared     = { display: 'normals', resolution: 40, camera: 'perspective' };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 24, max: 128, step: 8 } },
  camera:     cameraArgType,
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Canvas draw helpers ───────────────────────────────────────────────────────

function drawCircle(r = 0.42) {
  return (ctx, canvas) => {
    const s = canvas.width;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * r, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
  };
}

function drawStar(outerR = 0.42, innerR = 0.18, points = 5) {
  return (ctx, canvas) => {
    const s = canvas.width, cx = s / 2, cy = s / 2;
    ctx.beginPath();
    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? s * outerR : s * innerR;
      const a = (i / (2 * points)) * 2 * Math.PI - Math.PI / 2;
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
              : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
  };
}

function drawCross(armLen = 0.42, armW = 0.16) {
  return (ctx, canvas) => {
    const s = canvas.width, c = s / 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(c - s * armW, c - s * armLen, s * armW * 2, s * armLen * 2);
    ctx.fillRect(c - s * armLen, c - s * armW, s * armLen * 2, s * armW * 2);
  };
}

function drawHexagon(r = 0.42) {
  return (ctx, canvas) => {
    const s = canvas.width, cx = s / 2, cy = s / 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 2 * Math.PI - Math.PI / 6;
      i === 0 ? ctx.moveTo(cx + s * r * Math.cos(a), cy + s * r * Math.sin(a))
              : ctx.lineTo(cx + s * r * Math.cos(a), cy + s * r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
  };
}

// Render the letter to a 2× temp canvas, scan the actual dark pixels to find
// the real bounding box, then stretch exactly that box to fill `padding` of the
// target canvas in both X and Y. This is pixel-perfect regardless of font
// metrics API quirks, and ensures all three silhouettes have matching spans —
// which is required for the intersection projection technique to work correctly.
function drawLetter(ch, padding = 0.88) {
  return (ctx, canvas) => {
    const s  = canvas.width;
    const ts = s * 2;  // 2× for accurate sub-pixel bounding detection

    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = ts;
    const tc = tmp.getContext('2d');
    tc.fillStyle = '#fff'; tc.fillRect(0, 0, ts, ts);
    tc.fillStyle = '#000';
    tc.font = `bold ${Math.round(ts * 0.7)}px sans-serif`;
    tc.textAlign = 'center'; tc.textBaseline = 'middle';
    tc.fillText(ch, ts / 2, ts / 2);

    // Find the actual pixel bounding box of the rendered glyph
    const px = tc.getImageData(0, 0, ts, ts).data;
    let x0 = ts, x1 = 0, y0 = ts, y1 = 0;
    for (let y = 0; y < ts; y++) {
      for (let x = 0; x < ts; x++) {
        if (px[(y * ts + x) * 4] < 128) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < x0 || y1 < y0) return;

    // Stretch the detected bounds to fill padding × padding of the target canvas
    const target = s * padding;
    const dstX   = (s - target) / 2;
    const dstY   = (s - target) / 2;
    ctx.drawImage(tmp, x0, y0, x1 - x0 + 1, y1 - y0 + 1, dstX, dstY, target, target);
  };
}

// ── TriCircle ─────────────────────────────────────────────────────────────────
// Three circular silhouettes — one along each axis — intersect to approximate
// a sphere. The more the radii differ, the more the shape stretches along an axis.
export const TriCircle = {
  args: { rX: 0.42, rY: 0.42, rZ: 0.42, ...shared },
  argTypes: {
    rX: range(0.1, 0.48, 0.02),
    rY: range(0.1, 0.48, 0.02),
    rZ: range(0.1, 0.48, 0.02),
    ...sharedType,
  },
  render: ({ rX, rY, rZ, display, resolution, camera }) => {
    const sdf = projectionSdf3D(drawCircle(rX), drawCircle(rY), drawCircle(rZ));
    return sdf3dStory(sdf, { display, resolution, camera });
  },
};

// ── TriStar ───────────────────────────────────────────────────────────────────
// A 5-pointed star extruded along all three axes and intersected.
// Viewed from each face the silhouette is a star; the interior carving from all
// three directions produces a complex faceted solid.
export const TriStar = {
  args: { outerR: 0.44, innerR: 0.18, points: 5, ...shared },
  argTypes: {
    outerR: range(0.2, 0.48, 0.02),
    innerR: range(0.06, 0.35, 0.02),
    points: range(3, 8, 1),
    ...sharedType,
  },
  render: ({ outerR, innerR, points, display, resolution, camera }) => {
    const d   = drawStar(outerR, innerR, points);
    const sdf = projectionSdf3D(d, d, d);
    return sdf3dStory(sdf, { display, resolution, camera });
  },
};

// ── MixedSilhouettes ──────────────────────────────────────────────────────────
// Different shape on each axis — circle along X, star along Y, cross along Z.
// The interior is carved by all three; the result reads differently from each
// orthographic view, and has no rotational symmetry.
export const MixedSilhouettes = {
  args: { circR: 0.42, starOuter: 0.44, starInner: 0.18, armLen: 0.44, armW: 0.15, ...shared },
  argTypes: {
    circR:     range(0.1, 0.48, 0.02),
    starOuter: range(0.2, 0.48, 0.02),
    starInner: range(0.06, 0.35, 0.02),
    armLen:    range(0.2, 0.48, 0.02),
    armW:      range(0.04, 0.3, 0.02),
    ...sharedType,
  },
  render: ({ circR, starOuter, starInner, armLen, armW, display, resolution, camera }) => {
    const sdf = projectionSdf3D(
      drawCircle(circR),
      drawStar(starOuter, starInner),
      drawCross(armLen, armW)
    );
    return sdf3dStory(sdf, { display, resolution, camera });
  },
};

// ── LetterBlock ───────────────────────────────────────────────────────────────
// A different letter on each axis — the classic sculptor's technique (also used
// in multi-axis CNC roughing). The three silhouettes intersect to form a solid
// that reads as each letter when viewed face-on along the correct axis.
// Axis mapping: X view = left/right face, Y view = top face, Z view = front face.
export const LetterBlock = {
  args: { charX: 'S', charY: 'D', charZ: 'F', ...shared },
  argTypes: {
    charX: { control: 'text' },
    charY: { control: 'text' },
    charZ: { control: 'text' },
    ...sharedType,
  },
  render: ({ charX, charY, charZ, display, resolution, camera }) => {
    const sdf = projectionSdf3D(
      drawLetter(charX.slice(0, 1) || 'S'),
      drawLetter(charY.slice(0, 1) || 'D'),
      drawLetter(charZ.slice(0, 1) || 'F')
    );
    return sdf3dStory(sdf, { display, resolution, camera });
  },
};

// ── HexStar ───────────────────────────────────────────────────────────────────
// Hexagon along X and Z, star along Y. The hex gives a prismatic outer profile;
// the star punches through from the top, cutting five-pointed notches into the
// hex column. Orbit to see the silhouette change on each face.
export const HexStar = {
  args: { hexR: 0.44, starOuter: 0.44, starInner: 0.16, points: 6, ...shared },
  argTypes: {
    hexR:      range(0.2, 0.48, 0.02),
    starOuter: range(0.2, 0.48, 0.02),
    starInner: range(0.06, 0.35, 0.02),
    points:    range(3, 8, 1),
    ...sharedType,
  },
  render: ({ hexR, starOuter, starInner, points, display, resolution, camera }) => {
    const sdf = projectionSdf3D(
      drawHexagon(hexR),
      drawStar(starOuter, starInner, points),
      drawHexagon(hexR)
    );
    return sdf3dStory(sdf, { display, resolution, camera });
  },
};
