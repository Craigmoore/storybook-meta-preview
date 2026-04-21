import * as THREE from 'three';
import { sceneCanvas } from '../scene-canvas.js';

export default { title: 'ThreeJS-2D/Molecules/Layout' };

// Two rectangles side by side — demonstrates the 2D layout composition approach
export const SideBySide = {
  render: () => sceneCanvas(({ scene }) => {
    const geometry = new THREE.PlaneGeometry(1.4, 1);

    const left = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xe94560 }));
    left.position.x = -0.8;

    const right = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x0f3460 }));
    right.position.x = 0.8;

    scene.add(left, right);
  }),
};

// Circle + rectangle stacked vertically
export const Stacked = {
  render: () => sceneCanvas(({ scene }) => {
    const rect = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 0.6),
      new THREE.MeshBasicMaterial({ color: 0x0f3460 })
    );
    rect.position.y = -0.8;

    const circle = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 64),
      new THREE.MeshBasicMaterial({ color: 0xe94560 })
    );
    circle.position.y = 0.5;

    scene.add(rect, circle);
  }),
};
