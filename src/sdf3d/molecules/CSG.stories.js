import { sdf3dStory, displayArgType } from '../story.js';
import { sphere, box, roundBox, torus, translate, union, intersect, subtract, smoothUnion, smoothIntersect, smoothSubtract } from '../primitives.js';

export default { title: 'SDF3D/Molecules/CSG' };

const shared     = { display: 'normals', resolution: 32 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 16, max: 64, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// Shape pair: sphere left, box right, separated by `sep`
const makeA = (sep) => translate(-sep / 2, 0, 0, sphere(0.45));
const makeB = (sep) => translate( sep / 2, 0, 0, box(0.38, 0.38, 0.38));

// ── Union ─────────────────────────────────────────────────────────────────────
export const Union = {
  args: { separation: 0.3, ...shared },
  argTypes: { separation: range(0, 1.2, 0.05), ...sharedType },
  render: ({ separation, display, resolution }) =>
    sdf3dStory(union(makeA(separation), makeB(separation)), { display, resolution }),
};

// ── Intersect ─────────────────────────────────────────────────────────────────
export const Intersect = {
  args: { separation: 0.2, ...shared },
  argTypes: { separation: range(0, 0.8, 0.05), ...sharedType },
  render: ({ separation, display, resolution }) =>
    sdf3dStory(intersect(makeA(separation), makeB(separation)), { display, resolution }),
};

// ── Subtract ──────────────────────────────────────────────────────────────────
// Box with a spherical cavity scooped out
export const Subtract = {
  args: { separation: 0.1, ...shared },
  argTypes: { separation: range(-0.3, 0.6, 0.05), ...sharedType },
  render: ({ separation, display, resolution }) =>
    sdf3dStory(subtract(makeB(separation), makeA(separation)), { display, resolution }),
};

// ── SmoothUnion ───────────────────────────────────────────────────────────────
const makeSph = (sep) => translate(0, -sep / 2, 0, sphere(0.42));
const makeTor = (sep) => translate(0,  sep / 2, 0, torus(0.38, 0.14));

export const SmoothUnion = {
  args: { separation: 0.4, blendK: 0.3, ...shared },
  argTypes: {
    separation: range(0, 1.2, 0.05),
    blendK:     range(0.01, 0.6, 0.01),
    ...sharedType,
  },
  render: ({ separation, blendK, display, resolution }) =>
    sdf3dStory(smoothUnion(blendK, makeSph(separation), makeTor(separation)), { display, resolution }),
};

// ── SmoothIntersect ───────────────────────────────────────────────────────────
export const SmoothIntersect = {
  args: { separation: 0.2, blendK: 0.2, ...shared },
  argTypes: {
    separation: range(0, 0.8, 0.05),
    blendK:     range(0.01, 0.5, 0.01),
    ...sharedType,
  },
  render: ({ separation, blendK, display, resolution }) =>
    sdf3dStory(smoothIntersect(blendK, makeSph(separation), makeTor(separation)), { display, resolution }),
};

// ── SmoothSubtract ────────────────────────────────────────────────────────────
// Rounded box with a smoothly scooped spherical notch
export const SmoothSubtract = {
  args: { separation: 0.15, blendK: 0.2, ...shared },
  argTypes: {
    separation: range(-0.2, 0.6, 0.05),
    blendK:     range(0.01, 0.5, 0.01),
    ...sharedType,
  },
  render: ({ separation, blendK, display, resolution }) =>
    sdf3dStory(smoothSubtract(blendK, makeTor(separation), makeSph(separation)), { display, resolution }),
};
