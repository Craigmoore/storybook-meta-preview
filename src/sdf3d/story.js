import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildIsosurface } from './isosurface.js';

let cleanupPrev = null;

export const displayArgType = {
  options: ['normals', 'solid', 'wireframe'],
  control: { type: 'select' },
};

export const cameraArgType = {
  options: ['perspective', 'ortho-Z', 'ortho-X', 'ortho-Y'],
  control: { type: 'select' },
};

// sdf3dStory(mapFn, opts)
//   mapFn:       (THREE.Vector3) => number — negative inside, positive outside
//   display:     'normals' | 'solid' | 'wireframe'
//   resolution:  marching-cubes grid size per axis (16–64)
//   bounds:      world-space half-extent of the sampling volume
export function sdf3dStory(mapFn, opts = {}) {
  if (cleanupPrev) { cleanupPrev(); cleanupPrev = null; }

  const { display = 'normals', resolution = 32, bounds = 1.5, camera = 'perspective' } = opts;

  const dims      = [resolution, resolution, resolution];
  const boundsArr = [[-bounds, -bounds, -bounds], [bounds, bounds, bounds]];
  const geometry = buildIsosurface(dims, mapFn, boundsArr);

  let material;
  if (display === 'wireframe') {
    material = new THREE.MeshBasicMaterial({ color: 0x88aacc, wireframe: true });
  } else if (display === 'solid') {
    material = new THREE.MeshStandardMaterial({ color: 0x7fa8cc, roughness: 0.35, metalness: 0.15 });
  } else {
    material = new THREE.MeshNormalMaterial();
  }

  const mesh  = new THREE.Mesh(geometry, material);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d12);
  scene.add(mesh);

  if (display === 'solid') {
    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 5, 4);
    scene.add(amb, dir);
  }

  const W = 512, H = 512;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  let cam;
  if (camera === 'perspective') {
    cam = new THREE.PerspectiveCamera(50, W / H, 0.01, 100);
    cam.position.set(1.8, 1.4, 2.2);
  } else {
    const s = bounds * 1.1;
    cam = new THREE.OrthographicCamera(-s, s, s, -s, 0.01, 100);
    if      (camera === 'ortho-Z') cam.position.set(0, 0, 10);
    else if (camera === 'ortho-X') cam.position.set(10, 0, 0);
    else if (camera === 'ortho-Y') cam.position.set(0, 10, 0);
  }
  cam.lookAt(0, 0, 0);

  const controls = new OrbitControls(cam, renderer.domElement);
  controls.enableDamping = true;

  let frameId;
  (function animate() {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, cam);
  })();

  cleanupPrev = () => {
    cancelAnimationFrame(frameId);
    controls.dispose();
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    scene.clear();
  };

  window.__metaPreviewSDF3D = {
    positions: Array.from(geometry.attributes.position.array),
    normals:   Array.from(geometry.attributes.normal.array),
    index:     geometry.index ? Array.from(geometry.index.array) : null,
    display,
  };

  return renderer.domElement;
}
