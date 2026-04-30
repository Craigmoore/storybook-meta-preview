// Raster SDF 2D — renders shapes to an offscreen canvas, then computes a
// signed distance field via the Felzenszwalb–Huttenlocher Euclidean DT.
// Returns (x, y) => number suitable for extrude() or revolve().
//
// drawToSdf2D is the primitive: pass any canvas draw function.
// textToSdf2D is a convenience wrapper for text strings.

// ── 1-D distance transform (Felzenszwalb & Huttenlocher 2012) ─────────────────
// Computes min_j { f[j] + (i-j)² } for each i in-place into d.

function dt1d(f, d, v, z, n) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] =  Infinity;

  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));
    while (k > 0 && s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));
    }
    k++;
    v[k]     = q;
    z[k]     = s;
    z[k + 1] = Infinity;
  }

  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    d[q] = (q - r) * (q - r) + f[r];
  }
}

// ── 2-D Euclidean DT (two separable 1-D passes) ───────────────────────────────
// data: Float64Array, length w*h. 0 at seed pixels, Infinity elsewhere.
// Modified in-place; result values are squared distances.

function edt2d(data, w, h) {
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);

  for (let y = 0; y < h; y++) {
    const off = y * w;
    for (let x = 0; x < w; x++) f[x] = data[off + x];
    dt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) data[off + x] = d[x];
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = data[y * w + x];
    dt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) data[y * w + x] = d[y];
  }
}

// ── Build interpolating SDF function from a binary mask ───────────────────────

function buildSdf2D(binary, w, h, worldWidth, worldHeight) {
  const INF = 1e20;

  // outsideDT: seeds at foreground (binary=1) → dist² from each pixel to nearest fg
  // insideDT:  seeds at background (binary=0) → dist² from each pixel to nearest bg
  const outsideDT = new Float64Array(w * h);
  const insideDT  = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) {
    outsideDT[i] = binary[i] ? 0 : INF;
    insideDT[i]  = binary[i] ? INF : 0;
  }

  edt2d(outsideDT, w, h);
  edt2d(insideDT,  w, h);

  // Signed distance in pixel units: negative inside (text), positive outside
  const sdf = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    sdf[i] = binary[i]
      ? -Math.sqrt(insideDT[i])
      :  Math.sqrt(outsideDT[i]);
  }

  const ppu = w / worldWidth; // pixels per world unit (for unit conversion)

  // Bilinear-interpolating SDF sampler in world coordinates.
  // Canvas Y=0 is top; world Y=+1 is top — so Y is flipped.
  return (wx, wy) => {
    const col = (wx + worldWidth  / 2) * ppu;
    const row = h - (wy + worldHeight / 2) * (h / worldHeight);
    const c0  = Math.floor(col), r0 = Math.floor(row);
    const fc  = col - c0,        fr = row - r0;

    const s = (c, r) =>
      c >= 0 && c < w && r >= 0 && r < h ? sdf[r * w + c] : w;

    const v = s(c0,r0)*(1-fc)*(1-fr) + s(c0+1,r0)*fc*(1-fr)
            + s(c0,r0+1)*(1-fc)*fr   + s(c0+1,r0+1)*fc*fr;

    return v / ppu; // pixel units → world units
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Draw anything on an offscreen canvas and convert it to a 2D SDF.
 * drawFn(ctx, canvas) — draw black shapes on the white background.
 * opts.size        canvas resolution (default 256)
 * opts.worldWidth  world-space width of the canvas (default 3)
 * opts.worldHeight world-space height (default 2)
 */
export function drawToSdf2D(drawFn, opts = {}) {
  const { size = 256, worldWidth = 3, worldHeight = 2 } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  drawFn(ctx, canvas);

  const imageData = ctx.getImageData(0, 0, size, size);
  const binary    = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    binary[i] = imageData.data[i * 4] < 128 ? 1 : 0;
  }

  return buildSdf2D(binary, size, size, worldWidth, worldHeight);
}

/**
 * Render a text string using the browser's canvas text API and return a 2D SDF.
 * opts.fontStyle   CSS font-style/weight prefix, e.g. 'bold' (default 'bold')
 * opts.fontFamily  CSS font family (default 'sans-serif')
 * opts.size        canvas resolution (default 256)
 * opts.worldWidth / worldHeight  as above
 */
export function textToSdf2D(text, opts = {}) {
  const { fontStyle = 'bold', fontFamily = 'sans-serif', size = 256 } = opts;
  return drawToSdf2D((ctx, canvas) => {
    const s = canvas.width;
    ctx.font          = `${fontStyle} ${Math.round(s * 0.62)}px ${fontFamily}`;
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'middle';
    ctx.fillStyle     = '#000';
    ctx.fillText(text, s / 2, s / 2);
  }, opts);
}

/**
 * Build a 3D SDF from three 2D silhouette images, one per world axis.
 * The result is the intersection of the three "shadow volumes" — a point is
 * inside only if it falls inside all three projected silhouettes.
 *
 * Each draw function is (ctx, canvas) => void, drawing black shapes on white.
 * Axis mapping (what the canvas axes represent in 3D world space):
 *   drawX — silhouette seen along X:  canvas horizontal = Y, vertical = Z
 *   drawY — silhouette seen along Y:  canvas horizontal = X, vertical = Z
 *   drawZ — silhouette seen along Z:  canvas horizontal = X, vertical = Y
 *
 * opts.size       canvas resolution per axis (default 256)
 * opts.worldSize  world-space half-extent (default 2, so the canvas spans [-1,1]³)
 */
export function projectionSdf3D(drawX, drawY, drawZ, opts = {}) {
  const { size = 256, worldSize = 2 } = opts;
  const o = { size, worldWidth: worldSize, worldHeight: worldSize };
  const sdfX = drawToSdf2D(drawX, o);
  const sdfY = drawToSdf2D(drawY, o);
  const sdfZ = drawToSdf2D(drawZ, o);
  // SDF convention: max = intersection of three extruded volumes
  return (p) => Math.max(sdfX(p.y, p.z), sdfY(p.x, p.z), sdfZ(p.x, p.y));
}
