// Lightweight mock of the BanterVR BS namespace for browser preview.
// Implements enough of the 3D system to:
//   (a) render an approximate Three.js scene in the Storybook preview
//   (b) serialise a scene graph that the Banter inject script reconstructs
//       using the real BS APIs

import * as THREE from 'three';

// ── Math types ────────────────────────────────────────────────────────────────

export class Vector2 { constructor(x = 0, y = 0)          { this.x = x; this.y = y; } }
export class Vector3 { constructor(x = 0, y = 0, z = 0)   { this.x = x; this.y = y; this.z = z; } }
export class Vector4 { constructor(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; } }
export class Quaternion { constructor(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; } }

// ── Enums ─────────────────────────────────────────────────────────────────────

export const LightType    = { Point: 'Point', Directional: 'Directional', Spot: 'Spot' };
export const MaterialSide = { Front: 'Front', Back: 'Back', Double: 'Double' };
export const PN           = { text: 'text', position: 'position', localPosition: 'localPosition',
                              localEulerAngles: 'localEulerAngles', localScale: 'localScale' };

// ── Component stubs ───────────────────────────────────────────────────────────
// Each component stores its type and config for serialisation.
// AddComponent on the GameObject reads _type/_config to decide what to build.

function makeComponent(type) {
  return class {
    constructor(config = {}) { this._type = type; this._config = config; }
  };
}

export const BanterBox       = makeComponent('BanterBox');
export const BanterSphere    = makeComponent('BanterSphere');
export const BanterPlane     = makeComponent('BanterPlane');
export const BanterCylinder  = makeComponent('BanterCylinder');
export const BanterCone      = makeComponent('BanterCone');
export const BanterCircle    = makeComponent('BanterCircle');
export const BanterTorus     = makeComponent('BanterTorus');
export const BanterTorusKnot = makeComponent('BanterTorusKnot');
export const BanterMaterial  = makeComponent('BanterMaterial');
export const BanterText      = makeComponent('BanterText');
export const BanterGLTF      = makeComponent('BanterGLTF');
export const Light           = makeComponent('Light');

// Physics and baking — no-op in preview, serialise for inject script
export const BanterRigidbody      = makeComponent('BanterRigidbody');
export const BoxCollider          = makeComponent('BoxCollider');
export const SphereCollider       = makeComponent('SphereCollider');
export const CapsuleCollider      = makeComponent('CapsuleCollider');
export const MeshCollider         = makeComponent('MeshCollider');
export const BanterColliderEvents = makeComponent('BanterColliderEvents');
export const BanterPhysicMaterial = makeComponent('BanterPhysicMaterial');
export const BanterAOBaking       = makeComponent('BanterAOBaking');
export const BanterSyncedObject   = makeComponent('BanterSyncedObject');

// ── Serialisation helper ──────────────────────────────────────────────────────

function serializeConfig(config) {
  const out = {};
  for (const [k, v] of Object.entries(config ?? {})) {
    if (v instanceof Vector4)    out[k] = [v.x, v.y, v.z, v.w];
    else if (v instanceof Vector3) out[k] = [v.x, v.y, v.z];
    else if (v instanceof Vector2) out[k] = [v.x, v.y];
    else out[k] = v;
  }
  return out;
}

// ── Geometry types that produce a Three.js mesh ───────────────────────────────

const GEOMETRY_TYPES = new Set([
  'BanterBox', 'BanterSphere', 'BanterPlane', 'BanterCylinder',
  'BanterCone', 'BanterCircle', 'BanterTorus', 'BanterTorusKnot',
]);

function buildMesh(type, config) {
  let geo;
  switch (type) {
    case 'BanterBox':
      geo = new THREE.BoxGeometry(config.width ?? 1, config.height ?? 1, config.depth ?? 1);
      break;
    case 'BanterSphere':
      geo = new THREE.SphereGeometry(config.radius ?? 0.5, 32, 16);
      break;
    case 'BanterPlane':
      geo = new THREE.PlaneGeometry(config.width ?? 1, config.height ?? 1);
      break;
    case 'BanterCylinder':
      geo = new THREE.CylinderGeometry(
        config.radiusTop ?? 0.5, config.radiusBottom ?? 0.5,
        config.height ?? 1, config.radialSegments ?? 32,
      );
      break;
    case 'BanterCone':
      geo = new THREE.ConeGeometry(config.radius ?? 0.5, config.height ?? 1, 32);
      break;
    case 'BanterCircle':
      geo = new THREE.CircleGeometry(config.radius ?? 0.5, 32);
      break;
    case 'BanterTorus':
      geo = new THREE.TorusGeometry(config.radius ?? 1, config.tube ?? 0.4, 16, 100);
      break;
    case 'BanterTorusKnot':
      geo = new THREE.TorusKnotGeometry(
        config.radius ?? 1, config.tube ?? 0.4, 100, 16,
        config.p ?? 2, config.q ?? 3,
      );
      break;
    default:
      return null;
  }

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0xffffff }),
  );

  // Unity/Banter planes lie flat (XZ), Three.js PlaneGeometry faces +Z — rotate to match
  if (type === 'BanterPlane') mesh.rotation.x = -Math.PI / 2;

  return mesh;
}

