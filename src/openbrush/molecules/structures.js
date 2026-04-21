import * as THREE from 'three';
import { setColor, path3d } from '../utils.js';
import { edgesFromGeometry } from '../geometry.js';

const WALL    = setColor(0.45, 0.45, 0.45);
const ROOF    = setColor(0.914, 0.271, 0.376);
const BROWN   = setColor(0.3, 0.15, 0.05);
const GREEN   = setColor(0.05, 0.22, 0.06);
const GREY    = setColor(0.12, 0.12, 0.12);
const TERRAIN = setColor(0.0, 0.85, 0.0);
const ROAD    = setColor(0.35, 0.3, 0.28);

function mat(x, y, z) {
  return new THREE.Matrix4().makeTranslation(x, y, z);
}

// --- Perlin noise (fBm) ---

const _p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
const _perm = [];
for (let i = 0; i < 256; i++) _perm[i] = _perm[i + 256] = _p[i];

function _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function _lerp(a, b, t) { return a + t * (b - a); }
function _grad(h, x, y) {
  return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
}
function perlin(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = _fade(x), v = _fade(y);
  const a = _perm[X] + Y, b = _perm[X + 1] + Y;
  return _lerp(
    _lerp(_grad(_perm[a],     x,     y),   _grad(_perm[b],     x - 1, y),     u),
    _lerp(_grad(_perm[a + 1], x,     y - 1), _grad(_perm[b + 1], x - 1, y - 1), u),
    v
  );
}
function fbm(x, y, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += perlin(x * freq, y * freq) * amp;
    amp *= 0.5; freq *= 2;
  }
  return val;
}

// --- Terrain ---

export function terrainHeight(x, z, heightScale = 0.6) {
  return fbm(x * 0.6 + 3.7, z * 0.6 + 1.3) * heightScale;
}

export function makeTerrain(size = 6, segments = 19, heightScale = 0.6) {
  const geom = new THREE.PlaneGeometry(size, size, segments, segments);
  geom.rotateX(-Math.PI / 2);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, fbm(pos.getX(i) * 0.6 + 3.7, pos.getZ(i) * 0.6 + 1.3) * heightScale);
  }
  pos.needsUpdate = true;
  return [TERRAIN, ...edgesFromGeometry(geom, null, 100)];
}

// --- Road network ---

function makeRng(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

// Returns array of branches; each branch is an array of { x, z, a, width } waypoints.
function buildRoadBranches(cx, cz, seed, depth = 5) {
  const rng = makeRng(seed);
  const rr = (min, max) => min + rng() * (max - min);
  const BOUNDS = 2.8;
  const branches = [];

  function branch(x, z, angle, length, d, width) {
    if (d === 0 || length < 0.15) return;
    const STEPS = 10, stepLen = length / STEPS;
    let a = angle, px = x, pz = z;
    const wps = [{ x: px, z: pz, a, width }];
    for (let i = 1; i <= STEPS; i++) {
      a  += rr(-0.25, 0.25);
      px  = Math.max(-BOUNDS, Math.min(BOUNDS, px + Math.cos(a) * stepLen));
      pz  = Math.max(-BOUNDS, Math.min(BOUNDS, pz + Math.sin(a) * stepLen));
      wps.push({ x: px, z: pz, a, width });
    }
    branches.push(wps);
    const split = rr(0.35, 0.75), child = length * rr(0.55, 0.75), cw = width * 0.75;
    branch(px, pz, a + split, child, d - 1, cw);
    branch(px, pz, a - split, child, d - 1, cw);
    if (d > 3 && rng() < 0.35)
      branch(px, pz, a + rr(-0.1, 0.1), child * 0.8, d - 2, cw * 0.8);
  }

  branch(cx, cz, rr(0, Math.PI * 2), 1.6, depth, 0.28);
  return branches;
}

function renderRoadBranches(branches) {
  const cmds = [ROAD];
  for (const wps of branches) {
    const left = [], right = [];
    for (const { x, z, a, width } of wps) {
      const y = terrainHeight(x, z) + 0.025;
      const ox = -Math.sin(a) * width / 2, oz = Math.cos(a) * width / 2;
      left.push( [x - ox, y, z - oz]);
      right.push([x + ox, y, z + oz]);
    }
    cmds.push(...path3d(left), ...path3d(right));
  }
  return cmds;
}

export function makeRoadNetwork(cx = 0, cz = 0, seed = 1, depth = 5) {
  return renderRoadBranches(buildRoadBranches(cx, cz, seed, depth));
}

// --- Placement primitives ---

export function makeRock(x = 0, y = 0, z = 0, size = 0.4) {
  const matrix = new THREE.Matrix4()
    .makeTranslation(x, y + size * 0.55, z)
    .multiply(new THREE.Matrix4().makeScale(size, size * 0.55, size * 0.8));
  return [GREY, ...edgesFromGeometry(new THREE.IcosahedronGeometry(1, 0), matrix)];
}

export function makeTree(x = 0, y = 0, z = 0) {
  return [
    BROWN, ...edgesFromGeometry(new THREE.CylinderGeometry(0.09, 0.12, 0.5, 6), mat(x, y + 0.25, z)),
    GREEN, ...edgesFromGeometry(new THREE.ConeGeometry(0.5, 0.9, 7),             mat(x, y + 0.95, z)),
  ];
}

const TREE_HEIGHT  = 1.4;
const HOUSE_SCALE  = 0.38; // houses are 38% the height of a tree
const HOUSE_SIZE   = TREE_HEIGHT * HOUSE_SCALE; // ~0.53

function makeHouseAt(x, y, z) {
  const s = HOUSE_SIZE, r = s / Math.sqrt(3);
  const roofMatrix = new THREE.Matrix4()
    .makeTranslation(x, y + s + r / 2, z)
    .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  return [
    WALL, ...edgesFromGeometry(new THREE.BoxGeometry(s, s, s), mat(x, y + s / 2, z)),
    ROOF, ...edgesFromGeometry(new THREE.CylinderGeometry(r, r, s, 3), roofMatrix),
  ];
}

// --- Proximity helpers ---

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, len2 = dx*dx + dz*dz;
  if (len2 === 0) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax)*dx + (pz - az)*dz) / len2));
  return Math.hypot(px - ax - t*dx, pz - az - t*dz);
}

