import * as THREE from 'three';
import { marchingCubes } from './marchingcubes.js';

// Builds a THREE.BufferGeometry from a scalar field function via marching cubes.
// mapFn: (Vector3) => number — negative inside the surface, positive outside
// dims:  [nx, ny, nz]
// bounds: [[-bx,-by,-bz], [bx,by,bz]]
export function buildIsosurface(dims, mapFn, bounds) {
  const p = new THREE.Vector3();
  const result = marchingCubes(dims, (x, y, z) => mapFn(p.set(x, y, z)), bounds);

  const geometry = new THREE.BufferGeometry();

  const verts = new Float32Array(result.positions.length * 3);
  for (let i = 0; i < result.positions.length; i++) {
    const v = result.positions[i];
    verts[i * 3]     = v[0];
    verts[i * 3 + 1] = v[1];
    verts[i * 3 + 2] = v[2];
  }

  const indices = [];
  for (const f of result.cells) {
    if (f.length === 3) indices.push(f[0], f[1], f[2]);
    else if (f.length === 4) indices.push(f[0], f[1], f[2], f[0], f[2], f[3]);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geometry.setIndex(indices);

  // Central-difference gradient normals — more accurate than face-averaged normals for SDFs
  const eps = 0.002;
  const normals = new Float32Array(verts.length);
  const q = new THREE.Vector3();
  for (let i = 0; i < verts.length; i += 3) {
    const x = verts[i], y = verts[i + 1], z = verts[i + 2];
    const nx = mapFn(q.set(x + eps, y, z)) - mapFn(q.set(x - eps, y, z));
    const ny = mapFn(q.set(x, y + eps, z)) - mapFn(q.set(x, y - eps, z));
    const nz = mapFn(q.set(x, y, z + eps)) - mapFn(q.set(x, y, z - eps));
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    normals[i]     = nx / len;
    normals[i + 1] = ny / len;
    normals[i + 2] = nz / len;
  }
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  return geometry;
}
