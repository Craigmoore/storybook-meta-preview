export const MOLECULES = /* glsl */`

// Named molecule SDFs — each encodes a compound shape defined at the molecule
// tier. Injected after PRIMITIVES so all sdXxx / opXxx helpers are in scope.

// ── Lens ─────────────────────────────────────────────────────────────────────
// Two equal circles of radius r with centres ±s apart on X, intersected.
float molLens(vec2 p, float r, float s) {
  return opIntersect(sdCircle(p + vec2(s, 0.0), r), sdCircle(p - vec2(s, 0.0), r));
}

// ── Crescent ──────────────────────────────────────────────────────────────────
// Outer circle (ro) with an inner circle (ri) subtracted, inner offset by o.
// opMirrorX is applied first so the crescent always opens rightward.
float molCrescent(vec2 p, float ro, float ri, float o) {
  vec2 mp = opMirrorX(p) - vec2(o, 0.0);
  return opSubtract(sdCircle(mp, ro), sdCircle(mp - vec2(o, 0.0), ri));
}

// ── Smooth Scoop ──────────────────────────────────────────────────────────────
// Rounded rectangle with a soft circular bite removed from the top.
// Box dimensions and corner radius are baked in; so and sr control the scoop.
float molSmoothScoop(vec2 p, float so, float sr, float k) {
  float shape = sdRoundedBox(p, vec2(0.38, 0.28), 0.06);
  float scoop = sdCircle(p - vec2(0.0, so), sr);
  return opSmoothSubtract(shape, scoop, k);
}

// ── Smooth Intersect ──────────────────────────────────────────────────────────
// Square box smooth-intersected with a circle — produces pillowed square corners.
float molSmoothIntersect(vec2 p, float bs, float cr, float k) {
  return opSmoothIntersect(sdBox(p, vec2(bs, bs)), sdCircle(p, cr), k);
}

// ── Wireframe Triangle ────────────────────────────────────────────────────────
// Three sdCapsule edges of an equilateral triangle, circumradius r, stroke t.
float molWireframeTriangle(vec2 p, float r, float t) {
  const float s60 = 0.866025;
  vec2 va = vec2(0.0,       r);
  vec2 vb = vec2(-r * s60, -r * 0.5);
  vec2 vc = vec2( r * s60, -r * 0.5);
  return opUnion(opUnion(sdCapsule(p, va, vb, t), sdCapsule(p, vb, vc, t)), sdCapsule(p, vc, va, t));
}

// ── Ring Lattice ──────────────────────────────────────────────────────────────
// Tiled grid of rings (radius rr, tube rt) with a circular centre hole (sr).
float molRingLattice(vec2 p, float rr, float rt, float sr, float sp) {
  vec2 tp = opRepeat(p, vec2(sp));
  return opSubtract(sdRing(tp, rr, rt), sdCircle(tp, sr));
}

// ── Smooth Blob ───────────────────────────────────────────────────────────────
// Four circles at ±sp diagonals, smooth-unioned with softness k.
float molSmoothBlob(vec2 p, float sp, float r, float k) {
  float a = sdCircle(p - vec2( sp,  sp), r);
  float b = sdCircle(p - vec2(-sp,  sp), r);
  float c = sdCircle(p - vec2( sp, -sp), r);
  float d = sdCircle(p - vec2(-sp, -sp), r);
  return opSmoothUnion(opSmoothUnion(a, b, k), opSmoothUnion(c, d, k), k);
}

// ── Dumbbell ──────────────────────────────────────────────────────────────────
// Horizontal bar capsule (half-length bl, tube br) with head circles (hr).
float molDumbbell(vec2 p, float bl, float br, float hr) {
  return opUnion(sdCapsule(p, vec2(-bl, 0.0), vec2(bl, 0.0), br),
         opUnion(sdCircle(p - vec2(-bl, 0.0), hr), sdCircle(p - vec2(bl, 0.0), hr)));
}

// ── Wings ─────────────────────────────────────────────────────────────────────
// Mirrored swept-capsule wings + tip lobes + centre body capsule.
// sp: wing-root X offset; ang: sweep (radians); lr: lobe radius.
float molWings(vec2 p, float sp, float ang, float lr) {
  vec2  mp   = opMirrorX(p);
  vec2  rp   = opRotate(mp - vec2(sp, 0.0), -ang);
  float wing = sdCapsule(rp, vec2(0.0, 0.0), vec2(0.36, 0.0), 0.07);
  float tip  = sdCircle(mp - vec2(sp + 0.36, 0.0), lr);
  float body = sdCapsule(p, vec2(0.0, 0.22), vec2(0.0, -0.18), 0.045);
  return opUnion(opUnion(wing, tip), body);
}

// ── Tile ─────────────────────────────────────────────────────────────────────
// Tiled ring+cross motif: cell size sp, ring radius rr, cross half-extents
// (cs × cw), whole pattern pre-rotated by rot radians.
float molTile(vec2 p, float sp, float rr, float cs, float cw, float rot) {
  vec2 tp = opRepeat(opRotate(p, rot), vec2(sp));
  return opUnion(sdRing(tp, rr, 0.018), sdCross(tp, vec2(cs, cw), 0.01));
}

// ── Kaleidoscope ──────────────────────────────────────────────────────────────
// Two polar-repeated capsule groups (mirrored + plain), smooth-unioned,
// centre hole punched. n: folds; co: offset; cl: half-length; cr: tube; k: soft.
float molKaleidoscope(vec2 p, float n, float co, float cl, float cr, float k) {
  vec2  rp1 = opRepeatPolar(opMirror(p), n);
  float d1  = sdCapsule(rp1 - vec2(co, 0.0), vec2(-cl, 0.0), vec2(cl, 0.0), cr);
  vec2  rp2 = opRepeatPolar(p, n);
  float d2  = sdCapsule(rp2 - vec2(co * 0.6, 0.0), vec2(0.0, -cl), vec2(0.0, cl), cr * 0.7);
  return opSubtract(opSmoothUnion(d1, d2, k), sdCircle(p, 0.05));
}
`;
