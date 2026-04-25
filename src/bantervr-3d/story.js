import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MockBS3D } from './mock-bs-3d.js';

// Dispose previous story's renderer + controls before starting a new one,
// preventing leaked animation loops when Storybook re-renders.
let cleanupPrev = null;

export function banterVrStory(renderFn, { cameraPosition } = {}) {
  if (cleanupPrev) { cleanupPrev(); cleanupPrev = null; }

  const result  = renderFn({}, MockBS3D);
  const objects = Array.isArray(result) ? result : (result ? [result] : []);

  window.__metaPreviewBanterVR3D = {
    sceneData: { objects: objects.map(o => o.toJSON?.()).filter(Boolean) },
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Default lights — always present regardless of story content
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 5);
  dir.castShadow = true;
  scene.add(dir);

  for (const obj of objects) {
    if (obj?._group) scene.add(obj._group);
  }

  const W = 600, H = 400;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  const cp = cameraPosition ?? { x: 3, y: 2.5, z: 4 };
  camera.position.set(cp.x, cp.y, cp.z);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  let frameId;
  (function animate() {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();

  cleanupPrev = () => {
    cancelAnimationFrame(frameId);
    controls.dispose();
    renderer.dispose();
    scene.clear();
  };

  return renderer.domElement;
}

// Convenience helper: convert a CSS hex colour string to a normalised [0..1] array.
export function hexToVec(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
