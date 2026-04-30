import { sdf3dStory, displayArgType } from '../story.js';
import { extrude, onion, twist } from '../primitives.js';
import { textToSdf2D } from '../rasterSdf2d.js';
import { loadThreeFont, textToGlyphSdf2D } from '../glyphSdf2d.js';

export default { title: 'SDF3D/Molecules/Text' };

const shared     = { display: 'solid', resolution: 40 };
const sharedType = {
  display:    displayArgType,
  resolution: { control: { type: 'range', min: 24, max: 64, step: 8 } },
};
const range = (min, max, step) => ({ control: { type: 'range', min, max, step } });

// ── Async helper ──────────────────────────────────────────────────────────────
// Glyph stories need the font loaded from CDN. Return a placeholder div, then
// swap it for the 3D canvas once the font is ready.

let fontPromise = null;
function getFont() {
  if (!fontPromise) fontPromise = loadThreeFont();
  return fontPromise;
}

function asyncStory(buildFn) {
  const div = document.createElement('div');
  div.style.cssText = 'width:100%;height:100%;background:#0d0d12;color:#444;display:flex;align-items:center;justify-content:center;font:11px monospace';
  div.textContent   = 'loading font…';
  getFont().then(font => {
    const canvas = buildFn(font);
    div.parentNode?.replaceChild(canvas, div);
  });
  return div;
}

// ── Raster SDF ────────────────────────────────────────────────────────────────
// Uses the browser canvas text renderer → distance transform → extrude.
// Resolution is limited by canvas pixel density; curves have slight stairstepping
// but any font available to the browser works, and it composes with all SDF ops.

export const RasterLetter = {
  args: { text: 'A', depth: 0.35, ...shared },
  argTypes: {
    text:  { control: 'text' },
    depth: range(0.05, 1.0, 0.05),
    ...sharedType,
  },
  render: ({ text, depth, display, resolution }) => {
    const sdf2d = textToSdf2D(text.slice(0, 1) || 'A', { size: 256, worldWidth: 2, worldHeight: 2 });
    return sdf3dStory(extrude(depth / 2, sdf2d), { display, resolution, bounds: 1.4 });
  },
};

export const RasterWord = {
  args: { text: 'SDF', depth: 0.3, ...shared },
  argTypes: {
    text:  { control: 'text' },
    depth: range(0.05, 0.8, 0.05),
    ...sharedType,
  },
  render: ({ text, depth, display, resolution }) => {
    const t     = text || 'SDF';
    const ratio = Math.max(1, t.length) * 0.8;
    const sdf2d = textToSdf2D(t, { size: 256, worldWidth: ratio * 1.6, worldHeight: 1.6 });
    return sdf3dStory(extrude(depth / 2, sdf2d), { display, resolution, bounds: ratio });
  },
};

// ── Glyph SDF ─────────────────────────────────────────────────────────────────
// Exact signed distance field computed from the Helvetiker Bold bezier outlines.
// Curves are mathematically precise at any resolution. Composes correctly with
// all SDF boolean and domain operations.

export const GlyphLetter = {
  args: { text: 'A', depth: 0.4, ...shared },
  argTypes: {
    text:  { control: 'text' },
    depth: range(0.05, 1.0, 0.05),
    ...sharedType,
  },
  render: ({ text, depth, display, resolution }) =>
    asyncStory(font => {
      const sdf2d = textToGlyphSdf2D(font, text.slice(0, 1) || 'A', { worldWidth: 2, worldHeight: 2 });
      return sdf3dStory(extrude(depth / 2, sdf2d), { display, resolution, bounds: 1.4 });
    }),
};

export const GlyphWord = {
  args: { text: 'SDF', depth: 0.3, ...shared },
  argTypes: {
    text:  { control: 'text' },
    depth: range(0.05, 0.8, 0.05),
    ...sharedType,
  },
  render: ({ text, depth, display, resolution }) =>
    asyncStory(font => {
      const t     = text || 'SDF';
      const ratio = Math.max(1, t.length) * 0.8;
      const sdf2d = textToGlyphSdf2D(font, t, { worldWidth: ratio * 1.6, worldHeight: 1.6 });
      return sdf3dStory(extrude(depth / 2, sdf2d), { display, resolution, bounds: ratio });
    }),
};

// Glyph SDF with domain operations applied — shows why exact SDF matters.
// twist() and onion() produce clean results only when the input distances are correct.
export const GlyphOps = {
  args: { text: 'S', depth: 0.5, twistRate: 1.8, shell: false, shellThickness: 0.04, ...shared },
  argTypes: {
    text:           { control: 'text' },
    depth:          range(0.1, 1.2, 0.05),
    twistRate:      range(0, 6, 0.25),
    shell:          { control: 'boolean' },
    shellThickness: range(0.01, 0.15, 0.01),
    ...sharedType,
  },
  render: ({ text, depth, twistRate, shell, shellThickness, display, resolution }) =>
    asyncStory(font => {
      const sdf2d = textToGlyphSdf2D(font, text.slice(0, 1) || 'S', { worldWidth: 2, worldHeight: 2 });
      let sdf = extrude(depth / 2, sdf2d);
      if (twistRate > 0) sdf = twist(twistRate, sdf);
      if (shell)         sdf = onion(shellThickness, sdf);
      return sdf3dStory(sdf, { display, resolution, bounds: 1.6 });
    }),
};
