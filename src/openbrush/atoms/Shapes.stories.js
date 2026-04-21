import { setColor, setSize, line, rect, polygon, circle, star } from '../utils.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Atoms/Shapes' };

const RED    = setColor(0.914, 0.271, 0.376);
const BLUE   = setColor(0.059, 0.204, 0.376);
const WHITE  = setColor(1, 1, 1);
const CYAN   = setColor(0, 0.9, 1);
const GOLD   = setColor(1, 0.8, 0);
const SIZE   = setSize(0.03);

export const Line = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...line(-1.2, -0.4, 1.2, 0.4),
  ]}),
};

export const Square = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...rect(0, 0, 1.8, 1.8),
  ]}),
};

export const Triangle = {
  render: () => openbrushStory({ commands: [
    CYAN, SIZE,
    ...polygon(0, 0, 1.0, 3),
  ]}),
};

export const Circle = {
  render: () => openbrushStory({ commands: [
    GOLD, SIZE,
    ...circle(0, 0, 1.0, 96),
  ]}),
};

export const Hexagon = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...polygon(0, 0, 1.0, 6, 0),
  ]}),
};

export const Pentagon = {
  render: () => openbrushStory({ commands: [
    CYAN, SIZE,
    ...polygon(0, 0, 1.0, 5),
  ]}),
};

export const Star5 = {
  render: () => openbrushStory({ commands: [
    GOLD, SIZE,
    ...star(0, 0, 1.1, 0.42, 5),
  ]}),
};

export const Star8 = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...star(0, 0, 1.1, 0.6, 8),
  ]}),
};

export const Cross = {
  render: () => openbrushStory({ commands: [
    WHITE, SIZE,
    ...line(-1.1, 0, 1.1, 0),
    ...line(0, -1.1, 0, 1.1),
  ]}),
};
