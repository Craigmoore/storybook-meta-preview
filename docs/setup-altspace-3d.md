# Setup: altspace-3d

## Purpose
Parallel fork of `bantervr-3d` targeting the `Altspace` branch of BanterSDK (`~/dev/flashygraphics/projects/BanterSDK`) — SideQuest's internal rebrand of the SDK ("SideQuest Creator SDK"). The 3D geometry/material component API (`BanterBox`, `BanterSphere`, `BanterCylinder`, `BanterCone`, `BanterTorus`, `BanterTorusKnot`, `BanterMaterial`, and their config properties) is confirmed byte-for-byte unchanged from upstream Banter on that branch — verified by diffing the relevant C# component files (`Runtime/Scripts/Scene/Components/Geometries/*.cs`, `BanterMaterial.cs`) directly against `main`, not just checking the classes exist. This setup exists as its own named copy (own stories, mock, meta-preview, inject script, standalone demo) so it can diverge independently if Altspace's runtime changes later — same rationale as `altspace-ui`.

Demonstrates Storybook for 3D scene components — GameObjects with geometry and materials. Stories are authored using the BS SDK; a Three.js mock renders an approximate preview in Storybook; the inject script reconstructs the real scene in-world using the live BS API. This is a rebrand-only fork: naming and paths changed, nothing about how the mock/inject/serialisation works.

## Ports
- Storybook: 6017
- Relay: 3344

## Run
```bash
yarn dev:altspace-3d
```

## Dependencies
Same as `bantervr-3d`:
- `three` — Three.js for the Storybook preview renderer and mock geometry mapping
- `three/addons/controls/OrbitControls.js` — interactive camera in preview

---

## Story format

Stories use the `altspace3dStory()` helper from `src/altspace-3d/story.js` (renamed from `bantervr-3d`'s `banterVrStory()` — same behaviour). The render function receives `(scene, BS)` where `BS` is the mock API in Storybook preview and the real API in-world.

```js
import { altspace3dStory, hexToVec } from '../story.js';

export default { title: 'Altspace-3D/Atoms/Primitives' };

export const Sphere = {
  args:     { radius: 0.5, color: '#4488ff' },
  argTypes: { radius: { control: { type: 'range', min: 0.1, max: 2, step: 0.1 } }, color: { control: 'color' } },

  render: ({ radius, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Sphere' });
    obj.AddComponent(new BS.BanterSphere({ radius }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};
```

`altspace3dStory()`:
1. Runs the render function with the mock BS
2. Collects the returned GameObject(s) — single object or array
3. Builds a Three.js scene: default ambient + directional light, adds each object's Three.js counterpart
4. Creates a `WebGLRenderer` + `PerspectiveCamera` + `OrbitControls`
5. Returns the renderer canvas as the Storybook preview element
6. Stashes the serialised scene JSON on `window.__metaPreviewAltspace3D` for relay broadcast

---

## Mock BS — Three.js mapping

`src/altspace-3d/mock-bs-3d.js` builds a Three.js scene from BS API calls — identical mapping to `bantervr-3d`'s mock, since the component API is unchanged. See `docs/setup-bantervr-3d.md#mock-bs--threejs-mapping` for the full `AddComponent` → Three.js geometry table; not duplicated here to avoid the two drifting out of sync in the docs while staying in sync in the code.

---

## Scene serialisation & wire protocol

Same shape as `bantervr-3d`, but with its own `window` global and relay message field so the two setups (running on independent ports) never collide, and so the generic `meta-preview-altspace-inject.js`/`meta-preview-altspace-blockdrop-inject.js` scripts (which only react to `altspaceUIData`/`altspace3DData` respectively) never mistake one payload for another:

| | `bantervr-3d` | `altspace-3d` |
|---|---|---|
| Window global | `window.__metaPreviewBanterVR3D` | `window.__metaPreviewAltspace3D` |
| Relay message field | `banterVR3DData` | `altspace3DData` |
| Inject script relay role | `banter-inject` | `altspace-inject` (shared with `altspace-ui`'s inject scripts — setups are isolated by relay port, not role name, same as `bantervr-ui`/`bantervr-3d` both sharing `banter-inject`) |

`src/storybook-channel.js` has its own `if (window.__metaPreviewAltspace3D)` branch (mirroring the `BanterVR3D` one) that sends the `altspace3DData` field. Verified end-to-end with a real WebSocket client registered as `altspace-inject` against the running relay: selecting a story produces a `story-rendered` message with `altspace3DData` populated (matching `reconstructObject()`'s expected `{name, localPosition, localEulerAngles, localScale, components, children}` shape) and no `html` field — confirming the generic inject scripts, which only match on their own field name, won't misfire on this setup's stories.

---

## In-world meta-preview

`public/meta-preview-altspace-inject-3d.js` — straight copy of `meta-preview-bantervr-inject-3d.js`, same embed pattern:

```html
<script position="0 1.5 2" rotation="0 0 0" scale="1 1 1"
        src="https://[host]:33440/meta-preview-altspace-inject-3d.js"></script>
```

Unlike `altspace-ui`'s `BlockDrop`, there's no reason for this setup's inject script to derive its position from another tag — `altspace-3d` has exactly one inject script and nothing else competing for the same spot, so it keeps its own independent `position`/`rotation`/`scale` tag attributes, same as `bantervr-3d`.

On story update: destroys all GameObjects from the previous story, then recursively reconstructs the hierarchy using the live BS API.

**A significant divergence from `bantervr-3d`'s inject script**, found through two rounds of live testing: `BS.GameObject`'s `parent` option, combined with a `localPosition` meant to be relative to that parent, does not reliably compose transforms on the real Altspace runtime — at *any* nesting depth, not just at one level.

Round 1: `bantervr-3d`'s original version wraps every top-level story object in an extra `__story_root__` GameObject at the tag's position, with story objects `parent`ed under it. Live-tested: raising the tag's `position` Y attribute had no effect — objects stayed at their raw authored height. Fixed by dropping the wrapper and folding the tag's position directly into each top-level object's own values (matching `meta-preview-altspace-inject.js`, 2D/UI, confirmed working live for `BlockDrop`), while leaving *nested* children (e.g. `FractalTree`'s branches, still `parent`ed to their reconstructed JS object) untouched.

Round 2: live-tested again — `Primitives` and `Volumes` (both flat, no nested children) now positioned correctly, but `Fractals` (`FractalTree`/`SierpinskiTetrahedron`/`MengerSponge`, all built from a parent object with many nested children) were *still* sunk in the floor. This isolated the fault to the nested-children `parent:` pattern specifically — the exact "known-good" pattern from `altspace-3d-test.js`'s `group`/`childA`/`childB` demo, which had apparently never actually been live-tested either.

The fix: **no GameObject is ever created with a `parent` field at all**, at any depth. `reconstructObject()` now carries a running position/rotation/scale offset down through the recursion, and each object (top-level or nested) is constructed with the *full cumulative* offset — its own authored value plus every ancestor's (the tag's position/rotation/scale being the outermost ancestor). Every object ends up fully independent, positioned correctly without depending on parent-transform composition working at all.

This is an approximation, not a fully general 3D transform: position/scale compose by plain component-wise sum/product rather than rotating the position offset by the accumulated rotation first — exact whenever every ancestor's own rotation is `(0,0,0)`, true for every current story (`FractalTree`'s branches already compute their own absolute orientation directly — see the "no pivot parents with cascading rotations" comment in `Fractals.stories.js` — rather than relying on inheriting rotation from a rotated parent).

