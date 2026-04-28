import { sdfStory, col, displayArgType } from '../story.js';

export default { title: 'SDF2D/Organisms/Compositions' };

const display = { display: 'field' };
const displayType = { display: displayArgType };

// ── Emblem ────────────────────────────────────────────────────────────────────
// molWings + molLens: the lens sits centred on the body as a shield boss or
// visor, giving the combined shape a crest/badge silhouette.
export const Emblem = {
  args: { spread: 0.18, sweep: 35, lobeRadius: 0.12, visorRadius: 0.14, visorGap: 0.07, ...display },
  argTypes: {
    spread:      { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    sweep:       { control: { type: 'range', min: 0,    max: 80,   step: 1 } },
    lobeRadius:  { control: { type: 'range', min: 0.04, max: 0.25, step: 0.01 } },
    visorRadius: { control: { type: 'range', min: 0.06, max: 0.25, step: 0.01 } },
    visorGap:    { control: { type: 'range', min: 0.02, max: 0.18, step: 0.01 } },
    ...displayType,
  },
  render: ({ spread, sweep, lobeRadius, visorRadius, visorGap, display }) => {
    const sp = spread.toFixed(4), ang = (sweep * Math.PI / 180).toFixed(5);
    const lr = lobeRadius.toFixed(4), vr = visorRadius.toFixed(4), vg = visorGap.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float wings = molWings(p, ${sp}, ${ang}, ${lr});
        float visor = molLens(p, ${vr}, ${vg});
        float d = opUnion(wings, visor);
        return ${col(display)};
      }
    `);
  },
};

// ── TriForce ──────────────────────────────────────────────────────────────────
// Three molWireframeTriangle molecules arranged at the vertices of a larger
// equilateral triangle. Organism geometry positions the molecules; each
// molecule independently encodes its three-edge structure.
export const TriForce = {
  args: { triRadius: 0.18, spread: 0.26, thickness: 0.012, ...display },
  argTypes: {
    triRadius: { control: { type: 'range', min: 0.06, max: 0.28, step: 0.01 } },
    spread:    { control: { type: 'range', min: 0.08, max: 0.42, step: 0.01 } },
    thickness: { control: { type: 'range', min: 0.004, max: 0.03, step: 0.001 } },
    ...displayType,
  },
  render: ({ triRadius, spread, thickness, display }) => {
    const tr = triRadius.toFixed(4), th = thickness.toFixed(4);
    const ox = (spread * 0.866025).toFixed(5), oy = (spread * 0.5).toFixed(5);
    const sy = spread.toFixed(5);
    return sdfStory(`
      vec3 render(vec2 p) {
        float t1 = molWireframeTriangle(p - vec2(0.0,   ${sy}), ${tr}, ${th});
        float t2 = molWireframeTriangle(p - vec2(-${ox}, -${oy}), ${tr}, ${th});
        float t3 = molWireframeTriangle(p - vec2( ${ox}, -${oy}), ${tr}, ${th});
        float d  = opUnion(opUnion(t1, t2), t3);
        return ${col(display)};
      }
    `);
  },
};

// ── Cell ──────────────────────────────────────────────────────────────────────
// molSmoothBlob (nucleus) + molRingLattice (membrane channels). Two distinct
// molecule types composing a biological cell cross-section.
export const Cell = {
  args: { blobSpread: 0.09, blobRadius: 0.13, blobK: 0.06,
          latticeRadius: 0.12, latticeTube: 0.012, spotRadius: 0.04, latticeSpacing: 0.30,
          ...display },
  argTypes: {
    blobSpread:     { control: { type: 'range', min: 0.03, max: 0.2,   step: 0.01 } },
    blobRadius:     { control: { type: 'range', min: 0.05, max: 0.25,  step: 0.01 } },
    blobK:          { control: { type: 'range', min: 0.01, max: 0.15,  step: 0.01 } },
    latticeRadius:  { control: { type: 'range', min: 0.05, max: 0.22,  step: 0.01 } },
    latticeTube:    { control: { type: 'range', min: 0.004, max: 0.04, step: 0.002 } },
    spotRadius:     { control: { type: 'range', min: 0.01, max: 0.1,   step: 0.005 } },
    latticeSpacing: { control: { type: 'range', min: 0.15, max: 0.55,  step: 0.01 } },
    ...displayType,
  },
  render: ({ blobSpread, blobRadius, blobK, latticeRadius, latticeTube, spotRadius, latticeSpacing, display }) => {
    const bs = blobSpread.toFixed(4), br = blobRadius.toFixed(4), bk = blobK.toFixed(4);
    const lr = latticeRadius.toFixed(4), lt = latticeTube.toFixed(4);
    const sr = spotRadius.toFixed(4), ls = latticeSpacing.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float nucleus  = molSmoothBlob(p, ${bs}, ${br}, ${bk});
        float membrane = molRingLattice(p, ${lr}, ${lt}, ${sr}, ${ls});
        float d = opUnion(nucleus, membrane);
        return ${col(display)};
      }
    `);
  },
};

// ── GearMandala ───────────────────────────────────────────────────────────────
// molKaleidoscope as the outer radial pattern with a molWireframeTriangle at
// the centre. The triangle anchors the design; the kaleidoscope radiates from it.
export const GearMandala = {
  args: { folds: 6, capsuleOffset: 0.25, capsuleLength: 0.18, capsuleRadius: 0.06, k: 0.04,
          triRadius: 0.09, triThickness: 0.014, ...display },
  argTypes: {
    folds:         { control: { type: 'range', min: 2,    max: 12,   step: 1 } },
    capsuleOffset: { control: { type: 'range', min: 0.05, max: 0.45, step: 0.01 } },
    capsuleLength: { control: { type: 'range', min: 0.05, max: 0.4,  step: 0.01 } },
    capsuleRadius: { control: { type: 'range', min: 0.02, max: 0.15, step: 0.01 } },
    k:             { control: { type: 'range', min: 0.0,  max: 0.15, step: 0.005 } },
    triRadius:     { control: { type: 'range', min: 0.03, max: 0.2,  step: 0.01 } },
    triThickness:  { control: { type: 'range', min: 0.004, max: 0.03, step: 0.001 } },
    ...displayType,
  },
  render: ({ folds, capsuleOffset, capsuleLength, capsuleRadius, k, triRadius, triThickness, display }) => {
    const n  = folds.toFixed(1), co = capsuleOffset.toFixed(4);
    const cl = capsuleLength.toFixed(4), cr = capsuleRadius.toFixed(4), kv = k.toFixed(4);
    const tr = triRadius.toFixed(4), tt = triThickness.toFixed(4);
    return sdfStory(`
      vec3 render(vec2 p) {
        float outer = molKaleidoscope(p, ${n}, ${co}, ${cl}, ${cr}, ${kv});
        float inner = molWireframeTriangle(p, ${tr}, ${tt});
        float d = opUnion(outer, inner);
        return ${col(display)};
      }
    `);
  },
};
