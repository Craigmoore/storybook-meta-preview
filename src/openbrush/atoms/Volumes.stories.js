import * as THREE from 'three';
import { setColor, setSize } from '../utils.js';
import { edgesFromGeometry } from '../geometry.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Atoms/Volumes' };

const RED  = setColor(0.914, 0.271, 0.376);
const CYAN = setColor(0, 0.9, 1);
const GOLD = setColor(1, 0.8, 0);
const SIZE = setSize(0.03);

const range  = (min, max, step = 0.05) => ({ control: { type: 'range', min, max, step } });
const intRange = (min, max)            => ({ control: { type: 'range', min, max, step: 1 } });

export const Cube = {
  args: { width: 1.6, height: 1.6, depth: 1.6 },
  argTypes: {
    width:  range(0.1, 3),
    height: range(0.1, 3),
    depth:  range(0.1, 3),
  },
  render: ({ width, height, depth }) => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.BoxGeometry(width, height, depth)),
  ]}),
};

export const Sphere = {
  args: { radius: 0.9, widthSegments: 10, heightSegments: 7 },
  argTypes: {
    radius:         range(0.1, 2),
    widthSegments:  intRange(3, 24),
    heightSegments: intRange(2, 16),
  },
  render: ({ radius, widthSegments, heightSegments }) => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.SphereGeometry(radius, widthSegments, heightSegments)),
  ]}),
};

export const Cylinder = {
  args: { radiusTop: 0.6, radiusBottom: 0.6, height: 1.6, radialSegments: 10 },
  argTypes: {
    radiusTop:      range(0, 2),
    radiusBottom:   range(0, 2),
    height:         range(0.1, 4),
    radialSegments: intRange(3, 24),
  },
  render: ({ radiusTop, radiusBottom, height, radialSegments }) => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)),
  ]}),
};

export const Cone = {
  args: { radius: 0.8, height: 1.6, radialSegments: 10 },
  argTypes: {
    radius:         range(0.1, 2),
    height:         range(0.1, 4),
    radialSegments: intRange(3, 24),
  },
  render: ({ radius, height, radialSegments }) => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.ConeGeometry(radius, height, radialSegments)),
  ]}),
};

export const Torus = {
  args: { radius: 0.7, tube: 0.28, radialSegments: 10, tubularSegments: 20 },
  argTypes: {
    radius:           range(0.1, 2),
    tube:             range(0.05, 1),
    radialSegments:   intRange(3, 20),
    tubularSegments:  intRange(4, 48),
  },
  render: ({ radius, tube, radialSegments, tubularSegments }) => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)),
  ]}),
};

export const TorusKnot = {
  args: { radius: 0.6, tube: 0.15, tubularSegments: 48, radialSegments: 7, p: 2, q: 3 },
  argTypes: {
    radius:          range(0.1, 1.5),
    tube:            range(0.02, 0.5),
    tubularSegments: intRange(16, 96),
    radialSegments:  intRange(3, 16),
    p:               intRange(1, 8),
    q:               intRange(1, 8),
  },
  render: ({ radius, tube, tubularSegments, radialSegments, p, q }) => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q)),
  ]}),
};

export const Icosahedron = {
  args: { radius: 0.95, detail: 0 },
  argTypes: {
    radius: range(0.1, 2),
    detail: intRange(0, 3),
  },
  render: ({ radius, detail }) => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.IcosahedronGeometry(radius, detail)),
  ]}),
};

export const Octahedron = {
  args: { radius: 0.95, detail: 0 },
  argTypes: {
    radius: range(0.1, 2),
    detail: intRange(0, 3),
  },
  render: ({ radius, detail }) => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.OctahedronGeometry(radius, detail)),
  ]}),
};

export const Tetrahedron = {
  args: { radius: 0.95, detail: 0 },
  argTypes: {
    radius: range(0.1, 2),
    detail: intRange(0, 3),
  },
  render: ({ radius, detail }) => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.TetrahedronGeometry(radius, detail)),
  ]}),
};

export const Dodecahedron = {
  args: { radius: 0.95, detail: 0 },
  argTypes: {
    radius: range(0.1, 2),
    detail: intRange(0, 2),
  },
  render: ({ radius, detail }) => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.DodecahedronGeometry(radius, detail)),
  ]}),
};

export const Capsule = {
  args: { radius: 0.5, length: 0.8, capSegments: 4, radialSegments: 10 },
  argTypes: {
    radius:        range(0.1, 1.5),
    length:        range(0, 3),
    capSegments:   intRange(1, 12),
    radialSegments: intRange(3, 24),
  },
  render: ({ radius, length, capSegments, radialSegments }) => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments)),
  ]}),
};

export const TriangularPrism = {
  args: { radius: 0.8, height: 1.6 },
  argTypes: {
    radius: range(0.1, 2),
    height: range(0.1, 4),
  },
  render: ({ radius, height }) => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.CylinderGeometry(radius, radius, height, 3)),
  ]}),
};
