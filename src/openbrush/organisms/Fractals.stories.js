import { setColor, setSize } from '../utils.js';
import { sierpinskiTriangle, kochSnowflake, dragonCurve, hilbertCurve, barnsleyFern } from '../fractals.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Organisms/Fractals' };

const range    = (min, max, step = 0.05) => ({ control: { type: 'range', min, max, step } });
const intRange = (min, max)              => ({ control: { type: 'range', min, max, step: 1 } });

export const SierpinskiTriangle = {
  args: { depth: 4, radius: 1.3, brushSize: 0.015 },
  argTypes: {
    depth:     intRange(0, 6),
    radius:    range(0.2, 2),
    brushSize: range(0.005, 0.06, 0.005),
  },
  render: ({ depth, radius, brushSize }) => {
    const top = [0, radius];
    const bl  = [-radius * Math.sin(Math.PI / 3), -radius / 2];
    const br  = [ radius * Math.sin(Math.PI / 3), -radius / 2];
    return openbrushStory({ commands: [
      setSize(brushSize), setColor(0.914, 0.271, 0.376),
      ...sierpinskiTriangle(top[0], top[1], bl[0], bl[1], br[0], br[1], depth),
    ]});
  },
};

export const KochSnowflake = {
  args: { depth: 4, radius: 1.15, brushSize: 0.015 },
  argTypes: {
    depth:     intRange(0, 5),
    radius:    range(0.2, 2),
    brushSize: range(0.005, 0.06, 0.005),
  },
  render: ({ depth, radius, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize), setColor(0.4, 0.85, 1),
    ...kochSnowflake(0, 0, radius, depth),
  ]}),
};

export const DragonCurve = {
  args: { iterations: 10, stepSize: 0.075, brushSize: 0.02 },
  argTypes: {
    iterations: intRange(1, 13),
    stepSize:   range(0.01, 0.2, 0.005),
    brushSize:  range(0.005, 0.06, 0.005),
  },
  render: ({ iterations, stepSize, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize), setColor(0.914, 0.271, 0.376),
    ...dragonCurve(-0.4, -0.3, iterations, stepSize),
  ]}),
};

export const HilbertCurve = {
  args: { order: 4, size: 2.2, brushSize: 0.02 },
  argTypes: {
    order:     intRange(1, 6),
    size:      range(0.5, 3.5),
    brushSize: range(0.005, 0.06, 0.005),
  },
  render: ({ order, size, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize), setColor(1, 0.8, 0),
    ...hilbertCurve(0, 0, size, order),
  ]}),
};

export const BarnsleyFern = {
  args: { iterations: 5000, scale: 1.05, brushSize: 0.05 },
  argTypes: {
    iterations: intRange(100, 8000),
    scale:      range(0.3, 2),
    brushSize:  range(0.01, 0.15, 0.005),
  },
  render: ({ iterations, scale, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize), setColor(0.025, 0.105, 0.038),
    ...barnsleyFern(0, -0.1, scale, iterations),
  ]}),
};

export const SierpinskiTriColour = {
  args: { depth: 4, radius: 1.3, brushSize: 0.015 },
  argTypes: {
    depth:     intRange(1, 5),
    radius:    range(0.2, 2),
    brushSize: range(0.005, 0.06, 0.005),
  },
  render: ({ depth, radius, brushSize }) => {
    const top = [0, radius];
    const bl  = [-radius * Math.sin(Math.PI / 3), -radius / 2];
    const br  = [ radius * Math.sin(Math.PI / 3), -radius / 2];
    const colours = [[0.914,0.271,0.376],[0,0.8,1],[1,0.8,0]];

    function coloured(x1, y1, x2, y2, x3, y3, d) {
      if (d === 0) return [];
      const [cr, cg, cb] = colours[((3 - d) % 3 + 3) % 3];
      const m12 = [(x1+x2)/2, (y1+y2)/2];
      const m23 = [(x2+x3)/2, (y2+y3)/2];
      const m13 = [(x1+x3)/2, (y1+y3)/2];
      return [
        setColor(cr, cg, cb),
        ...sierpinskiTriangle(x1, y1, m12[0], m12[1], m13[0], m13[1], 0),
        ...sierpinskiTriangle(m12[0], m12[1], x2, y2, m23[0], m23[1], 0),
        ...sierpinskiTriangle(m13[0], m13[1], m23[0], m23[1], x3, y3, 0),
        ...coloured(x1, y1, m12[0], m12[1], m13[0], m13[1], d - 1),
        ...coloured(m12[0], m12[1], x2, y2, m23[0], m23[1], d - 1),
        ...coloured(m13[0], m13[1], m23[0], m23[1], x3, y3, d - 1),
      ];
    }

    return openbrushStory({ commands: [
      setSize(brushSize),
      ...coloured(top[0], top[1], bl[0], bl[1], br[0], br[1], depth),
    ]});
  },
};

export const DoubleDragon = {
  args: { iterations: 9, stepSize: 0.08, brushSize: 0.018 },
  argTypes: {
    iterations: intRange(1, 12),
    stepSize:   range(0.01, 0.2, 0.005),
    brushSize:  range(0.005, 0.06, 0.005),
  },
  render: ({ iterations, stepSize, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize),
    setColor(0.914, 0.271, 0.376), ...dragonCurve(-0.3, -0.2,  iterations,  stepSize),
    setColor(0, 0.8, 1),           ...dragonCurve( 0.3,  0.2,  iterations, -stepSize),
  ]}),
};
