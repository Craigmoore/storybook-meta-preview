import { sdf3dStory, displayArgType } from '../story.js';
import { box } from '../primitives.js';

export default { title: 'SDF3D/Organisms/Fractals' };

const shared     = { display: 'normals', resolution: 40 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 24, max: 128, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── MengerSponge ──────────────────────────────────────────────────────────────
// Recursive box-minus-cross subtraction: at each scale, three orthogonal
// rectangular tunnels are cut through the cube. SDF via Inigo Quilez's formula.
export const MengerSponge = {
  args: { iterations: 2, ...shared },
  argTypes: { iterations: range(1, 3, 1), ...sharedType },
  render: ({ iterations, display, resolution }) => {
    const sdBox1 = box(1, 1, 1);
    const sdf = (p) => {
      let d = sdBox1(p);
      let s = 1;
      for (let i = 0; i < iterations; i++) {
        const ax = ((p.x * s) % 2 + 2) % 2 - 1;
        const ay = ((p.y * s) % 2 + 2) % 2 - 1;
        const az = ((p.z * s) % 2 + 2) % 2 - 1;
        s *= 3;
        const rx = Math.abs(1 - 3 * Math.abs(ax));
        const ry = Math.abs(1 - 3 * Math.abs(ay));
        const rz = Math.abs(1 - 3 * Math.abs(az));
        const c = (Math.min(Math.max(rx, ry), Math.min(Math.max(ry, rz), Math.max(rz, rx))) - 1) / s;
        d = Math.max(d, c);
      }
      return d;
    };
    return sdf3dStory(sdf, { display, resolution, bounds: 1.4 });
  },
};

// ── SierpinskiTetrahedron ─────────────────────────────────────────────────────
// IFS folding: three swap-if-negative reflections followed by scale-and-shift,
// iterated n times. Each iteration subdivides the tetrahedra by 2 in each axis.
// The SDF is the folded distance divided by 2^n.
export const SierpinskiTetrahedron = {
  args: { iterations: 4, ...shared },
  argTypes: { iterations: range(1, 6, 1), ...sharedType },
  render: ({ iterations, display, resolution }) => {
    const sdf = (p) => {
      let x = p.x, y = p.y, z = p.z;
      for (let i = 0; i < iterations; i++) {
        if (x + y < 0) { const t = x; x = -y; y = -t; }
        if (x + z < 0) { const t = x; x = -z; z = -t; }
        if (y + z < 0) { const t = y; y = -z; z = -t; }
        x = x * 2 - 1;
        y = y * 2 - 1;
        z = z * 2 - 1;
      }
      const qx = Math.max(Math.abs(x) - 1, 0);
      const qy = Math.max(Math.abs(y) - 1, 0);
      const qz = Math.max(Math.abs(z) - 1, 0);
      return (Math.sqrt(qx * qx + qy * qy + qz * qz) - 0.05) / Math.pow(2, iterations);
    };
    return sdf3dStory(sdf, { display, resolution, bounds: 1.5 });
  },
};
