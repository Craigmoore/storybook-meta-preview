import { sdf3dStory, displayArgType } from '../story.js';
import { revolve, extrude, translate, rotateY,
         union, smoothUnion } from '../primitives.js';
import { circle2D, star5_2D, egg2D, heart2D } from '../profiles2d.js';

export default { title: 'SDF3D/Organisms/SweepCompositions' };

const shared     = { display: 'normals', resolution: 32 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 16, max: 64, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Helpers ───────────────────────────────────────────────────────────────────

// Sweep a 2D profile along a helix of radius R and vertical pitch.
// Checks nWinds turns either side of the sample point for the closest position.
function helixSweep(R, pitch, nWinds, f2d) {
  return (p) => {
    const r     = Math.sqrt(p.x * p.x + p.z * p.z);
    const theta = Math.atan2(p.z, p.x);
    let best = Infinity;
    for (let n = -nWinds; n <= nWinds; n++) {
      const yc = pitch * (theta + n * 2 * Math.PI) / (2 * Math.PI);
      best = Math.min(best, f2d(r - R, p.y - yc));
    }
    return best;
  };
}

// Repeat a 2D SDF n times with polar symmetry around the 2D origin.
function repeatPolar2D(n, f2d) {
  const angle = (2 * Math.PI) / n;
  const half  = angle / 2;
  return (x, y) => {
    const r = Math.sqrt(x * x + y * y);
    let a   = Math.atan2(y, x) + half;
    a = ((a % angle) + angle) % angle - half;
    return f2d(Math.cos(a) * r, Math.sin(a) * r);
  };
}

// ── SpiralStars ───────────────────────────────────────────────────────────────
// Star discs stacked vertically, each rotated by a fraction of a full turn.
// Smoothly blended together they read as a single form continuously rotating
// as it rises — the "star spinning while it climbs" effect.
export const SpiralStars = {
  args: { layers: 12, starR: 0.52, innerRatio: 0.45, thickness: 0.18, spread: 1.5, turns: 1.5, blendK: 0.14, ...shared },
  argTypes: {
    layers:     range(4, 20, 1),
    starR:      range(0.2, 0.8, 0.05),
    innerRatio: range(0.2, 0.8, 0.05),
    thickness:  range(0.05, 0.4, 0.025),
    spread:     range(0.4, 2.0, 0.1),
    turns:      range(0.25, 4, 0.25),
    blendK:     range(0.02, 0.4, 0.02),
    ...sharedType,
  },
  render: ({ layers, starR, innerRatio, thickness, spread, turns, blendK, display, resolution }) => {
    const shapes = Array.from({ length: layers }, (_, i) => {
      const t     = i / (layers - 1);
      const y     = (t - 0.5) * spread;
      const angle = t * turns * 2 * Math.PI;
      return translate(0, y, 0, rotateY(angle, extrude(thickness / 2, star5_2D(starR, innerRatio))));
    });
    return sdf3dStory(shapes.reduce((a, b) => smoothUnion(blendK, a, b)), { display, resolution, bounds: 1.8 });
  },
};

// ── HelixCoil ─────────────────────────────────────────────────────────────────
// A circular tube profile swept along a helical path — a coil spring.
// The helixSweep helper evaluates distance to the nearest helix turn, so the
// shape is not azimuthally symmetric and looks completely different from a torus.
export const HelixCoil = {
  args: { R: 0.55, pitch: 0.32, tubeR: 0.1, ...shared },
  argTypes: {
    R:     range(0.2, 0.9, 0.05),
    pitch: range(0.1, 0.9, 0.05),
    tubeR: range(0.03, 0.25, 0.01),
    ...sharedType,
  },
  render: ({ R, pitch, tubeR, display, resolution }) => {
    const sdf = helixSweep(R, pitch, 6, circle2D(tubeR));
    return sdf3dStory(sdf, { display, resolution, bounds: 1.5 });
  },
};

// ── TwinHelix ─────────────────────────────────────────────────────────────────
// Two coils at 180° phase offset, intertwined like a double helix.
// Each strand uses a different 2D profile — one circular, one star — so the
// two strands are visually distinct even where they pass close together.
export const TwinHelix = {
  args: { R: 0.52, pitch: 0.45, tubeR: 0.1, starR: 0.1, innerRatio: 0.5, ...shared },
  argTypes: {
    R:          range(0.2, 0.9, 0.05),
    pitch:      range(0.15, 1.0, 0.05),
    tubeR:      range(0.03, 0.22, 0.01),
    starR:      range(0.03, 0.22, 0.01),
    innerRatio: range(0.2, 0.8, 0.05),
    ...sharedType,
  },
  render: ({ R, pitch, tubeR, starR, innerRatio, display, resolution }) => {
    const makeStrand = (phase, f2d) => (p) => {
      const r     = Math.sqrt(p.x * p.x + p.z * p.z);
      const theta = Math.atan2(p.z, p.x) + phase;
      let best = Infinity;
      for (let n = -6; n <= 6; n++) {
        const yc = pitch * (theta + n * 2 * Math.PI) / (2 * Math.PI);
        best = Math.min(best, f2d(r - R, p.y - yc));
      }
      return best;
    };
    const sdf = union(
      makeStrand(0,       circle2D(tubeR)),
      makeStrand(Math.PI, star5_2D(starR, innerRatio))
    );
    return sdf3dStory(sdf, { display, resolution, bounds: 1.5 });
  },
};

// ── KaleidoscoPrism ───────────────────────────────────────────────────────────
// An asymmetric 2D profile (egg) repeated N times in polar fashion, then
// extruded. Viewed from the top the cross-section is a kaleidoscope tile;
// the side profile shows how these wedge-petals stack into a solid prism.
export const KaleidoscoPrism = {
  args: { petals: 7, offset: 0.38, eggRa: 0.24, eggRb: 0.07, height: 0.55, ...shared },
  argTypes: {
    petals: range(3, 12, 1),
    offset: range(0.05, 0.7, 0.025),
    eggRa:  range(0.1, 0.45, 0.025),
    eggRb:  range(0.02, 0.2, 0.01),
    height: range(0.1, 1.2, 0.05),
    ...sharedType,
  },
  render: ({ petals, offset, eggRa, eggRb, height, display, resolution }) => {
    const e       = egg2D(eggRa, eggRb);
    const profile = repeatPolar2D(petals, (x, y) => e(x - offset, y));
    return sdf3dStory(extrude(height, profile), { display, resolution });
  },
};

// ── StarWreath ────────────────────────────────────────────────────────────────
// Star prisms arranged around a ring, each face-rotated outward, smoothly
// blended together and with a thin torus ring threaded through their centres.
// Combines extrude (the stars), revolve (the ring), rotateY, translate.
export const StarWreath = {
  args: { count: 8, ringR: 0.72, starR: 0.22, innerRatio: 0.45, thickness: 0.12, tubeR: 0.055, blendK: 0.06, ...shared },
  argTypes: {
    count:      range(3, 14, 1),
    ringR:      range(0.3, 1.1, 0.05),
    starR:      range(0.08, 0.45, 0.02),
    innerRatio: range(0.2, 0.8, 0.05),
    thickness:  range(0.04, 0.35, 0.02),
    tubeR:      range(0.01, 0.12, 0.01),
    blendK:     range(0.01, 0.2, 0.01),
    ...sharedType,
  },
  render: ({ count, ringR, starR, innerRatio, thickness, tubeR, blendK, display, resolution }) => {
    const starDisc = extrude(thickness / 2, star5_2D(starR, innerRatio));
    const stars = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI;
      return translate(ringR * Math.cos(a), 0, ringR * Math.sin(a), rotateY(a, starDisc));
    });
    const ring = revolve(ringR, circle2D(tubeR));
    const sdf  = stars.reduce((acc, s) => smoothUnion(blendK, acc, s), ring);
    return sdf3dStory(sdf, { display, resolution, bounds: 1.6 });
  },
};
