import { sdf3dStory, displayArgType } from '../story.js';
import { sphere, box, roundBox, torus, octahedron, verticalCapsule, translate,
         onion, twist, elongate, repeatPolar } from '../primitives.js';

export default { title: 'SDF3D/Molecules/Domain' };

const shared     = { display: 'normals', resolution: 32 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 16, max: 64, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Onion ─────────────────────────────────────────────────────────────────────
// Concentric shells of a torus — cross-section shows the nested ring structure.
export const Onion = {
  args: { majorRadius: 0.55, minorRadius: 0.25, thickness: 0.06, ...shared },
  argTypes: {
    majorRadius: range(0.2, 0.9, 0.05),
    minorRadius: range(0.05, 0.4, 0.025),
    thickness:   range(0.01, 0.15, 0.005),
    ...sharedType,
  },
  render: ({ majorRadius, minorRadius, thickness, display, resolution }) =>
    sdf3dStory(onion(thickness, torus(majorRadius, minorRadius)), { display, resolution }),
};

// ── Twist ─────────────────────────────────────────────────────────────────────
// A tall rounded box twisted around its Y axis.
export const Twist = {
  args: { twistRate: 3.0, width: 0.32, height: 0.85, ...shared },
  argTypes: {
    twistRate: range(0, 8, 0.25),
    width:     range(0.1, 0.6, 0.025),
    height:    range(0.2, 1.2, 0.05),
    ...sharedType,
  },
  render: ({ twistRate, width, height, display, resolution }) =>
    sdf3dStory(twist(twistRate, roundBox(width, height, width, 0.05)), { display, resolution, bounds: 2 }),
};

// ── Elongate ──────────────────────────────────────────────────────────────────
// An octahedron stretched along chosen axes — creates anisotropic diamond shapes.
export const Elongate = {
  args: { hx: 0.3, hy: 0.0, hz: 0.0, scale: 0.42, ...shared },
  argTypes: {
    hx:    range(0, 0.7, 0.025),
    hy:    range(0, 0.7, 0.025),
    hz:    range(0, 0.7, 0.025),
    scale: range(0.1, 0.7, 0.025),
    ...sharedType,
  },
  render: ({ hx, hy, hz, scale, display, resolution }) =>
    sdf3dStory(elongate(hx, hy, hz, octahedron(scale)), { display, resolution }),
};

// ── RepeatPolar ───────────────────────────────────────────────────────────────
// N capsules arranged radially around the Y axis.
export const RepeatPolar = {
  args: { count: 6, radius: 0.55, capHeight: 0.45, capRadius: 0.1, ...shared },
  argTypes: {
    count:     range(2, 12, 1),
    radius:    range(0.2, 1.0, 0.05),
    capHeight: range(0.1, 0.8, 0.05),
    capRadius: range(0.04, 0.25, 0.01),
    ...sharedType,
  },
  render: ({ count, radius, capHeight, capRadius, display, resolution }) => {
    const spoke = translate(radius, 0, 0, verticalCapsule(capHeight, capRadius));
    return sdf3dStory(repeatPolar(count, spoke), { display, resolution, bounds: 2 });
  },
};
