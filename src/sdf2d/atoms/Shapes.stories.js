import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Atoms/Shapes' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── Circle ────────────────────────────────────────────────────────────────────
export const Circle = {
  args: { radius: 0.35, ...display },
  argTypes: { radius: { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } }, ...displayType },
  render: ({ radius, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdCircle(p, ${radius.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Box ───────────────────────────────────────────────────────────────────────
export const Box = {
  args: { width: 0.45, height: 0.28, roundness: 0.0, ...display },
  argTypes: {
    width:     { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } },
    height:    { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } },
    roundness: { control: { type: 'range', min: 0.0,  max: 0.2,  step: 0.005 } },
    ...displayType,
  },
  render: ({ width, height, roundness, display }) => {
    const w = width.toFixed(4), h = height.toFixed(4), r = roundness.toFixed(4);
    const glsl = roundness > 0
      ? `float d = sdRoundedBox(p, vec2(${w}, ${h}), ${r});`
      : `float d = sdBox(p, vec2(${w}, ${h}));`;
    return sdfStory(`
      vec3 render(vec2 p) {
        ${glsl}
        return ${col(display)};
      }
    `);
  },
};

// ── Capsule ───────────────────────────────────────────────────────────────────
export const Capsule = {
  args: { length: 0.4, radius: 0.15, angle: 0, ...display },
  argTypes: {
    length: { control: { type: 'range', min: 0.0, max: 0.7, step: 0.01 } },
    radius: { control: { type: 'range', min: 0.02, max: 0.35, step: 0.01 } },
    angle:  { control: { type: 'range', min: 0, max: 180, step: 1 } },
    ...displayType,
  },
  render: ({ length: len, radius, angle, display }) => {
    const rad = (angle * Math.PI / 180).toFixed(4);
    const hx = (Math.cos(angle * Math.PI / 180) * len * 0.5).toFixed(4);
    const hy = (Math.sin(angle * Math.PI / 180) * len * 0.5).toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = sdCapsule(p, vec2(-${hx}, -${hy}), vec2(${hx}, ${hy}), ${radius.toFixed(4)});
        return ${col(display)};
      }
    `);
  },
};

// ── Equilateral Triangle ──────────────────────────────────────────────────────
export const Triangle = {
  args: { radius: 0.38, ...display },
  argTypes: { radius: { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } }, ...displayType },
  render: ({ radius, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdEquilateralTriangle(p - vec2(0.0, -0.08), ${radius.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Pentagon ──────────────────────────────────────────────────────────────────
export const Pentagon = {
  args: { radius: 0.38, ...display },
  argTypes: { radius: { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } }, ...displayType },
  render: ({ radius, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdPentagon(p, ${radius.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Hexagon ───────────────────────────────────────────────────────────────────
export const Hexagon = {
  args: { radius: 0.38, ...display },
  argTypes: { radius: { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } }, ...displayType },
  render: ({ radius, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdHexagon(p, ${radius.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Octagon ───────────────────────────────────────────────────────────────────
export const Octagon = {
  args: { radius: 0.38, ...display },
  argTypes: { radius: { control: { type: 'range', min: 0.05, max: 0.75, step: 0.01 } }, ...displayType },
  render: ({ radius, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdOctagon(p, ${radius.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Star ──────────────────────────────────────────────────────────────────────
export const Star = {
  args: { radius: 0.38, innerRatio: 0.45, ...display },
  argTypes: {
    radius:     { control: { type: 'range', min: 0.1, max: 0.75, step: 0.01 } },
    innerRatio: { control: { type: 'range', min: 0.1, max: 0.9,  step: 0.01 } },
    ...displayType,
  },
  render: ({ radius, innerRatio, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdStar5(p, ${radius.toFixed(4)}, ${innerRatio.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Arc ───────────────────────────────────────────────────────────────────────
export const Arc = {
  args: { angleDeg: 270, radius: 0.35, thickness: 0.04, ...display },
  argTypes: {
    angleDeg:  { control: { type: 'range', min: 10, max: 350, step: 5 } },
    radius:    { control: { type: 'range', min: 0.1, max: 0.7, step: 0.01 } },
    thickness: { control: { type: 'range', min: 0.01, max: 0.12, step: 0.005 } },
    ...displayType,
  },
  render: ({ angleDeg, radius, thickness, display }) => {
    const a = (angleDeg * Math.PI / 180).toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = sdArc(p, ${a}, ${radius.toFixed(4)}, ${thickness.toFixed(4)});
        return ${col(display)};
      }
    `);
  },
};

