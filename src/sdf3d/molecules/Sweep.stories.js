import { sdf3dStory, displayArgType } from '../story.js';
import { revolve, extrude } from '../primitives.js';
import { circle2D, star5_2D, heart2D, egg2D, hexagon2D, pentagon2D, cross2D } from '../profiles2d.js';

export default { title: 'SDF3D/Molecules/Sweep' };

const shared     = { display: 'normals', resolution: 32 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 16, max: 64, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Revolution ────────────────────────────────────────────────────────────────
// revolve(offset, f2d): radial distance from Y axis → f2d maps to SDF.
// offset=0 gives a solid of revolution; offset>0 gives a torus-like ring.

// A circle profile revolved at an offset — identical to the torus primitive,
// shown here to ground the concept before moving to non-circular profiles.
export const CircleRevolution = {
  args: { ringRadius: 0.7, tubeRadius: 0.25, ...shared },
  argTypes: {
    ringRadius: range(0.2, 1.2, 0.05),
    tubeRadius: range(0.05, 0.5, 0.05),
    ...sharedType,
  },
  render: ({ ringRadius, tubeRadius, display, resolution }) =>
    sdf3dStory(revolve(ringRadius, circle2D(tubeRadius)), { display, resolution }),
};

// Star5 profile revolved — the cross-section of the ring is a 5-pointed star.
export const StarRevolution = {
  args: { ringRadius: 0.65, starSize: 0.28, innerRatio: 0.45, ...shared },
  argTypes: {
    ringRadius: range(0.2, 1.2, 0.05),
    starSize:   range(0.1, 0.5, 0.05),
    innerRatio: range(0.2, 0.8, 0.05),
    ...sharedType,
  },
  render: ({ ringRadius, starSize, innerRatio, display, resolution }) =>
    sdf3dStory(revolve(ringRadius, star5_2D(starSize, innerRatio)), { display, resolution }),
};

// Pentagon profile revolved — pentagonal cross-section ring.
export const PentagonRevolution = {
  args: { ringRadius: 0.65, size: 0.28, ...shared },
  argTypes: {
    ringRadius: range(0.2, 1.2, 0.05),
    size:       range(0.1, 0.5, 0.05),
    ...sharedType,
  },
  render: ({ ringRadius, size, display, resolution }) =>
    sdf3dStory(revolve(ringRadius, pentagon2D(size)), { display, resolution }),
};

// Heart profile revolved — a torus whose cross-section is a heart shape.
export const HeartRevolution = {
  args: { ringRadius: 0.5, scale: 0.3, ...shared },
  argTypes: {
    ringRadius: range(0.1, 1.0, 0.05),
    scale:      range(0.1, 0.6, 0.05),
    ...sharedType,
  },
  render: ({ ringRadius, scale, display, resolution }) => {
    const h = heart2D();
    // center the heart profile vertically (IQ heart tip is at ~y=-0.7, bumps at ~y=1)
    const profile = (x, y) => h(x / scale, y / scale - 0.15) * scale;
    return sdf3dStory(revolve(ringRadius, profile), { display, resolution });
  },
};

// Egg profile revolved at origin — produces a 3D egg / water-drop shape.
export const EggRevolution = {
  args: { ra: 0.5, rb: 0.12, ...shared },
  argTypes: {
    ra: range(0.2, 0.8, 0.05),
    rb: range(0.05, 0.25, 0.05),
    ...sharedType,
  },
  render: ({ ra, rb, display, resolution }) =>
    sdf3dStory(revolve(0, egg2D(ra, rb)), { display, resolution, bounds: 1.2 }),
};

// ── Extrusion ─────────────────────────────────────────────────────────────────
// extrude(h, f2d): 2D profile in XY plane, extruded along Z by half-height h.

// Star5 extruded — a classic star-shaped prism.
export const StarExtrusion = {
  args: { radius: 0.6, innerRatio: 0.45, height: 0.35, ...shared },
  argTypes: {
    radius:     range(0.2, 1.0, 0.05),
    innerRatio: range(0.2, 0.8, 0.05),
    height:     range(0.05, 1.0, 0.05),
    ...sharedType,
  },
  render: ({ radius, innerRatio, height, display, resolution }) =>
    sdf3dStory(extrude(height, star5_2D(radius, innerRatio)), { display, resolution }),
};

// Hexagon extruded — hex prism, common in game and voxel art.
export const HexExtrusion = {
  args: { radius: 0.6, height: 0.45, ...shared },
  argTypes: {
    radius: range(0.2, 1.0, 0.05),
    height: range(0.05, 1.2, 0.05),
    ...sharedType,
  },
  render: ({ radius, height, display, resolution }) =>
    sdf3dStory(extrude(height, hexagon2D(radius)), { display, resolution }),
};

// Cross/plus extruded — plus-shaped prism.
export const CrossExtrusion = {
  args: { armLength: 0.55, armWidth: 0.22, height: 0.35, ...shared },
  argTypes: {
    armLength: range(0.1, 0.9, 0.05),
    armWidth:  range(0.05, 0.5, 0.05),
    height:    range(0.05, 1.0, 0.05),
    ...sharedType,
  },
  render: ({ armLength, armWidth, height, display, resolution }) =>
    sdf3dStory(extrude(height, cross2D(armLength, armWidth, 0)), { display, resolution }),
};

// Heart extruded — a heart-shaped prism.
export const HeartExtrusion = {
  args: { scale: 0.55, height: 0.25, ...shared },
  argTypes: {
    scale:  range(0.2, 1.0, 0.05),
    height: range(0.05, 0.8, 0.05),
    ...sharedType,
  },
  render: ({ scale, height, display, resolution }) => {
    const h = heart2D();
    const profile = (x, y) => h(x / scale, y / scale - 0.15) * scale;
    return sdf3dStory(extrude(height, profile), { display, resolution });
  },
};
