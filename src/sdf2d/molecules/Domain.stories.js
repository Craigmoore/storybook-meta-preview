import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Molecules/Domain' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── Flower ────────────────────────────────────────────────────────────────────
// opRepeatPolar of an offset rounded ellipse = petals around a centre disc.
export const Flower = {
  args: { petals: 6, petalOffset: 0.22, petalW: 0.14, petalH: 0.1, ...display },
  argTypes: {
    petals:      { control: { type: 'range', min: 3,    max: 12,  step: 1 } },
    petalOffset: { control: { type: 'range', min: 0.05, max: 0.4, step: 0.01 } },
    petalW:      { control: { type: 'range', min: 0.04, max: 0.28, step: 0.01 } },
    petalH:      { control: { type: 'range', min: 0.03, max: 0.2,  step: 0.01 } },
    ...displayType,
  },
  render: ({ petals, petalOffset, petalW, petalH, display }) => {
    const n = petals.toFixed(1), po = petalOffset.toFixed(4);
    const pw = petalW.toFixed(4), ph = petalH.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  rp    = opRepeatPolar(p, ${n});
        float petal = sdRoundedBox(rp - vec2(${po}, 0.0), vec2(${pw}, ${ph}), 0.06);
        float d = opUnion(petal, sdCircle(p, 0.08));
        return ${col(display)};
      }
    `);
  },
};

// ── Starburst ─────────────────────────────────────────────────────────────────
// opRepeatPolar of a capsule from origin, with opSubtract punching a centre hole.
export const Starburst = {
  args: { rays: 12, rayWidth: 0.06, innerHole: 0.12, outerRadius: 0.42, ...display },
  argTypes: {
    rays:        { control: { type: 'range', min: 4,    max: 24,  step: 1 } },
    rayWidth:    { control: { type: 'range', min: 0.02, max: 0.18, step: 0.005 } },
    innerHole:   { control: { type: 'range', min: 0.0,  max: 0.35, step: 0.01 } },
    outerRadius: { control: { type: 'range', min: 0.2,  max: 0.65, step: 0.01 } },
    ...displayType,
  },
  render: ({ rays, rayWidth, innerHole, outerRadius, display }) => {
    const n = rays.toFixed(1), rw = rayWidth.toFixed(4);
    const ih = innerHole.toFixed(4), or2 = outerRadius.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        vec2  rp = opRepeatPolar(p, ${n});
        float d  = opSubtract(
          sdCapsule(rp, vec2(0.0, 0.0), vec2(${or2}, 0.0), ${rw}),
          sdCircle(p, ${ih})
        );
        return ${col(display)};
      }
    `);
  },
};

// ── Shells ────────────────────────────────────────────────────────────────────
// The onion operation: abs(d) - t turns any solid into a shell. Repeated
// inward at fixed intervals it produces concentric nested contours.
export const Shells = {
  args: { shape: 'hexagon', size: 0.38, layers: 4, spacing: 0.07, thickness: 0.012, ...display },
  argTypes: {
    shape:     { control: { type: 'select', options: ['hexagon', 'star', 'box', 'circle'] } },
    size:      { control: { type: 'range', min: 0.15, max: 0.65, step: 0.01 } },
    layers:    { control: { type: 'range', min: 1, max: 8, step: 1 } },
    spacing:   { control: { type: 'range', min: 0.02, max: 0.15, step: 0.005 } },
    thickness: { control: { type: 'range', min: 0.004, max: 0.03, step: 0.002 } },
    ...displayType,
  },
  render: ({ shape, size, layers, spacing, thickness, display }) => {
    const sz = size.toFixed(4), sp = spacing.toFixed(4), th = thickness.toFixed(4);
    const baseGLSL = {
      hexagon: `sdHexagon(p, ${sz})`,
      star:    `sdStar5(p, ${sz}, 0.45)`,
      box:     `sdRoundedBox(p, vec2(${sz}, ${sz}), 0.04)`,
      circle:  `sdCircle(p, ${sz})`,
    }[shape];

    const shellLines = Array.from({ length: layers }, (_, i) =>
      `d = min(d, abs(base + ${(i * spacing).toFixed(4)}) - ${th});`
    ).join('\n        ');

    return sdfStory(`
      vec3 render(vec2 p) {
        float base = ${baseGLSL};
        float d = 1e10;
        ${shellLines}
        return ${col(display)};
      }
    `);
  },
};

