import * as THREE from 'three';
import { sceneCanvas } from '../scene-canvas.js';

export default { title: 'ThreeJS-3D/Atoms/Sphere' };

export const Default = {
  render: () => sceneCanvas(({ scene }) => {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f3460 })
    ));
  }),
};

export const Shiny = {
  render: () => sceneCanvas(({ scene }) => {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f3460, metalness: 0.6, roughness: 0.2 })
    ));
  }),
};
