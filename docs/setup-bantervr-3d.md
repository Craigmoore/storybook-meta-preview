# Setup: bantervr-3d

## Purpose
Demonstrates Storybook for BanterVR 3D scene components — GameObjects with geometry, materials, physics, and lighting. Same meta-preview embed approach as `bantervr-ui` but focused on spatial 3D objects rather than UI.

## Ports
- Storybook: 6012
- Relay: 3339

## Run
```bash
yarn dev:bantervr-3d
```

## How the Meta-Preview Works
Identical to `bantervr-ui` — script embedded in Banter scene's `index.html`. See `docs/setup-bantervr-ui.md` for the full embed process.

## Story Format
Stories export a render function that receives `(scene, BS)` and creates BanterVR GameObjects with geometry and components.

```javascript
// Atom: a single 3D primitive
export default { title: 'BanterVR-3D/Atoms/Sphere' };
export const Default = {
  render: (scene, BS) => {
    const sphere = new BS.GameObject({
      name: 'StorySphere',
      localPosition: new BS.Vector3(0, 1.5, 2)
    });

    sphere.AddComponent(new BS.BanterSphere({ radius: 0.5 }));
    sphere.AddComponent(new BS.BanterMaterial({
      color: new BS.Vector4(1, 0, 0, 1)   // red
    }));

    return sphere;
  }
};

// Molecule: a group of primitives
export default { title: 'BanterVR-3D/Molecules/Stack' };
export const Default = {
  render: (scene, BS) => {
    const objects = [];

    const colors = [
      new BS.Vector4(1, 0, 0, 1),
      new BS.Vector4(0, 1, 0, 1),
      new BS.Vector4(0, 0, 1, 1),
    ];

    colors.forEach((color, i) => {
      const box = new BS.GameObject({
        name: `StoryBox${i}`,
        localPosition: new BS.Vector3(0, i * 0.6, 2)
      });
      box.AddComponent(new BS.BanterBox({ width: 0.5, height: 0.5, depth: 0.5 }));
      box.AddComponent(new BS.BanterMaterial({ color }));
      objects.push(box);
    });

    return objects;
  }
};
```

## Scene Clearing
Same as `bantervr-ui` — all objects returned by the previous story's render function are destroyed before the new story runs.

Render functions can return a single `BS.GameObject` or an array of them — the meta-preview handles both.

## Key APIs
See `docs/sdk-banter.md`. Relevant for this setup:
- `BS.GameObject` — core building block
- Geometry: `BS.BanterBox`, `BS.BanterSphere`, `BS.BanterPlane`, `BS.BanterCylinder`, `BS.BanterCone`, `BS.BanterTorus`
- `BS.BanterMaterial` — surface colour and shader
- `BS.BanterText` — 3D text
- `BS.BanterGLTF` — load external 3D models
- Physics: `BS.BanterRigidbody`, `BS.BoxCollider`, `BS.SphereCollider`
- `BS.Light` — scene lighting
- `BS.Vector3`, `BS.Vector4`, `BS.Quaternion`
