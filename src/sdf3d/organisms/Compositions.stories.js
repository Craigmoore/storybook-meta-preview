import { sdf3dStory, displayArgType } from '../story.js';
import { sphere, roundBox, torus, octahedron, verticalCapsule, cylinder,
         translate, rotateX, rotateY, union, smoothUnion, subtract, twist } from '../primitives.js';

export default { title: 'SDF3D/Organisms/Compositions' };

const shared     = { display: 'normals', resolution: 32 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 16, max: 64, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Metaballs ─────────────────────────────────────────────────────────────────
// N spheres evenly distributed on a ring, merged with smooth union.
// At high blendK the individual balls dissolve into a single organic blob.
export const Metaballs = {
  args: { count: 5, spread: 0.55, radius: 0.28, blendK: 0.18, ...shared },
  argTypes: {
    count:  range(2, 10, 1),
    spread: range(0.1, 1.0, 0.05),
    radius: range(0.05, 0.5, 0.025),
    blendK: range(0.01, 0.5, 0.01),
    ...sharedType,
  },
  render: ({ count, spread, radius, blendK, display, resolution }) => {
    const balls = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI;
      return translate(Math.cos(a) * spread, 0, Math.sin(a) * spread, sphere(radius));
    });
    const sdf = balls.reduce((a, b) => smoothUnion(blendK, a, b));
    return sdf3dStory(sdf, { display, resolution });
  },
};

// ── Dumbbell ──────────────────────────────────────────────────────────────────
// Two spheres joined by a smooth capsule stem.
export const Dumbbell = {
  args: { headRadius: 0.42, stemRadius: 0.12, separation: 0.9, blendK: 0.18, ...shared },
  argTypes: {
    headRadius: range(0.1, 0.7, 0.025),
    stemRadius: range(0.03, 0.3, 0.01),
    separation: range(0.2, 1.6, 0.05),
    blendK:     range(0.01, 0.4, 0.01),
    ...sharedType,
  },
  render: ({ headRadius, stemRadius, separation, blendK, display, resolution }) => {
    const top    = translate(0,  separation / 2, 0, sphere(headRadius));
    const bottom = translate(0, -separation / 2, 0, sphere(headRadius));
    const stem   = verticalCapsule(separation * 0.7, stemRadius);
    const sdf    = smoothUnion(blendK, smoothUnion(blendK, top, bottom), stem);
    return sdf3dStory(sdf, { display, resolution });
  },
};

// ── CrystalCluster ────────────────────────────────────────────────────────────
// Octahedra distributed uniformly on a sphere via golden-angle Fibonacci lattice.
export const CrystalCluster = {
  args: { count: 8, spread: 0.55, crystalSize: 0.22, ...shared },
  argTypes: {
    count:       range(3, 16, 1),
    spread:      range(0.2, 1.0, 0.05),
    crystalSize: range(0.05, 0.45, 0.025),
    ...sharedType,
  },
  render: ({ count, spread, crystalSize, display, resolution }) => {
    const goldenAngle = Math.PI * (1 + Math.sqrt(5));
    const shapes = Array.from({ length: count }, (_, i) => {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = goldenAngle * i;
      const x = Math.sin(phi) * Math.cos(theta) * spread;
      const y = Math.cos(phi) * spread;
      const z = Math.sin(phi) * Math.sin(theta) * spread;
      return translate(x, y, z, rotateY(theta, rotateX(phi, octahedron(crystalSize))));
    });
    return sdf3dStory(shapes.reduce((a, b) => union(a, b)), { display, resolution, bounds: 2 });
  },
};

// ── TwistedTower ──────────────────────────────────────────────────────────────
// A tall rounded box twisted around its axis, with a torus ring at the base.
export const TwistedTower = {
  args: { twistRate: 3.5, width: 0.28, height: 1.0, baseRing: 0.42, ...shared },
  argTypes: {
    twistRate: range(0, 10, 0.25),
    width:     range(0.1, 0.55, 0.025),
    height:    range(0.3, 1.4, 0.05),
    baseRing:  range(0.1, 0.7, 0.025),
    ...sharedType,
  },
  render: ({ twistRate, width, height, baseRing, display, resolution }) => {
    const tower = twist(twistRate, roundBox(width, height, width, 0.04));
    const base  = translate(0, -height, 0, torus(baseRing, 0.06));
    return sdf3dStory(union(tower, base), { display, resolution, bounds: 2 });
  },
};

// ── Gyroid ────────────────────────────────────────────────────────────────────
// Thickened gyroid — a triply periodic minimal surface.
// The raw implicit: sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0
// Thickening with |g| − t gives a shell that's renderable via marching cubes.
export const Gyroid = {
  args: { scale: 3.5, thickness: 0.08, ...shared },
  argTypes: {
    scale:     range(1.5, 6.0, 0.25),
    thickness: range(0.01, 0.25, 0.01),
    ...sharedType,
  },
  render: ({ scale, thickness, display, resolution }) => {
    const bounds = (Math.PI * 2) / scale + 0.2;
    const sdf = (p) => {
      const x = p.x * scale, y = p.y * scale, z = p.z * scale;
      const g = Math.sin(x) * Math.cos(y) + Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(x);
      return Math.abs(g) - thickness;
    };
    return sdf3dStory(sdf, { display, resolution, bounds });
  },
};
