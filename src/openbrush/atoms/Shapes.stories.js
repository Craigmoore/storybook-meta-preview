import { setColor, setSize, line, rect, polygon, circle, star } from '../utils.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Atoms/Shapes' };

const RED  = setColor(0.914, 0.271, 0.376);
const CYAN = setColor(0, 0.9, 1);
const GOLD = setColor(1, 0.8, 0);

const range    = (min, max, step = 0.05) => ({ control: { type: 'range', min, max, step } });
const intRange = (min, max)              => ({ control: { type: 'range', min, max, step: 1 } });

export const Line = {
  args: { x1: -1.2, y1: -0.4, x2: 1.2, y2: 0.4, brushSize: 0.03 },
  argTypes: {
    x1: range(-2, 2), y1: range(-2, 2),
    x2: range(-2, 2), y2: range(-2, 2),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ x1, y1, x2, y2, brushSize }) => openbrushStory({ commands: [
    RED, setSize(brushSize),
    ...line(x1, y1, x2, y2),
  ]}),
};

export const Square = {
  args: { width: 1.8, height: 1.8, brushSize: 0.03 },
  argTypes: {
    width:     range(0.1, 3),
    height:    range(0.1, 3),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ width, height, brushSize }) => openbrushStory({ commands: [
    RED, setSize(brushSize),
    ...rect(0, 0, width, height),
  ]}),
};

export const Triangle = {
  args: { radius: 1.0, sides: 3, brushSize: 0.03 },
  argTypes: {
    radius:    range(0.1, 2),
    sides:     intRange(3, 12),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ radius, sides, brushSize }) => openbrushStory({ commands: [
    CYAN, setSize(brushSize),
    ...polygon(0, 0, radius, sides),
  ]}),
};

export const Circle = {
  args: { radius: 1.0, segments: 96, brushSize: 0.03 },
  argTypes: {
    radius:    range(0.1, 2),
    segments:  intRange(3, 128),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ radius, segments, brushSize }) => openbrushStory({ commands: [
    GOLD, setSize(brushSize),
    ...circle(0, 0, radius, segments),
  ]}),
};

export const Hexagon = {
  args: { radius: 1.0, sides: 6, brushSize: 0.03 },
  argTypes: {
    radius:    range(0.1, 2),
    sides:     intRange(3, 12),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ radius, sides, brushSize }) => openbrushStory({ commands: [
    RED, setSize(brushSize),
    ...polygon(0, 0, radius, sides, 0),
  ]}),
};

export const Pentagon = {
  args: { radius: 1.0, sides: 5, brushSize: 0.03 },
  argTypes: {
    radius:    range(0.1, 2),
    sides:     intRange(3, 12),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ radius, sides, brushSize }) => openbrushStory({ commands: [
    CYAN, setSize(brushSize),
    ...polygon(0, 0, radius, sides),
  ]}),
};

export const Star5 = {
  args: { outerRadius: 1.1, innerRadius: 0.42, points: 5, brushSize: 0.03 },
  argTypes: {
    outerRadius: range(0.1, 2),
    innerRadius: range(0.05, 1.5),
    points:      intRange(2, 16),
    brushSize:   range(0.005, 0.1, 0.005),
  },
  render: ({ outerRadius, innerRadius, points, brushSize }) => openbrushStory({ commands: [
    GOLD, setSize(brushSize),
    ...star(0, 0, outerRadius, innerRadius, points),
  ]}),
};

export const Star8 = {
  args: { outerRadius: 1.1, innerRadius: 0.6, points: 8, brushSize: 0.03 },
  argTypes: {
    outerRadius: range(0.1, 2),
    innerRadius: range(0.05, 1.5),
    points:      intRange(2, 16),
    brushSize:   range(0.005, 0.1, 0.005),
  },
  render: ({ outerRadius, innerRadius, points, brushSize }) => openbrushStory({ commands: [
    RED, setSize(brushSize),
    ...star(0, 0, outerRadius, innerRadius, points),
  ]}),
};

export const Cross = {
  args: { length: 1.1, brushSize: 0.03 },
  argTypes: {
    length:    range(0.1, 2.5),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ length, brushSize }) => openbrushStory({ commands: [
    setColor(0.45, 0.45, 0.45), setSize(brushSize),
    ...line(-length, 0, length, 0),
    ...line(0, -length, 0, length),
  ]}),
};
