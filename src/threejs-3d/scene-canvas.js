import * as THREE from 'three';

// EdgesGeometry serializes with a non-serializable `parameters.geometry` field.
// Use this wrapper instead to get a plain BufferGeometry that round-trips via ObjectLoader.
export function edgesGeometry(sourceGeometry) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.EdgesGeometry(sourceGeometry).getAttribute('position'));
  return geo;
}

// Helper for threejs-3d stories.
// Creates a perspective scene with default lighting, calls setupFn, exposes the
// scene for the storybook-channel, renders once to a canvas and returns it.
//
// setupFn receives { scene, camera } and should add objects to scene.
// Options:
//   width, height  — canvas size in pixels (default 400×400)
//   background     — scene background hex (default 0x1a1a1a)

export function sceneCanvas(setupFn, { width = 400, height = 400, background = 0x1a1a1a } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(5, 8, 5);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(3, 2.5, 4);
  camera.lookAt(0, 0, 0);

  setupFn({ scene, camera });

  window.__metaPreviewScene = scene;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.render(scene, camera);

  return renderer.domElement;
}