Verified with a harness that runs the real file end-to-end (mocked `BS`/`WebSocket`) against the actual `FractalTree` wire payload captured live: confirms `FractalTree` gets `tag position + its own offset`, its `branch` child gets `FractalTree's full position + its own offset` (not just its own raw offset), and neither object has a `parent` field set at all.

Confirmed live in Altspace after this fix — `Primitives`, `Volumes`, and `Fractals` (`FractalTree`/`SierpinskiTetrahedron`/`MengerSponge`) all position correctly, including `Fractals`' nested children.

---

## Standalone demo

`public/altspace-3d-test.js` — straight copy of `bantervr-3d-test.js`; same known-good patterns (component order, material application, parent/child hierarchy, physics, lights) apply unchanged, since none of the APIs it exercises differ on the Altspace branch.

```html
<script src="https://[host]:33440/altspace-3d-test.js"></script>
```

---

## Current stories

Only `atoms/` and `molecules/` exist so far — same as `bantervr-3d` (its `docs/setup-bantervr-3d.md` describes a larger planned `organisms/` tier that was never actually built; `.storybook-bantervr-3d/main.js` still referenced that directory's glob, which meant `yarn storybook:bantervr-3d` was actually broken — see `CHANGELOG.md`. Fixed there and not carried over here — `.storybook-altspace-3d/main.js` only globs `atoms/`/`molecules/`).

- `Altspace-3D / Atoms / Primitives` — Box, Sphere, Cylinder, Cone, Torus, TorusKnot; each with colour picker and size range controls
- `Altspace-3D / Molecules / Volumes` — all six primitives in a row; TorusKnot uses `side: 'Double'` to avoid backface-culling artefacts
- `Altspace-3D / Molecules / Fractals` — FractalTree (seeded binary tree, depth/angle/spread/decay controls), SierpinskiTetrahedron (IFS, order 1–3), MengerSponge (IFS, level 1–2)

---

## Key APIs
See `docs/sdk-banter.md`. Relevant for this setup:
- `BS.GameObject` — core building block, transform hierarchy
- Geometry: `BS.BanterBox`, `BS.BanterSphere`, `BS.BanterCylinder`, `BS.BanterCone`, `BS.BanterTorus`, `BS.BanterTorusKnot`
- `BS.BanterMaterial` — surface colour and shader
- `BS.Vector3`, `BS.Vector4`
