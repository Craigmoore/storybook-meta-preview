# Setup: bantervr-3d

## Purpose
Demonstrates Storybook for BanterVR 3D scene components — GameObjects with geometry, materials, physics, and lighting. Stories are authored using the BS SDK; a Three.js mock renders an approximate preview in Storybook; the inject script reconstructs the real scene in-world using the live BS API.

The key property: stories describe a scene using BS API calls. The mock translates those calls into Three.js geometry for the preview. The inject script replays them against the live Banter runtime.

## Ports
- Storybook: 6012
- Relay: 3339

## Run
```bash
yarn dev:bantervr-3d
```

## Dependencies
- `three` — Three.js for the Storybook preview renderer and mock geometry mapping
- `three/addons/controls/OrbitControls.js` — interactive camera in preview
- `three/addons/loaders/GLTFLoader.js` — GLTF model loading in mock preview

---

## Story format

Stories use the `banterVrStory()` helper from `src/bantervr-3d/story.js`. The render function receives `(scene, BS)` where `BS` is the mock API in Storybook preview and the real API in-world.

```js
import { banterVrStory } from '../story.js';

export default { title: 'BanterVR-3D/Atoms/Primitives' };

export const Sphere = {
  args:     { radius: 0.5, color: '#ff4444' },
  argTypes: { radius: { control: { type: 'range', min: 0.1, max: 2, step: 0.1 } }, color: { control: 'color' } },

  render: ({ radius, color }) => banterVrStory((scene, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Sphere', localPosition: new BS.Vector3(0, 0, 0) });
    obj.AddComponent(new BS.BanterSphere({ radius }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};
```

`banterVrStory()`:
1. Runs the render function with the mock BS
2. Collects the returned GameObject(s) — single object or array
3. Builds a Three.js scene: default ambient + directional light, adds each object's Three.js counterpart
4. Creates a `WebGLRenderer` + `PerspectiveCamera` + `OrbitControls`
5. Returns the renderer canvas as the Storybook preview element
6. Stashes the serialised scene JSON on `window.__metaPreviewBanterVR3D` for relay broadcast

---

## Mock BS — Three.js mapping

`src/bantervr-3d/mock-bs-3d.js` builds a Three.js scene from BS API calls.

### MockGameObject

Wraps a `THREE.Group`. Constructor config sets the group's position, rotation, and scale from the `localPosition`, `localEulerAngles`, and `localScale` args. Parent/child relationships are mirrored in the Three.js hierarchy.

### AddComponent mapping

| BS component | Three.js equivalent |
|---|---|
| `BanterBox` | `THREE.BoxGeometry` |
| `BanterSphere` | `THREE.SphereGeometry` |
| `BanterPlane` | `THREE.PlaneGeometry` |
| `BanterCylinder` | `THREE.CylinderGeometry` |
| `BanterCone` | `THREE.ConeGeometry` |
| `BanterCircle` | `THREE.CircleGeometry` |
| `BanterTorus` | `THREE.TorusGeometry` |
| `BanterTorusKnot` | `THREE.TorusKnotGeometry` |
| `BanterMaterial` | `THREE.MeshStandardMaterial` — `color` from `Vector4` rgb, `metalness`/`roughness` if provided |
| `Light` | `THREE.AmbientLight`, `THREE.DirectionalLight`, `THREE.PointLight`, or `THREE.SpotLight` |
| `BanterGLTF` | `THREE.GLTFLoader` — loads the url in the browser preview |
| `BanterText` | Canvas texture mesh — approximation only |
| `BanterRigidbody`, colliders | **No-op in preview** — physics is Banter-only |
| `BanterAOBaking` | **No-op in preview** — baking is Banter-only |

Geometry components (`BanterBox` etc.) create a `THREE.Mesh` with a default `MeshStandardMaterial(white)` and add it to the group. A subsequent `BanterMaterial` call updates the material on all mesh children in the group.

### Default preview scene

`banterVrStory()` always adds to the Three.js scene:
- `THREE.AmbientLight` at intensity 0.4
- `THREE.DirectionalLight` at position `(5, 10, 5)` intensity 0.8, casting shadows

This ensures objects are visible even when stories don't add their own lights. Story-defined lights are additive.

Default camera: `PerspectiveCamera(60°)` at `(3, 2.5, 4)` looking at origin. Stories can override via a `cameraPosition` option on `banterVrStory()`.

---

## Scene serialisation

The mock serialises to JSON for relay broadcast:

