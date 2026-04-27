import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Molecules/Operations' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── Lens ──────────────────────────────────────────────────────────────────────
export const Lens = {
  args: { radius: 0.42, separation: 0.22, ...display },
  argTypes: {
    radius:     { control: { type: 'range', min: 0.15, max: 0.7,  step: 0.01 } },
    separation: { control: { type: 'range', min: 0.0,  max: 0.55, step: 0.01 } },
    ...displayType,
  },
  render: ({ radius, separation, display }) => {
    const r = radius.toFixed(4), s = separation.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float a = sdCircle(p - vec2(-${s}, 0.0), ${r});
        float b = sdCircle(p - vec2( ${s}, 0.0), ${r});
        float d = opIntersect(a, b);
        return ${col(display)};
      }
    `);
  },
};

// ── Crescent ──────────────────────────────────────────────────────────────────
// opSubtract then opMirrorX — one operation concept shown with symmetry.
export const Crescent = {
  args: { outerRadius: 0.38, innerRadius: 0.32, offset: 0.18, ...display },
  argTypes: {
    outerRadius: { control: { type: 'range', min: 0.15, max: 0.65, step: 0.01 } },
    innerRadius: { control: { type: 'range', min: 0.1,  max: 0.6,  step: 0.01 } },
    offset:      { control: { type: 'range', min: 0.0,  max: 0.5,  step: 0.01 } },
    ...displayType,
  },
  render: ({ outerRadius, innerRadius, offset, display }) => {
    const ro = outerRadius.toFixed(4), ri = innerRadius.toFixed(4), o = offset.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  mp = opMirrorX(p) - vec2(${o}, 0.0);
        float d  = opSubtract(sdCircle(mp, ${ro}), sdCircle(mp - vec2(${o}, 0.0), ${ri}));
        return ${col(display)};
      }
    `);
  },
};

// ── Smooth Scoop ──────────────────────────────────────────────────────────────
// opSmoothSubtract carves a soft-edged bite out of a rounded rectangle.
export const SmoothScoop = {
  args: { k: 0.08, scoopOffset: 0.28, scoopRadius: 0.32, ...display },
  argTypes: {
    k:           { control: { type: 'range', min: 0.0, max: 0.25, step: 0.005 } },
    scoopOffset: { control: { type: 'range', min: 0.1, max: 0.55, step: 0.01 } },
    scoopRadius: { control: { type: 'range', min: 0.1, max: 0.55, step: 0.01 } },
    ...displayType,
  },
  render: ({ k, scoopOffset, scoopRadius, display }) => {
    const kv = k.toFixed(4), so = scoopOffset.toFixed(4), sr = scoopRadius.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float shape = sdRoundedBox(p, vec2(0.38, 0.28), 0.06);
        float scoop = sdCircle(p - vec2(0.0, ${so}), ${sr});
        float d = opSmoothSubtract(shape, scoop, ${kv});
        return ${col(display)};
      }
    `);
  },
};

// ── Smooth Intersect ──────────────────────────────────────────────────────────
// Box ∩ Circle with smooth blending. k=0 is a crisp rounded square; higher k
// inflates and pillows the corners.
export const SmoothIntersect = {
  args: { k: 0.08, boxSize: 0.42, circleRadius: 0.44, ...display },
  argTypes: {
    k:            { control: { type: 'range', min: 0.0, max: 0.25, step: 0.005 } },
    boxSize:      { control: { type: 'range', min: 0.2, max: 0.65, step: 0.01 } },
    circleRadius: { control: { type: 'range', min: 0.2, max: 0.65, step: 0.01 } },
    ...displayType,
  },
  render: ({ k, boxSize, circleRadius, display }) => {
    const kv = k.toFixed(4), bs = boxSize.toFixed(4), cr = circleRadius.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float d = opSmoothIntersect(sdBox(p, vec2(${bs}, ${bs})), sdCircle(p, ${cr}), ${kv});
        return ${col(display)};
      }
    `);
  },
};

// ── Wireframe Triangle ────────────────────────────────────────────────────────
// Three capsules (line segments) joined at equilateral triangle vertices.
// Capsule with small radius = line; union of three = shape outline.
// This is the molecule answer to "what is a line?" — a thin capsule.
export const WireframeTriangle = {
  args: { size: 0.36, thickness: 0.012, ...display },
  argTypes: {
    size:      { control: { type: 'range', min: 0.1,   max: 0.65, step: 0.01 } },
    thickness: { control: { type: 'range', min: 0.004, max: 0.05, step: 0.002 } },
    ...displayType,
  },
  render: ({ size, thickness, display }) => {
    const th = thickness.toFixed(4);
    const verts = [0, 1, 2].map(i => {
      const a = Math.PI / 2 + i * 2 * Math.PI / 3;
      return [
        (Math.cos(a) * size).toFixed(4),
        (Math.sin(a) * size).toFixed(4),
      ];
    });
    const [v0, v1, v2] = verts;
    return sdfStory(`
      vec3 render(vec2 p) {
        float s0 = sdCapsule(p, vec2(${v0[0]}, ${v0[1]}), vec2(${v1[0]}, ${v1[1]}), ${th});
        float s1 = sdCapsule(p, vec2(${v1[0]}, ${v1[1]}), vec2(${v2[0]}, ${v2[1]}), ${th});
        float s2 = sdCapsule(p, vec2(${v2[0]}, ${v2[1]}), vec2(${v0[0]}, ${v0[1]}), ${th});
        float d = opUnion(opUnion(s0, s1), s2);
        return ${col(display)};
      }
    `);
  },
};

// ── Ring Lattice ──────────────────────────────────────────────────────────────
// Grid repeat + opSubtract: one tiling concept with a cutout.
export const RingLattice = {
  args: { ringRadius: 0.28, ringThickness: 0.06, spotRadius: 0.08, spacing: 0.7, ...display },
  argTypes: {
    ringRadius:    { control: { type: 'range', min: 0.1,  max: 0.4,  step: 0.01 } },
    ringThickness: { control: { type: 'range', min: 0.02, max: 0.15, step: 0.005 } },
    spotRadius:    { control: { type: 'range', min: 0.02, max: 0.2,  step: 0.005 } },
    spacing:       { control: { type: 'range', min: 0.4,  max: 1.2,  step: 0.05 } },
    ...displayType,
  },
  render: ({ ringRadius, ringThickness, spotRadius, spacing, display }) => {
    const rr = ringRadius.toFixed(4), rt = ringThickness.toFixed(4);
    const sr = spotRadius.toFixed(4), sp = spacing.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  tp = opRepeat(p, vec2(${sp}));
        float d  = opSubtract(sdRing(tp, ${rr}, ${rt}), sdCircle(tp, ${sr}));
        return ${col(display)};
      }
    `);
  },
};
