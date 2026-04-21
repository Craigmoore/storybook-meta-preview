import * as THREE from 'three';
import { path3d } from './utils.js';

// Convert any Three.js BufferGeometry into draw.path commands via EdgesGeometry.
// Each unique edge becomes one draw.path with its two endpoints.
// Pass an optional Matrix4 to rotate, scale, or translate before converting.
// batchSize > 1 joins that many draw.path commands with & per entry (for large geometries).
export function edgesFromGeometry(geometry, matrix, batchSize = 1) {
  const edges = new THREE.EdgesGeometry(geometry);
  if (matrix) edges.applyMatrix4(matrix);
  const pos = edges.attributes.position;
  const cmds = [];
  for (let i = 0; i < pos.count; i += 2) {
    cmds.push(...path3d([
      [pos.getX(i),   pos.getY(i),   pos.getZ(i)],
      [pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1)],
    ]));
  }
  if (batchSize <= 1) return cmds;
  const batched = [];
  for (let i = 0; i < cmds.length; i += batchSize) {
    batched.push(cmds.slice(i, i + batchSize).join('&'));
  }
  return batched;
}