function nearRoad(segs, px, pz, minDist) {
  return segs.some(([ax, az, bx, bz]) => distToSegment(px, pz, ax, az, bx, bz) < minDist);
}

function tooClose(placed, px, pz, minDist) {
  return placed.some(p => Math.hypot(p.x - px, p.z - pz) < minDist);
}

// --- Scene ---

export function makeScene(seed = 1) {
  const branches = buildRoadBranches(0, 0, seed, 5);

  const roadSegs = [];
  for (const wps of branches)
    for (let i = 0; i < wps.length - 1; i++)
      roadSegs.push([wps[i].x, wps[i].z, wps[i+1].x, wps[i+1].z]);

  const placed = [];
  const cmds   = [];

  cmds.push(...makeTerrain());
  cmds.push(...renderRoadBranches(branches));

  // Houses on both sides of each road branch
  for (const wps of branches) {
    let distSince = 99;
    for (let i = 0; i < wps.length; i++) {
      const wp = wps[i];
      if (i > 0) distSince += Math.hypot(wp.x - wps[i-1].x, wp.z - wps[i-1].z);
      if (distSince < 1.6) continue;

      let placedHere = false;
      const offset = wp.width / 2 + HOUSE_SIZE / 2 + 0.2;
      for (const side of [-1, 1]) {
        const hx = wp.x + (-Math.sin(wp.a)) * offset * side;
        const hz = wp.z + ( Math.cos(wp.a)) * offset * side;
        if (Math.abs(hx) > 2.5 || Math.abs(hz) > 2.5) continue;
        if (nearRoad(roadSegs, hx, hz, HOUSE_SIZE / 2 + 0.15)) continue;
        if (tooClose(placed, hx, hz, HOUSE_SIZE + 0.25)) continue;
        cmds.push(...makeHouseAt(hx, terrainHeight(hx, hz), hz));
        placed.push({ x: hx, z: hz, radius: HOUSE_SIZE / 2 });
        placedHere = true;
      }
      if (placedHere) distSince = 0;
    }
  }

  // Trees — seeded grid with jitter
  const treeRng = makeRng(seed + 100);
  const GRID = 0.9;
  for (let xi = -2.5; xi <= 2.5; xi += GRID) {
    for (let zi = -2.5; zi <= 2.5; zi += GRID) {
      if (treeRng() > 0.55) continue;
      const tx = xi + (treeRng() - 0.5) * GRID * 0.8;
      const tz = zi + (treeRng() - 0.5) * GRID * 0.8;
      if (nearRoad(roadSegs, tx, tz, 0.45)) continue;
      if (tooClose(placed, tx, tz, 1.1)) continue;
      cmds.push(...makeTree(tx, terrainHeight(tx, tz), tz));
      placed.push({ x: tx, z: tz, radius: 0.5 });
    }
  }

  // Rocks — sparse random scatter
  const rockRng = makeRng(seed + 200);
  for (let i = 0; i < 20; i++) {
    const rx = (rockRng() - 0.5) * 5.0;
    const rz = (rockRng() - 0.5) * 5.0;
    const rs = 0.18 + rockRng() * 0.25;
    if (nearRoad(roadSegs, rx, rz, 0.4)) continue;
    if (tooClose(placed, rx, rz, rs + 0.6)) continue;
    cmds.push(...makeRock(rx, terrainHeight(rx, rz), rz, rs));
    placed.push({ x: rx, z: rz, radius: rs * 0.8 });
  }

  return cmds;
}
