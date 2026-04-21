import * as THREE from 'three';
import { setColor, setSize } from '../utils.js';
import { edgesFromGeometry } from '../geometry.js';
import { openbrushStory } from '../story.js';
import { makeTree, makeRock, makeTerrain, makeRoadNetwork, TREE_HEIGHT } from './structures.js';

export default { title: 'OpenBrush/Molecules/Structures' };

const range    = (min, max, step = 0.05) => ({ control: { type: 'range', min, max, step } });
const intRange = (min, max)              => ({ control: { type: 'range', min, max, step: 1 } });

export const Terrain = {
  args: { size: 6, segments: 19, heightScale: 0.6, seed: 1 },
  argTypes: {
    size:        range(1, 12),
    segments:    intRange(4, 60),
    heightScale: range(0, 2),
    seed:        intRange(1, 99),
  },
  render: ({ size, segments, heightScale, seed }) => openbrushStory({ commands: [
    setSize(0.03), ...makeTerrain(size, segments, heightScale, seed),
  ]}),
};

export const Road = {
  args: { roadSeed: 1, terrainSeed: 1, depth: 5 },
  argTypes: {
    roadSeed:    intRange(1, 99),
    terrainSeed: intRange(1, 99),
    depth:       intRange(1, 7),
  },
  render: ({ roadSeed, terrainSeed, depth }) => openbrushStory({ commands: [
    setSize(0.03), ...makeRoadNetwork(0, 0, roadSeed, depth, terrainSeed),
  ]}),
};

export const Tree = {
  args: { brushSize: 0.03 },
  argTypes: {
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ brushSize }) => openbrushStory({ commands: [setSize(brushSize), ...makeTree()] }),
};

export const Rocks = {
  args: { count: 3, minSize: 0.22, maxSize: 0.45, brushSize: 0.03 },
  argTypes: {
    count:     intRange(1, 8),
    minSize:   range(0.05, 0.8),
    maxSize:   range(0.1, 1.2),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ count, minSize, maxSize, brushSize }) => openbrushStory({ commands: [
    setSize(brushSize),
    ...Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const spread = 0.6;
      const size = minSize + (maxSize - minSize) * (i / Math.max(count - 1, 1));
      return makeRock(Math.cos(angle) * spread * 0.7, 0, Math.sin(angle) * spread * 0.5, size);
    }).flat(),
  ]}),
};

export const SmallHouse = {
  args: { scale: 0.38, brushSize: 0.03 },
  argTypes: {
    scale:     range(0.1, 1.5),
    brushSize: range(0.005, 0.1, 0.005),
  },
  render: ({ scale, brushSize }) => {
    const s = TREE_HEIGHT * scale;
    const r = s / Math.sqrt(3);
    const roofMatrix = new THREE.Matrix4()
      .makeTranslation(0, s + r / 2, 0)
      .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    return openbrushStory({ commands: [
      setSize(brushSize),
      setColor(0.45, 0.45, 0.45), ...edgesFromGeometry(new THREE.BoxGeometry(s, s, s), new THREE.Matrix4().makeTranslation(0, s / 2, 0)),
      setColor(0.914, 0.271, 0.376), ...edgesFromGeometry(new THREE.CylinderGeometry(r, r, s, 3), roofMatrix),
    ]});
  },
};
