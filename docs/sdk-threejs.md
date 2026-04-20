# Three.js API Reference

## Overview

Three.js is a JavaScript 3D library built on top of WebGL. This reference covers the APIs needed to build Three.js stories for both the `threejs-2d` and `threejs-3d` setups in this project.

---

## Core Setup

```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

---

## Cameras

### PerspectiveCamera
Standard camera with perspective projection (objects farther away appear smaller).

```javascript
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// fov: field of view in degrees (typically 45-90)
// aspect: width / height
// near: near clipping plane (e.g. 0.1)
// far: far clipping plane (e.g. 1000)

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
```

### OrthographicCamera
Parallel projection — no perspective distortion. Used for 2D layouts and technical views.

```javascript
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);

// Full-screen orthographic:
const camera = new THREE.OrthographicCamera(
  width / -2, width / 2,
  height / 2, height / -2,
  0.1, 1000
);
```

---

## Renderer

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);
```

---

## Scene

```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0xcccccc, 10, 50);

scene.add(object);
scene.remove(object);
scene.getObjectByName('myObject');
scene.traverse((obj) => { /* visit every node */ });

const json = scene.toJSON(); // serialize
```

---

## Objects

### Object3D (base class)

```javascript
object.position.set(x, y, z);
object.rotation.set(x, y, z);       // Euler angles in radians
object.scale.set(x, y, z);
object.visible = true;
object.castShadow = true;
object.receiveShadow = true;
object.userData = {};                // custom metadata

object.add(child);
object.remove(child);
object.lookAt(x, y, z);
object.clone();
object.toJSON();
```

### Mesh

```javascript
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 1, 0);
mesh.castShadow = true;
scene.add(mesh);
```

### Group

```javascript
const group = new THREE.Group();
group.add(mesh1, mesh2, mesh3);
group.position.set(0, 0, 0);
group.rotation.y += 0.01;
scene.add(group);
```

---

## Geometries

```javascript
new THREE.BoxGeometry(width, height, depth)
new THREE.SphereGeometry(radius, widthSegments, heightSegments)
new THREE.PlaneGeometry(width, height)
new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)
new THREE.CircleGeometry(radius, segments)
new THREE.ConeGeometry(radius, height, radialSegments)
```

---

## Materials

### MeshBasicMaterial
Unlit, flat colour. No lighting needed.
```javascript
new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false })
```

### MeshPhongMaterial
Shiny with specular highlights.
```javascript
new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100, specular: 0x444444 })
```

### MeshStandardMaterial
Physically-based rendering (PBR). Best for realistic materials.
```javascript
new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.5, roughness: 0.5 })
```

### Common Material Properties
```javascript
material.color          // Color object
material.transparent = true
material.opacity = 0.5
material.side = THREE.DoubleSide  // FrontSide | BackSide | DoubleSide
material.wireframe = false
material.visible = true
material.dispose()      // free GPU memory when done
```

---

## Lights

```javascript
// Uniform illumination, no shadows
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Directional (sun-like), supports shadows
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// Point (bulb-like)
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);
```

---

## Math Utilities

### Vector3
```javascript
const v = new THREE.Vector3(1, 2, 3);
v.set(x, y, z);
v.add(other);
v.sub(other);
v.multiplyScalar(s);
v.normalize();
v.length();
v.distanceTo(other);
v.lerp(other, t);      // interpolate, t: 0-1
v.dot(other);
v.cross(other);
v.clone();
v.applyQuaternion(q);
```

### Color
```javascript
const c = new THREE.Color(0xff0000);
c.set(0x00ff00);
c.setRGB(r, g, b);     // 0-1 range
c.setHSL(h, s, l);
c.lerp(other, t);
c.clone();
```

### Quaternion
```javascript
const q = new THREE.Quaternion();
q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
q.setFromEuler(euler);
q.slerp(target, t);    // smooth rotation interpolation
```

---

## OrbitControls

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.autoRotateSpeed = 2;
controls.minDistance = 2;
controls.maxDistance = 20;

// Must call in animation loop when enableDamping = true
controls.update();
```

---

## Serialization (used by threejs-2d and threejs-3d meta-previews)

Stories expose their scene via `window.__metaPreviewScene`. The storybook-channel serializes it and the meta-preview reconstructs it.

```javascript
// In story — expose scene after building it
window.__metaPreviewScene = scene;

// Serialization (in storybook-channel)
const json = scene.toJSON();

// Deserialization (in meta-preview)
import { ObjectLoader } from 'three';
const loader = new ObjectLoader();
const restoredScene = loader.parse(json);
```

`toJSON()` captures: full object hierarchy, geometries (with vertex data), materials, lights, cameras, and `userData`.

---

## Typical Story Pattern

```javascript
export default { title: 'ThreeJS-3D/Atoms/Box' };

export const Default = {
  render: () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xe94560 })
    );
    scene.add(mesh);

    window.__metaPreviewScene = scene;

    const canvas = document.createElement('canvas');
    // render to canvas and return it...
    return canvas;
  }
};
```
