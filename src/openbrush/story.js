// Helper for openbrush stories.
// Sets window.__metaPreviewBrush so the storybook-channel sends brushData to
// the relay, and returns a canvas element showing a 2D preview of the strokes.

export function openbrushStory(data) {
  window.__metaPreviewBrush = data;

  const canvas = document.createElement('canvas');
  canvas.width  = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  renderPreview(ctx, canvas.width, canvas.height, data.commands);
  return canvas;
}

function drawPath(ctx, val, cr, cg, cb, strokeW, toCanvas) {
  const pts = [];
  for (const m of val.matchAll(/\[([^\]]+)\]/g)) {
    const parts = m[1].split(',');
    pts.push([parseFloat(parts[0]), parseFloat(parts[1])]);
  }
  if (pts.length < 2) return;
  ctx.strokeStyle = `rgba(${Math.round(cr*255)},${Math.round(cg*255)},${Math.round(cb*255)},0.85)`;
  ctx.lineWidth = strokeW;
  ctx.beginPath();
  const [sx, sy] = toCanvas(pts[0][0], pts[0][1]);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = toCanvas(pts[i][0], pts[i][1]);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function renderPreview(ctx, W, H, commands) {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);

  const scale = W * 0.28;
  const ox = W / 2;
  const oy = H / 2;
  const toCanvas = (x, y) => [ox + x * scale, oy - y * scale];

  let cr = 1, cg = 1, cb = 1;
  let strokeW = 1.2;

  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';

  for (const cmd of commands) {
    if (typeof cmd !== 'string') continue;

    // Commands may be batched as multiple params joined by & (e.g. fern dots)
    for (const part of cmd.split('&')) {
      const eqIdx = part.indexOf('=');
      if (eqIdx < 0) continue;
      const key = part.slice(0, eqIdx);
      const val = part.slice(eqIdx + 1);

      if (key === 'color.set.rgb') {
        const [r, g, b] = val.split(',').map(Number);
        cr = r; cg = g; cb = b;
      } else if (key === 'brush.size.set') {
        strokeW = Math.max(0.8, parseFloat(val) * 6);
      } else if (key === 'draw.path') {
        drawPath(ctx, val, cr, cg, cb, strokeW, toCanvas);
      }
    }
  }
}
