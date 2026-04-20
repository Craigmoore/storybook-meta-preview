# Setup: threejs-3d

## Purpose
Reference example for the "ThreeJS 3D component approach" — perspective Three.js scenes with lighting, shadows, and orbital controls. Copy this setup as a starting point for future projects needing 3D Three.js components.

## Ports
- Storybook: 6008
- Relay: 3335

## Run
```bash
yarn dev:threejs-3d
```

## Dependencies
- `three` npm package

## Story Format
Stories build a Three.js scene with a perspective camera and expose it via `window.__metaPreviewScene`.

```javascript
import * as THREE from 'three';

export default { title: 'ThreeJS-3D/Atoms/Box' };

export const Default = {
  render: () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xe94560, metalness: 0.3, roughness: 0.6 })
    );
    mesh.castShadow = true;
    scene.add(mesh);

    // Expose for meta-preview channel
    window.__metaPreviewScene = scene;

    // Return canvas for Storybook's own preview
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.shadowMap.enabled = true;
    renderer.render(scene, camera);
    return renderer.domElement;
  }
};
```

## Meta-Preview Protocol
1. Story sets `window.__metaPreviewScene`
2. storybook-channel serializes: `scene.toJSON()`
3. Relay broadcasts the JSON
4. meta-preview-threejs-3d.html:
   - Creates its own `PerspectiveCamera` + `WebGLRenderer` + `OrbitControls`
   - Clears previous scene on every update
   - Reconstructs with `new THREE.ObjectLoader().parse(json)`
   - Runs `requestAnimationFrame` loop with `controls.update()`

## Key Three.js APIs
See `docs/sdk-threejs.md`. Key types for 3D:
- `THREE.PerspectiveCamera`
- `THREE.BoxGeometry`, `THREE.SphereGeometry`, `THREE.CylinderGeometry` etc.
- `THREE.MeshStandardMaterial` (PBR, works with lighting)
- `THREE.AmbientLight`, `THREE.DirectionalLight`, `THREE.PointLight`
- `OrbitControls` for interactive rotation in meta-preview
