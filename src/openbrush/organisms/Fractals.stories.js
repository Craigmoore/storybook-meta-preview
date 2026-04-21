import { setColor, setSize } from '../utils.js';
import { sierpinskiTriangle, kochSnowflake, dragonCurve, hilbertCurve, barnsleyFern } from '../fractals.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Organisms/Fractals' };

// Sierpinski Triangle — depth 4 (81 triangles)
// The three corner sub-triangles are each coloured differently to show the recursion
export const SierpinskiTriangle = {
  render: () => {
    const r = 1.3;
    const top = [0,     r];
    const bl  = [-r * Math.sin(Math.PI / 3), -r / 2];
    const br  = [ r * Math.sin(Math.PI / 3), -r / 2];

    return openbrushStory({ commands: [
      setSize(0.015),
      setColor(0.914, 0.271, 0.376),
      ...sierpinskiTriangle(top[0], top[1], bl[0], bl[1], br[0], br[1], 4),
    ]});
  },
};

// Koch Snowflake — depth 4 (192 segments per side, single connected path per side)
export const KochSnowflake = {
  render: () => openbrushStory({ commands: [
    setSize(0.015),
    setColor(0.4, 0.85, 1),
    ...kochSnowflake(0, 0, 1.15, 4),
  ]}),
};

// Dragon Curve — 10 iterations (1024 steps)
// Fold a strip of paper in half 10 times and unfold — this is the result
export const DragonCurve = {
  render: () => openbrushStory({ commands: [
    setSize(0.02),
    setColor(0.914, 0.271, 0.376),
    ...dragonCurve(-0.4, -0.3, 10, 0.075),
  ]}),
};

// Hilbert Curve — order 4 (256 points, single connected path)
// A space-filling curve that visits every cell of a 16×16 grid
export const HilbertCurve = {
  render: () => openbrushStory({ commands: [
    setSize(0.02),
    setColor(1, 0.8, 0),
    ...hilbertCurve(0, 0, 2.2, 4),
  ]}),
};

// Barnsley Fern — 5000 IFS iterations rendered as dot strokes
// Four affine transformations whose attractor looks exactly like a fern
export const BarnsleyFern = {
  render: () => openbrushStory({ commands: [
    setSize(0.05),
    setColor(0.025, 0.105, 0.038),
    ...barnsleyFern(0, -0.1, 1.05, 5000),
  ]}),
};

// Tri-colour Sierpinski — each recursion level drawn in a distinct colour
export const SierpinskiTriColour = {
  render: () => {
    const r = 1.3;
    const top = [0,     r];
    const bl  = [-r * Math.sin(Math.PI / 3), -r / 2];
    const br  = [ r * Math.sin(Math.PI / 3), -r / 2];

    function coloured(x1, y1, x2, y2, x3, y3, depth) {
      if (depth === 0) return [];
      const colours = [
        [0.914, 0.271, 0.376],
        [0,     0.8,   1    ],
        [1,     0.8,   0    ],
      ];
      const [cr, cg, cb] = colours[((3 - depth) % 3 + 3) % 3];
      const m12 = [(x1+x2)/2, (y1+y2)/2];
      const m23 = [(x2+x3)/2, (y2+y3)/2];
      const m13 = [(x1+x3)/2, (y1+y3)/2];
      return [
        setColor(cr, cg, cb),
        ...sierpinskiTriangle(x1, y1, m12[0], m12[1], m13[0], m13[1], 0),
        ...sierpinskiTriangle(m12[0], m12[1], x2, y2, m23[0], m23[1], 0),
        ...sierpinskiTriangle(m13[0], m13[1], m23[0], m23[1], x3, y3, 0),
        ...coloured(x1, y1, m12[0], m12[1], m13[0], m13[1], depth - 1),
        ...coloured(m12[0], m12[1], x2, y2, m23[0], m23[1], depth - 1),
        ...coloured(m13[0], m13[1], m23[0], m23[1], x3, y3, depth - 1),
      ];
    }

    return openbrushStory({ commands: [
      setSize(0.015),
      ...coloured(top[0], top[1], bl[0], bl[1], br[0], br[1], 4),
    ]});
  },
};

// Double Dragon — two dragon curves mirrored, one in each colour
export const DoubleDragon = {
  render: () => openbrushStory({ commands: [
    setSize(0.018),
    setColor(0.914, 0.271, 0.376),
    ...dragonCurve(-0.3, -0.2, 9, 0.08),
    setColor(0, 0.8, 1),
    ...dragonCurve(0.3, 0.2, 9, -0.08),
  ]}),
};
