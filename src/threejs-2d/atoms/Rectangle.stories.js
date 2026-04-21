import * as THREE from 'three';
import { sceneCanvas, edgesGeometry } from '../scene-canvas.js';

export default { title: 'ThreeJS-2D/Atoms/Rectangle' };

export const Default = {
  render: () => sceneCanvas(({ scene }) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1),
      new THREE.MeshBasicMaterial({ color: 0xe94560 })
    );
    scene.add(mesh);
  }),
};

export const Outlined = {
  render: () => sceneCanvas(({ scene }) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1),
      new THREE.MeshBasicMaterial({ color: 0x16213e })
    );
    const edges = new THREE.LineSegments(
      edgesGeometry(new THREE.PlaneGeometry(2, 1)),
      new THREE.LineBasicMaterial({ color: 0xe94560 })
    );
    scene.add(mesh);
    scene.add(edges);
  }),
};
