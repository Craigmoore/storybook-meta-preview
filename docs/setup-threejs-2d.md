# Setup: threejs-2d

## Purpose
Reference example for the "ThreeJS 2D layout approach" — flat, orthographic Three.js scenes useful for 2D UI layouts, diagrams, and flat design systems. Copy this setup as a starting point for future projects needing 2D Three.js layouts.

## Ports
- Storybook: 6007
- Relay: 3334

## Run
```bash
yarn dev:threejs-2d
```

## Dependencies
- `three` npm package

## Story Format
Stories build a Three.js scene with an orthographic camera and expose it via `window.__metaPreviewScene`. The render function returns a canvas element for display in Storybook's own preview.

```javascript
import * as THREE from 'three';

export default { title: 'ThreeJS-2D/Atoms/Rectangle' };

export const Default = {
  render: () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Orthographic — no perspective distortion
    const aspect = 1;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    camera.position.z = 5;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xe94560 })
    );
    scene.add(mesh);

    // Expose for meta-preview channel
    window.__metaPreviewScene = scene;

    // Return canvas for Storybook's own preview
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.render(scene, camera);
    return renderer.domElement;
  }
};
```

## Meta-Preview Protocol
1. Story sets `window.__metaPreviewScene`
2. storybook-channel serializes: `scene.toJSON()`
3. Relay broadcasts the JSON
4. meta-preview-threejs-2d.html:
   - Creates its own `OrthographicCamera` + `WebGLRenderer`
   - Clears previous scene on every update
   - Reconstructs with `new THREE.ObjectLoader().parse(json)`
   - Renders with `requestAnimationFrame`

## Key Three.js APIs
See `docs/sdk-threejs.md`. Key types for 2D:
- `THREE.OrthographicCamera`
- `THREE.PlaneGeometry`, `THREE.CircleGeometry`, `THREE.ShapeGeometry`
- `THREE.MeshBasicMaterial` (no lighting needed for flat 2D)
- `THREE.Group` for layout composition
