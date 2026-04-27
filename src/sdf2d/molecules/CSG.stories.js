import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Molecules/CSG' };

// Each story demonstrates one CSG operation on a circle (left) and a box (right).
// The `separation` slider slides the shapes apart so the operation boundary is clear.

const display = { display: 'field' };
const displayType = { display: displayArgType };

const SHAPE_ARGS = {
  separation: 0.18,
  circleRadius: 0.26,
  boxSize: 0.22,
};

const SHAPE_ARG_TYPES = {
  separation:   { control: { type: 'range', min: -0.1, max: 0.5, step: 0.01 } },
  circleRadius: { control: { type: 'range', min: 0.08, max: 0.45, step: 0.01 } },
  boxSize:      { control: { type: 'range', min: 0.08, max: 0.45, step: 0.01 } },
};

// ── Union ─────────────────────────────────────────────────────────────────────
export const Union = {
  args: { ...SHAPE_ARGS, ...display },
  argTypes: { ...SHAPE_ARG_TYPES, ...displayType },
  render: ({ separation, circleRadius, boxSize, display }) => {
    const sep = separation.toFixed(4), cr = circleRadius.toFixed(4), bs = boxSize.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${sep}, 0.0), ${cr});
        float b = sdBox(p - vec2( ${sep}, 0.0), vec2(${bs}));
        float d = opUnion(a, b);
        return ${col(display)};
      }
    `);
  },
};

// ── Intersect ─────────────────────────────────────────────────────────────────
export const Intersect = {
  args: { ...SHAPE_ARGS, ...display },
  argTypes: { ...SHAPE_ARG_TYPES, ...displayType },
  render: ({ separation, circleRadius, boxSize, display }) => {
    const sep = separation.toFixed(4), cr = circleRadius.toFixed(4), bs = boxSize.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${sep}, 0.0), ${cr});
        float b = sdBox(p - vec2( ${sep}, 0.0), vec2(${bs}));
        float d = opIntersect(a, b);
        return ${col(display)};
      }
    `);
  },
};

// ── Subtract ──────────────────────────────────────────────────────────────────
// b (box) is carved out of a (circle).
export const Subtract = {
  args: { ...SHAPE_ARGS, ...display },
  argTypes: { ...SHAPE_ARG_TYPES, ...displayType },
  render: ({ separation, circleRadius, boxSize, display }) => {
    const sep = separation.toFixed(4), cr = circleRadius.toFixed(4), bs = boxSize.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${sep}, 0.0), ${cr});
        float b = sdBox(p - vec2( ${sep}, 0.0), vec2(${bs}));
        float d = opSubtract(a, b);
        return ${col(display)};
      }
    `);
  },
};

// ── Smooth Union ──────────────────────────────────────────────────────────────
// k=0 is identical to opUnion; increasing k melts the join.
export const SmoothUnion = {
  args: { k: 0.1, ...SHAPE_ARGS, ...display },
  argTypes: {
    k: { control: { type: 'range', min: 0.0, max: 0.35, step: 0.005 } },
    ...SHAPE_ARG_TYPES,
    ...displayType,
  },
  render: ({ k, separation, circleRadius, boxSize, display }) => {
    const kv = k.toFixed(4), sep = separation.toFixed(4), cr = circleRadius.toFixed(4), bs = boxSize.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${sep}, 0.0), ${cr});
        float b = sdBox(p - vec2( ${sep}, 0.0), vec2(${bs}));
        float d = opSmoothUnion(a, b, ${kv});
        return ${col(display)};
      }
    `);
  },
};

// ── Smooth Intersect ──────────────────────────────────────────────────────────
// k=0 is a crisp corner; higher k rounds and inflates the overlap region.
export const SmoothIntersect = {
  args: { k: 0.1, ...SHAPE_ARGS, ...display },
  argTypes: {
    k: { control: { type: 'range', min: 0.0, max: 0.35, step: 0.005 } },
    ...SHAPE_ARG_TYPES,
    ...displayType,
  },
  render: ({ k, separation, circleRadius, boxSize, display }) => {
    const kv = k.toFixed(4), sep = separation.toFixed(4), cr = circleRadius.toFixed(4), bs = boxSize.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${sep}, 0.0), ${cr});
        float b = sdBox(p - vec2( ${sep}, 0.0), vec2(${bs}));
        float d = opSmoothIntersect(a, b, ${kv});
        return ${col(display)};
      }
    `);
  },
};

// ── Smooth Subtract ───────────────────────────────────────────────────────────
// k=0 is a hard edge; higher k softens the carved boundary.
export const SmoothSubtract = {
  args: { k: 0.1, ...SHAPE_ARGS, ...display },
  argTypes: {
    k: { control: { type: 'range', min: 0.0, max: 0.35, step: 0.005 } },
    ...SHAPE_ARG_TYPES,
    ...displayType,
  },
  render: ({ k, separation, circleRadius, boxSize, display }) => {
    const kv = k.toFixed(4), sep = separation.toFixed(4), cr = circleRadius.toFixed(4), bs = boxSize.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${sep}, 0.0), ${cr});
        float b = sdBox(p - vec2( ${sep}, 0.0), vec2(${bs}));
        float d = opSmoothSubtract(a, b, ${kv});
        return ${col(display)};
      }
    `);
  },
};
