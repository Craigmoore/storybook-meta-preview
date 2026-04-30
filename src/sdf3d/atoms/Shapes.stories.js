import { sdf3dStory, displayArgType } from '../story.js';
import {
  sphere, box, roundBox, torus, cappedTorus,
  verticalCapsule, cylinder, roundedCylinder,
  cappedCone, octahedron, link, boxFrame,
} from '../primitives.js';

export default { title: 'SDF3D/Atoms/Shapes' };

const shared     = { display: 'normals', resolution: 32 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 16, max: 64, step: 8 } },
};

const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Sphere ────────────────────────────────────────────────────────────────────
export const Sphere = {
  args: { radius: 0.6, ...shared },
  argTypes: { radius: range(0.1, 1.2, 0.05), ...sharedType },
  render: ({ radius, display, resolution }) =>
    sdf3dStory(sphere(radius), { display, resolution }),
};

// ── Box ───────────────────────────────────────────────────────────────────────
export const Box = {
  args: { bx: 0.5, by: 0.5, bz: 0.5, ...shared },
  argTypes: { bx: range(0.1, 1.0, 0.05), by: range(0.1, 1.0, 0.05), bz: range(0.1, 1.0, 0.05), ...sharedType },
  render: ({ bx, by, bz, display, resolution }) =>
    sdf3dStory(box(bx, by, bz), { display, resolution }),
};

// ── RoundBox ──────────────────────────────────────────────────────────────────
export const RoundBox = {
  args: { bx: 0.45, by: 0.45, bz: 0.45, radius: 0.08, ...shared },
  argTypes: {
    bx: range(0.1, 0.9, 0.05), by: range(0.1, 0.9, 0.05), bz: range(0.1, 0.9, 0.05),
    radius: range(0.01, 0.2, 0.01),
    ...sharedType,
  },
  render: ({ bx, by, bz, radius, display, resolution }) =>
    sdf3dStory(roundBox(bx, by, bz, radius), { display, resolution }),
};

// ── Torus ─────────────────────────────────────────────────────────────────────
export const Torus = {
  args: { majorRadius: 0.55, minorRadius: 0.2, ...shared },
  argTypes: {
    majorRadius: range(0.2, 1.0, 0.05),
    minorRadius: range(0.05, 0.4, 0.025),
    ...sharedType,
  },
  render: ({ majorRadius, minorRadius, display, resolution }) =>
    sdf3dStory(torus(majorRadius, minorRadius), { display, resolution }),
};

// ── CappedTorus ───────────────────────────────────────────────────────────────
// sc encodes the arc opening angle via (sin θ, cos θ)
export const CappedTorus = {
  args: { angle: 120, majorRadius: 0.6, minorRadius: 0.18, ...shared },
  argTypes: {
    angle:       range(10, 350, 5),
    majorRadius: range(0.2, 1.0, 0.05),
    minorRadius: range(0.05, 0.35, 0.025),
    ...sharedType,
  },
  render: ({ angle, majorRadius, minorRadius, display, resolution }) => {
    const rad = (angle / 2) * (Math.PI / 180);
    return sdf3dStory(cappedTorus(Math.sin(rad), Math.cos(rad), majorRadius, minorRadius), { display, resolution });
  },
};

// ── VerticalCapsule ───────────────────────────────────────────────────────────
export const VerticalCapsule = {
  args: { height: 0.8, radius: 0.25, ...shared },
  argTypes: {
    height: range(0.1, 1.5, 0.05),
    radius: range(0.05, 0.5, 0.025),
    ...sharedType,
  },
  render: ({ height, radius, display, resolution }) =>
    sdf3dStory(verticalCapsule(height, radius), { display, resolution }),
};

// ── Cylinder ──────────────────────────────────────────────────────────────────
export const Cylinder = {
  args: { radius: 0.4, height: 0.6, ...shared },
  argTypes: {
    radius: range(0.05, 0.9, 0.05),
    height: range(0.05, 1.2, 0.05),
    ...sharedType,
  },
  render: ({ radius, height, display, resolution }) =>
    sdf3dStory(cylinder(radius, height), { display, resolution }),
};

// ── RoundedCylinder ───────────────────────────────────────────────────────────
export const RoundedCylinder = {
  args: { radius: 0.4, rimRadius: 0.06, height: 0.55, ...shared },
  argTypes: {
    radius:    range(0.1, 0.8, 0.05),
    rimRadius: range(0.01, 0.15, 0.01),
    height:    range(0.05, 1.0, 0.05),
    ...sharedType,
  },
  render: ({ radius, rimRadius, height, display, resolution }) =>
    sdf3dStory(roundedCylinder(radius, rimRadius, height), { display, resolution }),
};

// ── CappedCone ────────────────────────────────────────────────────────────────
export const CappedCone = {
  args: { height: 0.7, bottomRadius: 0.5, topRadius: 0.1, ...shared },
  argTypes: {
    height:       range(0.1, 1.2, 0.05),
    bottomRadius: range(0.0, 0.9, 0.05),
    topRadius:    range(0.0, 0.9, 0.05),
    ...sharedType,
  },
  render: ({ height, bottomRadius, topRadius, display, resolution }) =>
    sdf3dStory(cappedCone(height, bottomRadius, topRadius), { display, resolution }),
};

// ── Octahedron ────────────────────────────────────────────────────────────────
export const Octahedron = {
  args: { scale: 0.7, ...shared },
  argTypes: { scale: range(0.1, 1.3, 0.05), ...sharedType },
  render: ({ scale, display, resolution }) =>
    sdf3dStory(octahedron(scale), { display, resolution }),
};

// ── Link ──────────────────────────────────────────────────────────────────────
export const Link = {
  args: { halfLength: 0.3, ringRadius: 0.4, tubeRadius: 0.12, ...shared },
  argTypes: {
    halfLength: range(0.0, 0.8, 0.05),
    ringRadius: range(0.1, 0.8, 0.05),
    tubeRadius: range(0.02, 0.25, 0.01),
    ...sharedType,
  },
  render: ({ halfLength, ringRadius, tubeRadius, display, resolution }) =>
    sdf3dStory(link(halfLength, ringRadius, tubeRadius), { display, resolution, bounds: 1.8 }),
};

// ── BoxFrame ──────────────────────────────────────────────────────────────────
export const BoxFrame = {
  args: { bx: 0.6, by: 0.6, bz: 0.6, edge: 0.05, ...shared },
  argTypes: {
    bx:   range(0.1, 1.0, 0.05),
    by:   range(0.1, 1.0, 0.05),
    bz:   range(0.1, 1.0, 0.05),
    edge: range(0.01, 0.15, 0.01),
    ...sharedType,
  },
  render: ({ bx, by, bz, edge, display, resolution }) =>
    sdf3dStory(boxFrame(bx, by, bz, edge), { display, resolution }),
};
