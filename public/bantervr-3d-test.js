// BanterVR 3D demo — load via <script src="..."> in index.html or paste into
// the browser console. Demonstrates all known-good patterns for BanterVR 3D objects.
//
// Usage:
//   <script src="https://[host]:33390/bantervr-3d-test.js"></script>
//
// Rules discovered through testing:
//
//  COMPONENTS
//  • AddComponent() is synchronous for 3D components — no await needed.
//  • Add geometry components BEFORE BanterMaterial.
//    BanterMaterial applies to whatever meshes already exist on the object.
//    Adding material first, then geometry, will produce an invisible object.
//  • Physics component order: geometry → collider → BanterRigidbody (last).
//    Adding Rigidbody before a collider works but may produce physics artefacts.
//
//  MATERIALS
//  • BanterMaterial color is Vector4 with components in the [0..1] normalised range.
//    new BS.Vector4(1, 0, 0, 1) = red. NOT [0..255].
//  • The alpha (w) component should always be 1 for solid objects.
//  • A second BanterMaterial AddComponent call replaces the first.
//
//  TRANSFORMS
//  • localPosition axes: x = left(−)/right(+), y = down(−)/up(+), z = away(−)/toward(+)
//  • All units are metres. localScale of (1,1,1) = 1m × 1m × 1m cube.
//  • localEulerAngles are in degrees, not radians.
//
//  HIERARCHY
//  • Set parent at creation time via the `parent` constructor option.
//    Calling obj.SetParent(parent) after creation also works.
//  • Children inherit the parent's world transform — set their localPosition
//    relative to the parent's origin, not to world origin.
//
//  PHYSICS
//  • Geometry alone does not provide collision. Add a collider component
//    (BoxCollider, SphereCollider, etc.) for physics interactions.
//  • BanterRigidbody with useGravity:true starts falling immediately on spawn.
//    Position the object above the floor so it visibly lands.
//  • The floor needs a collider too — BanterPlane + BoxCollider is the simplest floor.
//
//  LIGHTS
//  • Banter scenes have a default ambient light. Added lights are supplemental.
//  • BS.LightType.Point, .Directional, .Spot are the available types.
//  • Light color is Vector4 RGBA [0..1], same as BanterMaterial.

window.addEventListener('bs-loaded', () => {
  const scene = BS.BanterScene.GetInstance();

  scene.On('unity-loaded', () => {

    // ── Floor ─────────────────────────────────────────────────────────────────
    // BanterPlane provides the visual surface; BoxCollider provides collision.
    // Scale (10, 1, 10) gives a 10m × 10m ground plane.
    const floor = new BS.GameObject({
      name:          'Floor',
      localPosition: new BS.Vector3(0, 0, 3),
      localScale:    new BS.Vector3(10, 1, 10),
    });
    floor.AddComponent(new BS.BanterPlane());
    floor.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(0.22, 0.22, 0.22, 1) }));
    floor.AddComponent(new BS.BoxCollider());

    // ── Primitives row ────────────────────────────────────────────────────────
    // Three geometry types at eye height. Static — no rigidbody.

    // Red box
    const box = new BS.GameObject({
      name:          'RedBox',
      localPosition: new BS.Vector3(-2, 1.5, 3),
    });
    box.AddComponent(new BS.BanterBox({ width: 0.8, height: 0.8, depth: 0.8 }));
    box.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(0.9, 0.2, 0.2, 1) }));

    // Blue sphere
    const sphere = new BS.GameObject({
      name:          'BlueSphere',
      localPosition: new BS.Vector3(0, 1.5, 3),
    });
    sphere.AddComponent(new BS.BanterSphere({ radius: 0.4 }));
    sphere.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(0.2, 0.4, 0.9, 1) }));

    // Green cylinder
    const cylinder = new BS.GameObject({
      name:          'GreenCylinder',
      localPosition: new BS.Vector3(2, 1.5, 3),
    });
    cylinder.AddComponent(new BS.BanterCylinder({ radiusTop: 0.3, radiusBottom: 0.3, height: 0.8 }));
    cylinder.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(0.2, 0.8, 0.3, 1) }));

    // ── Parent / child hierarchy ──────────────────────────────────────────────
    // Central parent (yellow) with two child boxes on either side.
    // The children's localPosition is relative to the parent's origin.
    // Rotating the parent in-world will orbit both children with it.
    const group = new BS.GameObject({
      name:          'Group',
      localPosition: new BS.Vector3(-3.5, 1.5, 3),
    });
    group.AddComponent(new BS.BanterSphere({ radius: 0.18 }));
    group.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(1, 0.9, 0.2, 1) }));

    const childA = new BS.GameObject({
      name:          'ChildA',
      localPosition: new BS.Vector3(-0.6, 0, 0),
      parent:        group,
    });
    childA.AddComponent(new BS.BanterBox({ width: 0.3, height: 0.3, depth: 0.3 }));
    childA.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(1, 0.5, 0.1, 1) }));

    const childB = new BS.GameObject({
      name:          'ChildB',
      localPosition: new BS.Vector3(0.6, 0, 0),
      parent:        group,
    });
    childB.AddComponent(new BS.BanterBox({ width: 0.3, height: 0.3, depth: 0.3 }));
    childB.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(0.1, 0.9, 0.9, 1) }));

    // ── Physics demo ──────────────────────────────────────────────────────────
    // Purple box spawned above the floor. Falls and lands on the floor collider.
    // Component order: geometry → collider → BanterRigidbody.
    const physBox = new BS.GameObject({
      name:          'PhysicsBox',
      localPosition: new BS.Vector3(3.5, 4, 3),
    });
    physBox.AddComponent(new BS.BanterBox({ width: 0.6, height: 0.6, depth: 0.6 }));
    physBox.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(0.8, 0.3, 0.9, 1) }));
    physBox.AddComponent(new BS.BoxCollider());
    physBox.AddComponent(new BS.BanterRigidbody({ mass: 1, useGravity: true }));

    // ── Point light ───────────────────────────────────────────────────────────
    // A warm fill light above the scene. No geometry needed — light is a component
    // on a plain GameObject. range controls the falloff radius in metres.
    const lightObj = new BS.GameObject({
      name:          'SceneLight',
      localPosition: new BS.Vector3(0, 4, 3),
    });
    lightObj.AddComponent(new BS.Light({
      type:      BS.LightType.Point,
      color:     new BS.Vector4(1, 0.95, 0.85, 1),
      intensity: 2,
      range:     8,
    }));

    console.log('[3d-demo] done');
  });
});
