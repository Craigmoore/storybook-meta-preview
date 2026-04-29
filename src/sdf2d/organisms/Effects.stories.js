import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Organisms/Effects' };

const display     = { display: 'field' };
const displayType = { display: displayArgType };

// ── ImpastoArcs ───────────────────────────────────────────────────────────────
// Concentric arcs whose radius is sinusoidally modulated. The SDF is derived
// directly from the normalised distance to each arc's centreline:
//   dc = |fract((r − IR) / sp) − 0.5 + waveOffset|   (period-normalised)
//   d  = (dc − halfWidth) × sp                        (world-space SDF)
// Negative inside each arc stroke, positive in the gaps between them.
export const ImpastoArcs = {
  args: { rings: 10, waveFreq: 14, waveAmp: 0.018, ...display },
  argTypes: {
    rings:    { control: { type: 'range', min: 5,     max: 16,    step: 1 } },
    waveFreq: { control: { type: 'range', min: 4,     max: 24,    step: 1 } },
    waveAmp:  { control: { type: 'range', min: 0.003, max: 0.035, step: 0.001 } },
    ...displayType,
  },
  render: ({ rings, waveFreq, waveAmp, display }) => {
    const sp = (0.40 / rings).toFixed(6);
    const wa = waveAmp.toFixed(6);
    const wf = waveFreq.toFixed(1);
    return sdfStory(`
      vec3 render(vec2 p) {
        const float IR = 0.05;
        float sp    = ${sp};
        float r     = length(p);
        float theta = atan(p.y, p.x);
        float rn    = floor((r - IR) / sp);
        float t     = fract((r - IR) / sp);
        float nw    = (${wa} / sp) * sin(${wf} * theta + rn * 2.399963);
        float dc    = abs(t - 0.5 + nw);
        float d     = (dc - 0.40) * sp;
        d = max(d, IR - r);   // clip inside inner radius
        return ${col(display)};
      }
    `);
  },
};

// ── NeonPulse ─────────────────────────────────────────────────────────────────
// Three sets of concentric ring SDFs expanding outward at different speeds.
//   d_i = abs(mod(r − v_i · t, P_i) − P_i/2) − halfWidth_i
// The union (min) of all three is the final SDF. Different periods mean the
// rings from each system pass through one another, creating a moiré.
export const NeonPulse = {
  args: { speed: 0.6, density: 5, ...display },
  argTypes: {
    speed:   { control: { type: 'range', min: 0.0, max: 2.0, step: 0.1 } },
    density: { control: { type: 'range', min: 2,   max: 12,  step: 1 } },
    ...displayType,
  },
  render: ({ speed, density, display }) => {
    const sp = speed.toFixed(4);
    const dn = density.toFixed(1);
    return sdfStory(`
      vec3 render(vec2 p) {
        float r  = length(p);
        float dn = ${dn};

        float P1 = 1.0 / dn;
        float P2 = 1.0 / (dn * 0.73);
        float P3 = 1.0 / (dn * 0.47);

        float d1 = abs(mod(r - u_time * ${sp} * P1,        P1) - P1*0.5) - P1*0.055;
        float d2 = abs(mod(r + u_time * ${sp} * P2 * 0.6,  P2) - P2*0.5) - P2*0.055;
        float d3 = abs(mod(r - u_time * ${sp} * P3 * 0.35, P3) - P3*0.5) - P3*0.055;
        float d  = min(min(d1, d2), d3);

        return ${col(display)};
      }
    `, { animate: true });
  },
};

