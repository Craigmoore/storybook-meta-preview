// BanterVR SDF3D inject
// Connects to the SDF3D relay and exposes the geometry inject API on window
// so Banter Visual Scripts can pull paged geometry data via the standard
// BanterThreeJsMarshallingService interface.
//
// Add to your Banter world's index.html:
//   <script uuid="YourGameObjectName"
//           src="https://[host]:33420/meta-preview-bantervr-sdf3d-inject.js"></script>
//
// The uuid attribute must match the game object name that owns the Visual Script.
// Defaults to 'sdf3d' if omitted.

(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const uuid      = scriptTag?.getAttribute('uuid') || 'sdf3d';

  // ── Geometry cache ─────────────────────────────────────────────────────────
  // pending: built when a story-rendered message arrives
  // active:  snapshot committed when createGeometry() is called, stable for
  //          the entire read cycle so concurrent messages can't corrupt a
  //          mid-read sequence of paged calls

  let pending = { verts: [], norms: [], tris: [] };
  let active  = { verts: [], norms: [], tris: [] };

  function loadGeometry({ positions, normals, index }) {
    const verts = [], norms = [], tris = [];

    for (let i = 0; i < positions.length; i += 3)
      verts.push(`${positions[i]},${positions[i + 1]},${positions[i + 2]}`);

    for (let i = 0; i < normals.length; i += 3)
      norms.push(`${normals[i]},${normals[i + 1]},${normals[i + 2]}`);

    if (index) {
      for (let i = 0; i < index.length; i += 3)
        tris.push(`${index[i]},${index[i + 1]},${index[i + 2]}`);
    }

    pending = { verts, norms, tris };
    console.log(`[bantervr-sdf3d] geometry ready: ${verts.length} verts, ${tris.length} tris`);
  }

  function paged(arr, offset, count, empty) {
    if (!arr.length || offset < 0 || offset >= arr.length || count <= 0)
      return `-1&0|${empty}`;
    const slice = arr.slice(offset, offset + count);
    return `${offset}&${slice.length}|${slice.join('&')}`;
  }

  // ── Global function definitions ────────────────────────────────────────────
  // Defined only if not already set (same pattern as the Visual Script sample
  // code, so the ActiveObjects service container takes precedence when present).

  if (!window.createGeometry)
    window.createGeometry = function (key) {
      active = pending;
      console.log('[bantervr-sdf3d] createGeometry', key, `${active.verts.length} verts, ${active.tris.length} tris`);
    };

  if (!window.generateVertices)
    window.generateVertices = function ()  { return active.verts.join('&'); };
  if (!window.injectVertices)
    window.injectVertices   = function ()  { return active.verts.join('&'); };
  if (!window.injectVertex)
    window.injectVertex     = function (key, i) {
      return active.verts[i] != null ? `${i}&${active.verts[i]}` : '-1&0,0,0';
    };
  if (!window.injectVerticesPaged)
    window.injectVerticesPaged = function (key, offset, count) {
      return paged(active.verts, offset, count, '0,0,0');
    };

  if (!window.generateNormals)
    window.generateNormals  = function ()  { return active.norms.join('&'); };
  if (!window.injectNormals)
    window.injectNormals    = function ()  { return active.norms.join('&'); };
  if (!window.injectNormal)
    window.injectNormal     = function (key, i) {
      return active.norms[i] != null ? `${i}&${active.norms[i]}` : '-1&0,0,0';
    };
  if (!window.injectNormalsPaged)
    window.injectNormalsPaged = function (key, offset, count) {
      return paged(active.norms, offset, count, '0,0,0');
    };

  if (!window.generateUVs)
    window.generateUVs      = function ()  { return ''; };
  if (!window.injectUVs)
    window.injectUVs        = function ()  { return ''; };
  if (!window.injectUV)
    window.injectUV         = function ()  { return '-1&0,0'; };
  if (!window.injectUVsPaged)
    window.injectUVsPaged   = function ()  { return '-1&0|0,0'; };

  if (!window.generateIndices)
    window.generateIndices  = function ()  { return active.tris.join('&'); };
  if (!window.injectIndices)
    window.injectIndices    = function ()  { return active.tris.join('&'); };
  if (!window.injectIndex)
    window.injectIndex      = function (key, i) {
      return active.tris[i] != null ? `${i}&${active.tris[i]}` : '-1&0,0,0';
    };
  if (!window.injectIndicesPaged)
    window.injectIndicesPaged = function (key, offset, count) {
      return paged(active.tris, offset, count, '0,0,0');
    };

  // ── Relay connection ───────────────────────────────────────────────────────

  const srcUrl  = new URL(scriptTag?.src ?? location.href, location.href);
  const wsProto = srcUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl   = `${wsProto}//${srcUrl.host}`;

  function connect() {
    const ws = new WebSocket(wsUrl);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ type: 'register', role: 'bantervr-sdf3d-inject' }));
      console.log('[bantervr-sdf3d] connected to relay at', wsUrl);
    });

    ws.addEventListener('message', ({ data }) => {
      let msg;
      try { msg = JSON.parse(data); } catch { return; }
      if (msg.type !== 'story-rendered' || !msg.sdf3dData) return;

      loadGeometry(msg.sdf3dData);
      active = pending;

      try {
        BS.BanterScene.GetInstance().SendToVisualScripting(uuid + '.updateGeometryPaged', '');
      } catch (e) {
        console.warn('[bantervr-sdf3d] SendToVisualScripting failed (not in Banter?):', e.message);
      }
    });

    ws.addEventListener('close', () => setTimeout(connect, 3000));
    ws.addEventListener('error', () => ws.close());
  }

  connect();
})();
