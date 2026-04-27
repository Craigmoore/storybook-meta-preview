import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Organisms/Compositions' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── SmoothBlob ────────────────────────────────────────────────────────────────
// Four circles smooth-unioned in a cluster. k controls how much they melt into
// each other — k=0 is crisp union, higher k produces organic blobby merging.
export const SmoothBlob = {
  args: { k: 0.12, spread: 0.22, radius: 0.16, ...display },
  argTypes: {
    k:      { control: { type: 'range', min: 0.0,  max: 0.35, step: 0.005 } },
    spread: { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    radius: { control: { type: 'range', min: 0.06, max: 0.3,  step: 0.01 } },
    ...displayType,
  },
  render: ({ k, spread, radius, display }) => {
    const kv = k.toFixed(4), sp = spread.toFixed(4), r = radius.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2( ${sp},  ${sp}), ${r});
        float b = sdCircle(p - vec2(-${sp},  ${sp}), ${r});
        float c = sdCircle(p - vec2( ${sp}, -${sp}), ${r});
        float d = sdCircle(p - vec2(-${sp}, -${sp}), ${r});
        d = opSmoothUnion(opSmoothUnion(a, b, ${kv}), opSmoothUnion(c, d, ${kv}), ${kv});
        return ${col(display)};
      }
    `);
  },
};

// ── Dumbbell ──────────────────────────────────────────────────────────────────
// Two end spheres joined by a capsule bar. Three distinct atoms composed with
// two unions to form a recognisable compound shape.
export const Dumbbell = {
  args: { barLength: 0.32, barRadius: 0.055, headRadius: 0.14, ...display },
  argTypes: {
    barLength:  { control: { type: 'range', min: 0.1,  max: 0.55, step: 0.01 } },
    barRadius:  { control: { type: 'range', min: 0.02, max: 0.12, step: 0.005 } },
    headRadius: { control: { type: 'range', min: 0.06, max: 0.28, step: 0.01 } },
    ...displayType,
  },
  render: ({ barLength, barRadius, headRadius, display }) => {
    const bl = barLength.toFixed(4), br = barRadius.toFixed(4), hr = headRadius.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float bar  = sdCapsule(p, vec2(-${bl}, 0.0), vec2(${bl}, 0.0), ${br});
        float headL = sdCircle(p - vec2(-${bl}, 0.0), ${hr});
        float headR = sdCircle(p - vec2( ${bl}, 0.0), ${hr});
        float d = opUnion(bar, opUnion(headL, headR));
        return ${col(display)};
      }
    `);
  },
};

// ── Wings ─────────────────────────────────────────────────────────────────────
// opMirrorX on a rotated capsule + tip lobe, combined with a body capsule.
// Three primitive atoms, three unions, plus mirror and rotate domain ops.
export const Wings = {
  args: { spread: 0.18, sweep: 35, lobeRadius: 0.12, ...display },
  argTypes: {
    spread:     { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    sweep:      { control: { type: 'range', min: 0,    max: 80,   step: 1 } },
    lobeRadius: { control: { type: 'range', min: 0.04, max: 0.25, step: 0.01 } },
    ...displayType,
  },
  render: ({ spread, sweep, lobeRadius, display }) => {
    const sp = spread.toFixed(4), lr = lobeRadius.toFixed(4);
    const ang = (sweep * Math.PI / 180).toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  mp   = opMirrorX(p);
        vec2  rp   = opRotate(mp - vec2(${sp}, 0.0), -${ang});
        float wing = sdCapsule(rp, vec2(0.0, 0.0), vec2(0.36, 0.0), 0.07);
        float tip  = sdCircle(mp - vec2(${sp} + 0.36, 0.0), ${lr});
        float body = sdCapsule(p, vec2(0.0, 0.22), vec2(0.0, -0.18), 0.045);
        float d = opUnion(opUnion(wing, tip), body);
        return ${col(display)};
      }
    `);
  },
};

// ── Tile ──────────────────────────────────────────────────────────────────────
// opRepeat of a compound motif (ring ∪ cross), with optional domain rotation.
// The motif itself is CSG; tiling + rotation make it an organism.
export const Tile = {
  args: { spacing: 0.62, ringRadius: 0.22, crossSize: 0.16, crossWidth: 0.05, rotation: 0, ...display },
  argTypes: {
    spacing:    { control: { type: 'range', min: 0.35, max: 1.0,  step: 0.05 } },
    ringRadius: { control: { type: 'range', min: 0.08, max: 0.3,  step: 0.01 } },
    crossSize:  { control: { type: 'range', min: 0.05, max: 0.28, step: 0.01 } },
    crossWidth: { control: { type: 'range', min: 0.02, max: 0.12, step: 0.005 } },
    rotation:   { control: { type: 'range', min: 0, max: 45, step: 1 } },
    ...displayType,
  },
  render: ({ spacing, ringRadius, crossSize, crossWidth, rotation, display }) => {
    const sp = spacing.toFixed(4), rr = ringRadius.toFixed(4);
    const cs = crossSize.toFixed(4), cw = crossWidth.toFixed(4);
    const rot = (rotation * Math.PI / 180).toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  tp = opRepeat(opRotate(p, ${rot}), vec2(${sp}));
        float d  = opUnion(sdRing(tp, ${rr}, 0.018), sdCross(tp, vec2(${cs}, ${cw}), 0.01));
        return ${col(display)};
      }
    `);
  },
};

// ── Kaleidoscope ──────────────────────────────────────────────────────────────
// opMirror + opRepeatPolar in two phases, smooth-unioned, with a punched centre.
// Two distinct capsule groups, four domain ops, and CSG — peak organism complexity.
export const Kaleidoscope = {
  args: { folds: 6, capsuleOffset: 0.25, capsuleLength: 0.18, capsuleRadius: 0.06, k: 0.04, ...display },
  argTypes: {
    folds:         { control: { type: 'range', min: 2,    max: 12,   step: 1 } },
    capsuleOffset: { control: { type: 'range', min: 0.05, max: 0.45, step: 0.01 } },
    capsuleLength: { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    capsuleRadius: { control: { type: 'range', min: 0.02, max: 0.15, step: 0.01 } },
    k:             { control: { type: 'range', min: 0.0,  max: 0.15, step: 0.005 } },
    ...displayType,
  },
  render: ({ folds, capsuleOffset, capsuleLength, capsuleRadius, k, display }) => {
    const n  = folds.toFixed(1), co = capsuleOffset.toFixed(4);
    const cl = capsuleLength.toFixed(4), cr = capsuleRadius.toFixed(4), kv = k.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  rp1 = opRepeatPolar(opMirror(p), ${n});
        float d1  = sdCapsule(rp1 - vec2(${co}, 0.0), vec2(-${cl}, 0.0), vec2(${cl}, 0.0), ${cr});

        vec2  rp2 = opRepeatPolar(p, ${n});
        float d2  = sdCapsule(rp2 - vec2(${co} * 0.6, 0.0), vec2(0.0, -${cl}), vec2(0.0, ${cl}), ${cr} * 0.7);

        float d = opSmoothUnion(d1, d2, ${kv});
        d = opSubtract(d, sdCircle(p, 0.05));
        return ${col(display)};
      }
    `);
  },
};