// ── ChainMail ─────────────────────────────────────────────────────────────────
// Two square-grid ring lattices offset by half a cell diagonally.
//   da = abs(length(pa) − ringRadius) − thickness   (Grid A)
//   db = abs(length(pb) − ringRadius) − thickness   (Grid B)
//   d  = min(da, db)
// Where pa/pb are positions relative to the nearest cell centre in each grid.
// Adjacent rings from the two grids overlap, creating an interlocking pattern.
export const ChainMail = {
  args: { spacing: 0.14, linkScale: 0.74, thickness: 0.010, ...display },
  argTypes: {
    spacing:   { control: { type: 'range', min: 0.06, max: 0.28,  step: 0.01 } },
    linkScale: { control: { type: 'range', min: 0.52, max: 0.92,  step: 0.02 } },
    thickness: { control: { type: 'range', min: 0.003, max: 0.025, step: 0.001 } },
    ...displayType,
  },
  render: ({ spacing, linkScale, thickness, display }) => {
    const sp = spacing.toFixed(5);
    const rr = (spacing * 0.5 * linkScale).toFixed(5);
    const th = thickness.toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        float sp = ${sp};

        vec2 pa = mod(p + vec2(sp * 0.5), vec2(sp)) - vec2(sp * 0.5);
        vec2 pb = mod(p,                   vec2(sp)) - vec2(sp * 0.5);
        float da = abs(length(pa) - ${rr}) - ${th};
        float db = abs(length(pb) - ${rr}) - ${th};
        float d  = min(da, db);

        return ${col(display)};
      }
    `);
  },
};

// ── TopographicContours ───────────────────────────────────────────────────────
// Six layered sine waves approximate a smooth terrain height field h(p).
// The SDF is the signed distance within each elevation band:
//   band = fract(h · numContours)     → 0..1 within each interval
//   d    = (band − 0.5) / (N · |∇h|) → 0 at band midpoint, ± at boundaries
// The contour lines lie where band = 0 or 1 (the d = ±0.5/(N·|∇h|) surfaces).
// |∇h| is computed via central differences and converts h-space to world-space.
export const TopographicContours = {
  args: { scale: 3.2, numContours: 10, ...display },
  argTypes: {
    scale:       { control: { type: 'range', min: 1.0, max: 7.0, step: 0.2 } },
    numContours: { control: { type: 'range', min: 4,   max: 24,  step: 1 } },
    ...displayType,
  },
  render: ({ scale, numContours, display }) => {
    const sc = scale.toFixed(4);
    const nc = numContours.toFixed(1);
    return sdfStory(`
      float topoH(vec2 p) {
        return sin(p.x * 2.3 + p.y * 1.7) * 0.34
             + sin(p.x * 3.8 - p.y * 2.9) * 0.22
             + sin(p.x * 1.2 + p.y * 3.4) * 0.18
             + sin(p.x * 5.1 + p.y * 1.5) * 0.10
             + sin(p.x * 4.3 - p.y * 4.8) * 0.08
             + sin(p.x * 6.7 + p.y * 2.3) * 0.04;
      }

      vec3 render(vec2 p) {
        float sc = ${sc};
        float nc = ${nc};

        vec2  q  = p * sc;
        float h  = topoH(q) * 0.5 + 0.5;

        // Central-difference gradient → world-space SDF denominator
        const float eps = 0.004;
        float hR = topoH(q + vec2(eps, 0.0));
        float hL = topoH(q - vec2(eps, 0.0));
        float hU = topoH(q + vec2(0.0, eps));
        float hD = topoH(q - vec2(0.0, eps));
        float gradMag = length(vec2(hR - hL, hU - hD)) * sc / (4.0 * eps);

        float band = fract(h * nc);
        float d    = (band - 0.5) / (nc * max(gradMag, 0.001));

        return ${col(display)};
      }
    `);
  },
};

// ── ZebraVortex ───────────────────────────────────────────────────────────────
// Spiral-warped stripe SDF. The stripe scalar field f(p) = r·ringFreq + swirl·angFreq
// where swirl = θ + K/(r + 0.12). The SDF of each stripe boundary is
//   d = sin(f · π) / (π · |∇f|)
// where ∇f is computed analytically via chain rule on (r, θ) coordinates.
// Positive in one set of stripes, negative in the alternating set.
export const ZebraVortex = {
  args: { twist: 1.2, ringFreq: 8, angFreq: 3, animSpeed: 0.25, ...display },
  argTypes: {
    twist:     { control: { type: 'range', min: -3.0, max: 3.0,  step: 0.1 } },
    ringFreq:  { control: { type: 'range', min: 3,    max: 18,   step: 1 } },
    angFreq:   { control: { type: 'range', min: 1,    max: 8,    step: 1 } },
    animSpeed: { control: { type: 'range', min: 0.0,  max: 1.5,  step: 0.05 } },
    ...displayType,
  },
  render: ({ twist, ringFreq, angFreq, animSpeed, display }) => {
    const tw  = twist.toFixed(4);
    const rf  = ringFreq.toFixed(1);
    const af  = angFreq.toFixed(1);
    const as_ = animSpeed.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        const float PI = 3.14159265;
        float r  = max(length(p), 0.001);
        float rf = ${rf};
        float af = ${af};
        float K  = ${tw} + u_time * ${as_};

        // Spiral-warped stripe field
        float swirl = atan(p.y, p.x) + K / (r + 0.12);
        float f     = r * rf + swirl * af;

        // Analytical gradient: ∂f/∂r = rf − K·af/(r+0.12)², ∂f/∂θ = af
        float g    = r + 0.12;
        float dfdr = rf - K * af / (g * g);
        vec2 gradf = dfdr * p / r + af * vec2(-p.y, p.x) / (r * r);
        float gMag = max(length(gradf), 0.5);

        float d = sin(f * PI) / (PI * gMag);

        return ${col(display)};
      }
    `, { animate: true });
  },
};
