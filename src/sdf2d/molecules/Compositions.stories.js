import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Molecules/Compositions' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── Smooth Blob ───────────────────────────────────────────────────────────────
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
        float d = molSmoothBlob(p, ${sp}, ${r}, ${kv});
        return ${col(display)};
      }
    `);
  },
};

// ── Dumbbell ──────────────────────────────────────────────────────────────────
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
        float d = molDumbbell(p, ${bl}, ${br}, ${hr});
        return ${col(display)};
      }
    `);
  },
};

// ── Wings ─────────────────────────────────────────────────────────────────────
export const Wings = {
  args: { spread: 0.18, sweep: 35, lobeRadius: 0.12, ...display },
  argTypes: {
    spread:     { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    sweep:      { control: { type: 'range', min: 0,    max: 80,   step: 1 } },
    lobeRadius: { control: { type: 'range', min: 0.04, max: 0.25, step: 0.01 } },
    ...displayType,
  },
  render: ({ spread, sweep, lobeRadius, display }) => {
    const sp = spread.toFixed(4), ang = (sweep * Math.PI / 180).toFixed(5), lr = lobeRadius.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = molWings(p, ${sp}, ${ang}, ${lr});
        return ${col(display)};
      }
    `);
  },
};

// ── Tile ──────────────────────────────────────────────────────────────────────
export const Tile = {
  args: { spacing: 0.62, ringRadius: 0.22, crossSize: 0.16, crossWidth: 0.05, rotation: 0, ...display },
  argTypes: {
    spacing:    { control: { type: 'range', min: 0.35, max: 1.0,  step: 0.05 } },
    ringRadius: { control: { type: 'range', min: 0.08, max: 0.3,  step: 0.01 } },
    crossSize:  { control: { type: 'range', min: 0.05, max: 0.28, step: 0.01 } },
    crossWidth: { control: { type: 'range', min: 0.02, max: 0.12, step: 0.005 } },
    rotation:   { control: { type: 'range', min: 0,    max: 45,   step: 1 } },
    ...displayType,
  },
  render: ({ spacing, ringRadius, crossSize, crossWidth, rotation, display }) => {
    const sp = spacing.toFixed(4), rr = ringRadius.toFixed(4);
    const cs = crossSize.toFixed(4), cw = crossWidth.toFixed(4);
    const rot = (rotation * Math.PI / 180).toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = molTile(p, ${sp}, ${rr}, ${cs}, ${cw}, ${rot});
        return ${col(display)};
      }
    `);
  },
};

// ── Kaleidoscope ──────────────────────────────────────────────────────────────
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
        float d = molKaleidoscope(p, ${n}, ${co}, ${cl}, ${cr}, ${kv});
        return ${col(display)};
      }
    `);
  },
};
