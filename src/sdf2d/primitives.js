export const PRIMITIVES = /* glsl */`

// ── constants ──────────────────────────────────────────────────────────────────
const float PI  = 3.14159265359;
const float TAU = 6.28318530718;
const vec3  BG          = vec3(0.10, 0.10, 0.14);
const vec3  SHAPE_COLOR = vec3(0.25, 0.55, 0.90);
const vec3  STROKE_COLOR = vec3(1.00, 1.00, 1.00);

// ── primitives ─────────────────────────────────────────────────────────────────

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  return sdSegment(p, a, b) - r;
}

float sdEquilateralTriangle(vec2 p, float r) {
  const float k = 1.73205080757;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

float sdPentagon(vec2 p, float r) {
  const vec3 k = vec3(0.809016994, 0.587785252, 0.726542528);
  p.x = abs(p.x);
  p -= 2.0 * min(dot(vec2(-k.x, k.y), p), 0.0) * vec2(-k.x, k.y);
  p -= 2.0 * min(dot(vec2( k.x, k.y), p), 0.0) * vec2( k.x, k.y);
  p -= vec2(clamp(p.x, -r * k.z, r * k.z), r);
  return length(p) * sign(p.y);
}

float sdHexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

float sdOctagon(vec2 p, float r) {
  const vec3 k = vec3(-0.9238795325, 0.3826834323, 0.4142135623);
  p = abs(p);
  p -= 2.0 * min(dot(vec2( k.x, k.y), p), 0.0) * vec2( k.x, k.y);
  p -= 2.0 * min(dot(vec2(-k.x, k.y), p), 0.0) * vec2(-k.x, k.y);
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

float sdStar5(vec2 p, float r, float rf) {
  const vec2 k1 = vec2( 0.809016994375, -0.587785252192);
  const vec2 k2 = vec2(-0.809016994375, -0.587785252192);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

// angleRad: full span of the arc (arc is symmetric about +y, gap at bottom)
float sdArc(vec2 p, float angleRad, float ra, float rb) {
  vec2 sc = vec2(sin(angleRad * 0.5), cos(angleRad * 0.5));
  p.x = abs(p.x);
  float k = (sc.y * p.x > sc.x * p.y) ? dot(p, sc) : length(p);
  return sqrt(max(dot(p, p) + ra * ra - 2.0 * ra * k, 0.0)) - rb;
}

// angleRad: full opening angle of the pie, pie points toward +y
float sdPie(vec2 p, float angleRad, float r) {
  vec2 sc = vec2(sin(angleRad * 0.5), cos(angleRad * 0.5));
  p.x = abs(p.x);
  float l = length(p) - r;
  float m = length(p - sc * clamp(dot(p, sc), 0.0, r));
  return max(l, m * sign(sc.y * p.x - sc.x * p.y));
}

float sdRing(vec2 p, float ra, float rb) {
  return abs(length(p) - ra) - rb;
}

float sdCross(vec2 p, vec2 b, float r) {
  p = abs(p);
  p = (p.y > p.x) ? p.yx : p.xy;
  vec2 q = p - b;
  float k = max(q.y, q.x);
  vec2 w = (k > 0.0) ? q : vec2(b.y - p.x, -k);
  return sign(k) * length(max(w, 0.0)) - r;
}

float sdHeart(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0)
    return sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(
    dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)),
    dot(p - 0.5 * max(p.x + p.y, 0.0), p - 0.5 * max(p.x + p.y, 0.0))
  )) * sign(p.x - p.y);
}

float sdMoon(vec2 p, float d, float ra, float rb) {
  p.y = abs(p.y);
  float a = (ra * ra - rb * rb + d * d) / (2.0 * d);
  float b = sqrt(max(ra * ra - a * a, 0.0));
  if (d * (p.x * b - p.y * a) > d * d * max(b - p.y, 0.0))
    return length(p) - ra;
  return max(length(p) - ra, -(length(p - vec2(d, 0.0)) - rb));
}

float sdVesica(vec2 p, float r, float d) {
  p = abs(p);
  float b = sqrt(max(r * r - d * d, 0.0));
  return ((p.y - b) * d > p.x * b)
    ? length(p - vec2(0.0, b)) * sign(d)
    : length(p - vec2(-d, 0.0)) - r;
}

float sdEgg(vec2 p, float ra, float rb) {
  const float k = 1.73205080757;
  p.x = abs(p.x);
  float r = ra - rb;
  return ((p.y < 0.0)          ? length(vec2(p.x, p.y)) - r :
          (k * (p.x + r) < p.y) ? length(vec2(p.x, p.y - k * r)) :
                                   length(vec2(p.x + r, p.y)) - 2.0 * r) - rb;
}

// ── boolean operations ─────────────────────────────────────────────────────────

float opUnion     (float a, float b) { return min(a, b); }
float opIntersect (float a, float b) { return max(a, b); }
float opSubtract  (float a, float b) { return max(a, -b); }

float opSmoothUnion(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float opSmoothIntersect(float a, float b, float k) {
  float h = clamp(0.5 - 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) + k * h * (1.0 - h);
}
float opSmoothSubtract(float a, float b, float k) {
  float h = clamp(0.5 - 0.5 * (a + b) / k, 0.0, 1.0);
  return mix(a, -b, h) + k * h * (1.0 - h);
}

// ── domain operations ──────────────────────────────────────────────────────────

vec2 opRotate(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
}
vec2 opMirrorX(vec2 p)         { return vec2(abs(p.x), p.y); }
vec2 opMirrorY(vec2 p)         { return vec2(p.x, abs(p.y)); }
vec2 opMirror (vec2 p)         { return abs(p); }
vec2 opRepeat (vec2 p, vec2 s) { return mod(p + 0.5 * s, s) - 0.5 * s; }
vec2 opRepeatPolar(vec2 p, float n) {
  float a    = atan(p.y, p.x);
  float r    = length(p);
  float step = TAU / n;
  a = mod(a + 0.5 * step, step) - 0.5 * step;
  return vec2(cos(a), sin(a)) * r;
}

// ── colorization ───────────────────────────────────────────────────────────────

// IQ-style distance field visualization (contour rings, blue inside / orange outside)
vec3 colField(float d) {
  vec3 col = (d > 0.0) ? vec3(0.9, 0.6, 0.3) : vec3(0.65, 0.85, 1.0);
  col *= 1.0 - exp(-6.0 * abs(d));
  col *= 0.8 + 0.2 * cos(150.0 * d);
  col  = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(d)));
  return col;
}

// Antialiased fill
vec3 colFill(float d, vec3 fill, vec3 bg) {
  float aa = fwidth(d) * 0.5;
  return mix(bg, fill, 1.0 - smoothstep(-aa, aa, d));
}

// Fill with outline stroke
vec3 colOutline(float d, float thickness, vec3 fill, vec3 stroke, vec3 bg) {
  float aa    = fwidth(d) * 0.5;
  float inner = 1.0 - smoothstep(-aa, aa, d);
  float ring  = 1.0 - smoothstep(-aa, aa, abs(d) - thickness);
  vec3  col   = mix(bg, fill, inner);
  return mix(col, stroke, ring * (1.0 - smoothstep(0.0, aa, -d)));
}

// Gradient from edge colour to centre colour inside shape
vec3 colGradient(float d, vec3 edge, vec3 centre, vec3 bg) {
  float aa    = fwidth(d) * 0.5;
  float alpha = 1.0 - smoothstep(-aa, aa, d);
  float t     = smoothstep(0.0, 0.35, -d);
  return mix(bg, mix(edge, centre, t), alpha);
}
`;
