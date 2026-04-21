import * as THREE from 'three';
import { sceneCanvas, edgesGeometry } from '../scene-canvas.js';

export default { title: 'ThreeJS-3D/Atoms/Box' };

export const Default = {
  render: () => sceneCanvas(({ scene }) => {
    scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xe94560 })
    ));
  }),
};

export const Wireframe = {
  render: () => sceneCanvas(({ scene }) => {
    scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x16213e })
    ));
    scene.add(new THREE.LineSegments(
      edgesGeometry(new THREE.BoxGeometry(1.5, 1.5, 1.5)),
      new THREE.LineBasicMaterial({ color: 0xe94560 })
    ));
  }),
};
