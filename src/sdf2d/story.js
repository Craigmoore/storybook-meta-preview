import { PRIMITIVES } from './primitives.js';
import { MOLECULES } from './molecules-lib.js';
import { sdfCanvas } from './canvas.js';

const HEADER = `#version 300 es
precision highp float;
uniform vec2  u_res;
uniform float u_time;
out vec4 fragColor;
`;

const FOOTER = `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  fragColor = vec4(render(p), 1.0);
}
`;

// Assembles a full fragment shader from scene GLSL and creates a canvas.
// sceneSrc must define: vec3 render(vec2 p)
export function sdfStory(sceneSrc, opts = {}) {
  const fragSrc = HEADER + PRIMITIVES + MOLECULES + sceneSrc + FOOTER;
  window.__metaPreviewSDF2D = { fragSrc, animate: opts.animate ?? false, size: opts.size ?? 512 };
  return sdfCanvas(fragSrc, opts);
}

// Standard display arg used across atom stories
export const displayArgType = {
  control: { type: 'select', options: ['field', 'fill', 'outline'] },
};

// Returns the GLSL colorize call for the given display mode
export function col(display) {
  return {
    field:   'colField(d)',
    fill:    'colFill(d, SHAPE_COLOR, BG)',
    outline: 'colOutline(d, 0.015, SHAPE_COLOR, STROKE_COLOR, BG)',
  }[display] ?? 'colField(d)';
}
