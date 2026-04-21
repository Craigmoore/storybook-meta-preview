import * as THREE from 'three';
import { sceneCanvas } from '../scene-canvas.js';

export default { title: 'ThreeJS-2D/Atoms/Circle' };

export const Default = {
  render: () => sceneCanvas(({ scene }) => {
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({ color: 0xe94560 })
    );
    scene.add(mesh);
  }),
};

export const Ring = {
  render: () => sceneCanvas(({ scene }) => {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 1, 64),
      new THREE.MeshBasicMaterial({ color: 0xe94560, side: THREE.DoubleSide })
    );
    scene.add(mesh);
  }),
};
