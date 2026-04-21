import { setColor, setSize, rect, circle, polygon, star, line } from '../utils.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Molecules/Compositions' };

const range    = (min, max, step = 0.05) => ({ control: { type: 'range', min, max, step } });
const intRange = (min, max)              => ({ control: { type: 'range', min, max, step: 1 } });

export const NestedSquares = {
  args: { count: 4, maxSize: 1.6, brushSize: 0.025 },
  argTypes: {
    count:     intRange(1, 8),
    maxSize:   range(0.2, 3),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ count, maxSize, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize),
    ...Array.from({ length: count }, (_, i) => {
      const s = maxSize * (1 - i / count);
      const t = i / Math.max(count - 1, 1);
      return [setColor(1 - t * 0.7, 0.27 + t * 0.5, 0.376 + t * 0.3), ...rect(0, 0, s, s)];
    }).flat(),
  ]}),
};

export const ConcentricCircles = {
  args: { count: 5, maxRadius: 1.5, segments: 96, brushSize: 0.025 },
  argTypes: {
    count:     intRange(1, 10),
    maxRadius: range(0.2, 2.5),
    segments:  intRange(8, 128),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ count, maxRadius, segments, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize),
    ...Array.from({ length: count }, (_, i) => {
      const r = maxRadius * (1 - i / count);
      const t = i / Math.max(count - 1, 1);
      return [setColor(t, 0.8 - t * 0.5, 1 - t), ...circle(0, 0, r, segments)];
    }).flat(),
  ]}),
};

export const Mandala = {
  args: { outerCount: 8, outerRadius: 1.1, outerSize: 0.28, middleCount: 6, middleRadius: 0.6, middleSize: 0.2, centreRadius: 0.18, brushSize: 0.025 },
  argTypes: {
    outerCount:   intRange(3, 16),
    outerRadius:  range(0.4, 2),
    outerSize:    range(0.05, 0.6),
    middleCount:  intRange(3, 12),
    middleRadius: range(0.2, 1.5),
    middleSize:   range(0.05, 0.4),
    centreRadius: range(0.05, 0.5),
    brushSize:    range(0.005, 0.1, 0.005),
  },
  render: ({ outerCount, outerRadius, outerSize, middleCount, middleRadius, middleSize, centreRadius, brushSize }) =>
    openbrushStory({ commands: [
      setSize(brushSize),
      ...Array.from({ length: outerCount }, (_, i) => {
        const a = (i / outerCount) * Math.PI * 2;
        const t = i / outerCount;
        return [setColor(0.914, 0.271 + t * 0.4, 0.376), ...polygon(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius, outerSize, 5, a)];
      }).flat(),
      ...Array.from({ length: middleCount }, (_, i) => {
        const a = (i / middleCount) * Math.PI * 2;
        return [setColor(0, 0.8, 1), ...polygon(Math.cos(a) * middleRadius, Math.sin(a) * middleRadius, middleSize, 3, a)];
      }).flat(),
      setColor(1, 0.8, 0),
      ...circle(0, 0, centreRadius, 48),
    ]}),
};

export const DotGrid = {
  args: { rows: 4, cols: 4, spacing: 0.55, dotRadius: 0.18, segments: 32, brushSize: 0.02 },
  argTypes: {
    rows:      intRange(1, 8),
    cols:      intRange(1, 8),
    spacing:   range(0.2, 1.2),
    dotRadius: range(0.02, 0.4),
    segments:  intRange(4, 64),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ rows, cols, spacing, dotRadius, segments, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize),
    ...Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => {
        const x = (col - (cols - 1) / 2) * spacing;
        const y = (row - (rows - 1) / 2) * spacing;
        const t = (row * cols + col) / (rows * cols);
        return [setColor(0.914 - t * 0.5, 0.271 + t * 0.5, 0.376 + t * 0.3), ...circle(x, y, dotRadius, segments)];
      }).flat()
    ).flat(),
  ]}),
};

export const InterlockingRings = {
  args: { count: 5, ringRadius: 0.38, overlap: 0.5, brushSize: 0.03 },
  argTypes: {
    count:      intRange(2, 10),
    ringRadius: range(0.1, 1),
    overlap:    range(0, 0.95),
    brushSize:  range(0.005, 0.1, 0.005),
  },
  render: ({ count, ringRadius, overlap, brushSize }) => {
    const step = ringRadius * 2 * (1 - overlap);
    const totalW = step * (count - 1);
    const colours = [[0.914,0.271,0.376],[0,0.8,1],[1,0.8,0],[0.2,0.8,0.2],[0.8,0.3,1],[0.9,0.5,0],[0.3,0.6,1],[0.8,0.2,0.5],[0.5,0.9,0.2],[1,0.4,0.1]];
    return openbrushStory({ commands: [
      setSize(brushSize),
      ...Array.from({ length: count }, (_, i) => {
        const x = -totalW / 2 + i * step;
        const y = (i % 2 === 0 ? 0.2 : -0.2);
        const [r, g, b] = colours[i % colours.length];
        return [setColor(r, g, b), ...circle(x, y, ringRadius, 64)];
      }).flat(),
    ]});
  },
};

export const Snowflake = {
  args: { spokes: 6, spokeLength: 1.3, branchCount: 3, branchLength: 0.15, brushSize: 0.025 },
  argTypes: {
    spokes:       intRange(3, 12),
    spokeLength:  range(0.2, 2.5),
    branchCount:  intRange(1, 8),
    branchLength: range(0.05, 0.5),
    brushSize:    range(0.005, 0.1, 0.005),
  },
  render: ({ spokes, spokeLength, branchCount, branchLength, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize),
    ...Array.from({ length: spokes }, (_, i) => {
      const a = (i / spokes) * Math.PI * 2;
      const pa = a + Math.PI / 2;
      const branches = Array.from({ length: branchCount }, (_, j) => {
        const t = (j + 1) / (branchCount + 1);
        const bx = Math.cos(a) * spokeLength * t;
        const by = Math.sin(a) * spokeLength * t;
        return [
          ...line(bx, by, bx + Math.cos(pa) * branchLength, by + Math.sin(pa) * branchLength),
          ...line(bx, by, bx - Math.cos(pa) * branchLength, by - Math.sin(pa) * branchLength),
        ];
      }).flat();
      return [setColor(0.7, 0.9, 1), ...line(0, 0, Math.cos(a) * spokeLength, Math.sin(a) * spokeLength), ...branches];
    }).flat(),
    setColor(0.4, 0.7, 1),
    ...polygon(0, 0, 0.25, spokes, 0),
  ]}),
};