// ── Pie ───────────────────────────────────────────────────────────────────────
export const Pie = {
  args: { angleDeg: 120, radius: 0.38, ...display },
  argTypes: {
    angleDeg: { control: { type: 'range', min: 5, max: 355, step: 5 } },
    radius:   { control: { type: 'range', min: 0.1, max: 0.75, step: 0.01 } },
    ...displayType,
  },
  render: ({ angleDeg, radius, display }) => {
    const a = (angleDeg * Math.PI / 180).toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = sdPie(p, ${a}, ${radius.toFixed(4)});
        return ${col(display)};
      }
    `);
  },
};

// ── Ring ──────────────────────────────────────────────────────────────────────
export const Ring = {
  args: { radius: 0.32, thickness: 0.07, ...display },
  argTypes: {
    radius:    { control: { type: 'range', min: 0.1, max: 0.7, step: 0.01 } },
    thickness: { control: { type: 'range', min: 0.01, max: 0.2, step: 0.005 } },
    ...displayType,
  },
  render: ({ radius, thickness, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdRing(p, ${radius.toFixed(4)}, ${thickness.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Cross ─────────────────────────────────────────────────────────────────────
export const Cross = {
  args: { armLength: 0.32, armWidth: 0.1, roundness: 0.02, ...display },
  argTypes: {
    armLength: { control: { type: 'range', min: 0.05, max: 0.65, step: 0.01 } },
    armWidth:  { control: { type: 'range', min: 0.02, max: 0.3,  step: 0.01 } },
    roundness: { control: { type: 'range', min: 0.0,  max: 0.1,  step: 0.005 } },
    ...displayType,
  },
  render: ({ armLength, armWidth, roundness, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdCross(p, vec2(${armLength.toFixed(4)}, ${armWidth.toFixed(4)}), ${roundness.toFixed(4)});
      return ${col(display)};
    }
  `),
};

// ── Heart ─────────────────────────────────────────────────────────────────────
export const Heart = {
  args: { scale: 0.42, ...display },
  argTypes: {
    scale: { control: { type: 'range', min: 0.1, max: 0.7, step: 0.01 } },
    ...displayType,
  },
  render: ({ scale, display }) => {
    const s = scale.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        // IQ heart: apex at (0,1), tip at ~(0,-0.6). Scale and shift to centre.
        vec2 hp = p / ${s} * 2.0 + vec2(0.0, 0.45);
        float d = sdHeart(hp) * ${s} / 2.0;
        return ${col(display)};
      }
    `);
  },
};

// ── Moon ──────────────────────────────────────────────────────────────────────
// Two circles: the inner one slides along x and subtracts from the outer.
// offset=0 → full disc; offset≈outerRadius+innerRadius → thin crescent.
export const Moon = {
  args: { outerRadius: 0.35, innerRadius: 0.35, offset: 0.28, ...display },
  argTypes: {
    outerRadius: { control: { type: 'range', min: 0.1, max: 0.65, step: 0.01 } },
    innerRadius: { control: { type: 'range', min: 0.1, max: 0.65, step: 0.01 } },
    offset:      { control: { type: 'range', min: 0.0, max: 0.8,  step: 0.01 } },
    ...displayType,
  },
  render: ({ outerRadius, innerRadius, offset, display }) => {
    const ro = outerRadius.toFixed(4), ri = innerRadius.toFixed(4), o = offset.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float outer = sdCircle(p, ${ro});
        float inner = sdCircle(p - vec2(${o}, 0.0), ${ri});
        float d = opSubtract(outer, inner);
        return ${col(display)};
      }
    `);
  },
};

// ── Vesica ────────────────────────────────────────────────────────────────────
export const Vesica = {
  args: { radius: 0.42, offset: 0.22, ...display },
  argTypes: {
    radius: { control: { type: 'range', min: 0.1, max: 0.7, step: 0.01 } },
    offset: { control: { type: 'range', min: 0.01, max: 0.6, step: 0.01 } },
    ...displayType,
  },
  render: ({ radius, offset, display }) => {
    const r = radius.toFixed(4), d = Math.min(offset, radius - 0.01).toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = sdVesica(p, ${r}, ${d});
        return ${col(display)};
      }
    `);
  },
};

// ── Egg ───────────────────────────────────────────────────────────────────────
export const Egg = {
  args: { outerRadius: 0.35, innerRadius: 0.15, ...display },
  argTypes: {
    outerRadius: { control: { type: 'range', min: 0.15, max: 0.65, step: 0.01 } },
    innerRadius: { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    ...displayType,
  },
  render: ({ outerRadius, innerRadius, display }) => sdfStory(`
    vec3 render(vec2 p) {
      float d = sdEgg(p, ${outerRadius.toFixed(4)}, ${innerRadius.toFixed(4)});
      return ${col(display)};
    }
  `),
};
