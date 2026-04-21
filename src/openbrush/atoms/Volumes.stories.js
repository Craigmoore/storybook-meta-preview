import * as THREE from 'three';
import { setColor, setSize } from '../utils.js';
import { edgesFromGeometry } from '../geometry.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Atoms/Volumes' };

const RED  = setColor(0.914, 0.271, 0.376);
const CYAN = setColor(0, 0.9, 1);
const GOLD = setColor(1, 0.8, 0);
const SIZE = setSize(0.03);

export const Cube = {
  render: () => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.BoxGeometry(1.6, 1.6, 1.6)),
  ]}),
};

export const Sphere = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.SphereGeometry(0.9, 10, 7)),
  ]}),
};

export const Cylinder = {
  render: () => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 10)),
  ]}),
};

export const Cone = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.ConeGeometry(0.8, 1.6, 10)),
  ]}),
};

export const Torus = {
  render: () => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.TorusGeometry(0.7, 0.28, 10, 20)),
  ]}),
};

export const TorusKnot = {
  render: () => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.TorusKnotGeometry(0.6, 0.15, 48, 7)),
  ]}),
};

export const Icosahedron = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.IcosahedronGeometry(0.95, 0)),
  ]}),
};

export const Octahedron = {
  render: () => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.OctahedronGeometry(0.95, 0)),
  ]}),
};

export const Tetrahedron = {
  render: () => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.TetrahedronGeometry(0.95, 0)),
  ]}),
};

export const Dodecahedron = {
  render: () => openbrushStory({ commands: [
    RED, SIZE,
    ...edgesFromGeometry(new THREE.DodecahedronGeometry(0.95, 0)),
  ]}),
};

export const TriangularPrism = {
  render: () => openbrushStory({ commands: [
    GOLD, SIZE,
    ...edgesFromGeometry(new THREE.CylinderGeometry(0.8, 0.8, 1.6, 3)),
  ]}),
};

export const Capsule = {
  render: () => openbrushStory({ commands: [
    CYAN, SIZE,
    ...edgesFromGeometry(new THREE.CapsuleGeometry(0.5, 0.8, 4, 10)),
  ]}),
};
