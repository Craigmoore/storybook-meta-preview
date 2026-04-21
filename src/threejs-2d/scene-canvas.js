import * as THREE from 'three';

// Helper for threejs-2d stories.
// Creates an orthographic scene, calls setupFn, exposes the scene for the
// storybook-channel, renders once to a canvas and returns it for Storybook's
// own preview.
//
// setupFn receives { scene, camera } and should add objects to scene.
// Options:
//   width, height  — canvas size in pixels (default 400×400)
//   background     — scene background hex (default 0x1a1a1a)
//   frustum        — half-height of the orthographic view (default 2)

// EdgesGeometry serializes with a non-serializable `parameters.geometry` field.
// Use this wrapper instead to get a plain BufferGeometry that round-trips via ObjectLoader.
export function edgesGeometry(sourceGeometry) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.EdgesGeometry(sourceGeometry).getAttribute('position'));
  return geo;
}

export function sceneCanvas(setupFn, { width = 400, height = 400, background = 0x1a1a1a, frustum = 2 } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    -frustum * aspect, frustum * aspect,
     frustum,          -frustum,
    0.1, 10
  );
  camera.position.z = 5;

  setupFn({ scene, camera });

  window.__metaPreviewScene = scene;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.render(scene, camera);

  return renderer.domElement;
}