```json
{
  "objects": [
    {
      "name": "Sphere",
      "localPosition": { "x": 0, "y": 0, "z": 0 },
      "localEulerAngles": { "x": 0, "y": 0, "z": 0 },
      "localScale": { "x": 1, "y": 1, "z": 1 },
      "components": [
        { "type": "BanterSphere", "config": { "radius": 0.5 } },
        { "type": "BanterMaterial", "config": { "color": [1, 0.27, 0.27, 1] } }
      ],
      "children": []
    }
  ]
}
```

Children are nested, mirroring the GameObject hierarchy.

---

## In-world meta-preview

`public/meta-preview-bantervr-inject-3d.js` — self-contained inject script, same embed pattern as `bantervr-ui`:

```html
<script position="0 1.5 -2" rotation="0 0 0" scale="1 1 1"
        src="http://[host]:3340/meta-preview-bantervr-inject-3d.js"></script>
```

On story update:
1. Destroys all GameObjects from the previous story
2. Parses scene JSON from relay
3. Recursively reconstructs the hierarchy using live BS API:

```js
function reconstruct(objData, parent) {
  const obj = new BS.GameObject({
    name:             objData.name,
    localPosition:    new BS.Vector3(...objData.localPosition),
    localEulerAngles: new BS.Vector3(...objData.localEulerAngles),
    localScale:       new BS.Vector3(...objData.localScale),
    parent,
  });
  for (const { type, config } of objData.components) {
    obj.AddComponent(new BS[type](config));
  }
  for (const child of objData.children) {
    reconstruct(child, obj);
  }
  return obj;
}
```

Physics components (`BanterRigidbody`, colliders) round-trip through serialisation and are applied in-world, so physics stories that appear static in the preview will be live in Banter.

---

## Story hierarchy

| Level | Concept | Planned stories |
|---|---|---|
| Atom | Single component or primitive | Primitives (all geometry types), GLTF, Text, Lights |
| Molecule | Composed object | Materials showcase, SimpleHouse, Snowman, Table, WithPhysics |
| Organism | Full scene | Room, PhysicsStack, Gallery, AOBakingDemo |

### Atoms

**Primitives** — one story per geometry type: Box, Sphere, Cylinder, Cone, Torus, TorusKnot, Plane, Circle. Each has color and size controls. A `Volumes` story shows all types together in a grid.

**GLTF** — loads a publicly available GLB (e.g. Khronos sample models). In the preview, `THREE.GLTFLoader` fetches the file; in-world, `BS.BanterGLTF` loads it natively.

**Text** — `BS.BanterText` with font size, alignment, and rich text controls.

**Lights** — PointLight, DirectionalLight, SpotLight each shown illuminating a neutral sphere.

### Molecules

**Materials** — same BanterSphere with a range of BanterMaterial configs: solid colors, textured (url), double-sided.

**WithPhysics** — a box with `BanterRigidbody` + `BoxCollider` on a `BanterPlane` floor. Preview shows the initial static pose; in-world the box falls and rests on the floor. Documents the preview/runtime divergence clearly.

**SimpleHouse** — BanterBox walls, BanterCylinder chimney, BanterCone roof — a composed parent/child hierarchy.

**Table** — top plane + four cylinder legs as children of a parent group.

### Organisms

**Room** — floor, four walls, ceiling, a light, a simple piece of furniture. Demonstrates a closed interior space that is navigable in-world.

**PhysicsStack** — a column of boxes with rigidbodies stacked on a floor plane. Static in preview, collapses under gravity in-world.

**AOBakingDemo** — a group of primitives with `BanterAOBaking`. Preview shows the unbaked geometry; the component is a no-op in preview but bakes in-world.

---

## Physics in preview vs in-world

Physics components (`BanterRigidbody`, colliders) serialise and reconstruct faithfully in the inject script. The preview always shows the **initial authored position** — there is no physics simulation in the mock. Stories should be designed so the static pose is visually meaningful on its own.

---

## Key APIs
See `docs/sdk-banter.md`. Relevant for this setup:
- `BS.GameObject` — core building block, transform hierarchy
- Geometry: `BS.BanterBox`, `BS.BanterSphere`, `BS.BanterPlane`, `BS.BanterCylinder`, `BS.BanterCone`, `BS.BanterTorus`, `BS.BanterTorusKnot`
- `BS.BanterMaterial` — surface colour and shader
- `BS.BanterText` — 3D world-space text
- `BS.BanterGLTF` — external glTF/GLB models
- `BS.Light` — point, directional, spot
- Physics: `BS.BanterRigidbody`, `BS.BoxCollider`, `BS.SphereCollider`, `BS.CapsuleCollider`
- `BS.BanterAOBaking` — ambient occlusion baking for static geometry
- `BS.Vector3`, `BS.Vector4`, `BS.Quaternion`