// ── MockGameObject ────────────────────────────────────────────────────────────

export class GameObject {
  constructor({ name = 'GameObject', localPosition, localEulerAngles, localScale, parent } = {}) {
    this.name        = name;
    this._group      = new THREE.Group();
    this._group.name = name;
    this._components = [];
    this._children   = [];

    if (localPosition)    this._group.position.set(localPosition.x, localPosition.y, localPosition.z);
    if (localEulerAngles) {
      // Unity uses YXZ Euler order. Match it so the preview behaves identically
      // to Banter: Y (yaw) is applied first, then X (pitch), then Z (roll).
      // With XYZ order (Three.js default), the Y rotation has no effect on the
      // local +Y axis, so azimuth-spread branching appears flat/invisible.
      this._group.rotation.order = 'YXZ';
      this._group.rotation.set(
        THREE.MathUtils.degToRad(localEulerAngles.x),
        THREE.MathUtils.degToRad(localEulerAngles.y),
        THREE.MathUtils.degToRad(localEulerAngles.z),
      );
    }
    if (localScale) this._group.scale.set(localScale.x, localScale.y, localScale.z);

    if (parent instanceof GameObject) {
      parent._group.add(this._group);
      parent._children.push(this);
    }
  }

  AddComponent(component) {
    if (!component) return component;
    const { _type: type, _config: config } = component;

    if (GEOMETRY_TYPES.has(type)) {
      const mesh = buildMesh(type, config);
      if (mesh) this._group.add(mesh);
    }

    else if (type === 'BanterMaterial') {
      const c = config.color;
      const col = c instanceof Vector4
        ? new THREE.Color(c.x, c.y, c.z)
        : new THREE.Color(0xffffff);
      const alpha   = c instanceof Vector4 ? c.w : 1;
      const doSide  = config.side === 'Double' ? THREE.DoubleSide : THREE.FrontSide;
      const mat = new THREE.MeshStandardMaterial({
        color:       col,
        transparent: alpha < 1,
        opacity:     alpha,
        side:        doSide,
      });
      this._group.traverse(child => {
        if (child.isMesh) child.material = mat;
      });
    }

    else if (type === 'Light') {
      const c   = config.color;
      const col = c instanceof Vector4 ? new THREE.Color(c.x, c.y, c.z) : new THREE.Color(0xffffff);
      const intensity = config.intensity ?? 1;
      let light;
      switch (config.type) {
        case 'Directional':
          light = new THREE.DirectionalLight(col, intensity);
          break;
        case 'Spot':
          light = new THREE.SpotLight(
            col, intensity, config.range ?? 10,
            config.spotAngle ? THREE.MathUtils.degToRad(config.spotAngle) : Math.PI / 4,
          );
          break;
        default: // Point
          light = new THREE.PointLight(col, intensity, config.range ?? 10);
      }
      this._group.add(light);
    }

    // Physics, baking, sync — no-op in preview, serialise only
    this._components.push({ type, config: serializeConfig(config) });
    return component;
  }

  toJSON() {
    return {
      name:             this.name,
      localPosition:    { x: this._group.position.x,    y: this._group.position.y,    z: this._group.position.z },
      localEulerAngles: {
        x: THREE.MathUtils.radToDeg(this._group.rotation.x),
        y: THREE.MathUtils.radToDeg(this._group.rotation.y),
        z: THREE.MathUtils.radToDeg(this._group.rotation.z),
      },
      localScale:       { x: this._group.scale.x, y: this._group.scale.y, z: this._group.scale.z },
      components:       this._components,
      children:         this._children.map(c => c.toJSON()),
    };
  }
}

// ── MockBS3D namespace ────────────────────────────────────────────────────────

export const MockBS3D = {
  Vector2, Vector3, Vector4, Quaternion,
  LightType, MaterialSide, PN,
  GameObject,
  BanterBox, BanterSphere, BanterPlane, BanterCylinder, BanterCone,
  BanterCircle, BanterTorus, BanterTorusKnot,
  BanterMaterial, BanterText, BanterGLTF, Light,
  BanterRigidbody, BoxCollider, SphereCollider, CapsuleCollider,
  MeshCollider, BanterColliderEvents, BanterPhysicMaterial,
  BanterAOBaking, BanterSyncedObject,
};
