import * as THREE from 'three';
import { sceneCanvas } from '../scene-canvas.js';

export default { title: 'ThreeJS-3D/Molecules/Composition' };

export const BoxAndSphere = {
  render: () => sceneCanvas(({ scene }) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xe94560 })
    );
    box.position.x = -1.2;

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f3460 })
    );
    sphere.position.x = 1.2;

    scene.add(box, sphere);
  }),
};

export const Tower = {
  render: () => sceneCanvas(({ scene }) => {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.4, 2),
      new THREE.MeshStandardMaterial({ color: 0x16213e })
    );
    base.position.y = -1.2;

    const mid = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0f3460 })
    );

    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xe94560 })
    );
    top.position.y = 1.1;

    scene.add(base, mid, top);
  }),
};
