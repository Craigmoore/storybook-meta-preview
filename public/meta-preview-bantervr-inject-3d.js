// BanterVR 3D inject script — self-contained, no story files required.
// Reads config from its own <script> tag attributes. Relay URL is derived
// from the script src, so no separate configuration is needed.
//
// Usage:
//   <script position="0 1.5 2" rotation="0 0 0" scale="1 1 1"
//           src="https://YOUR_DEV_IP:33390/meta-preview-bantervr-inject-3d.js"></script>
//
// All story objects are attached as children of a single root container
// placed at the tag's position/rotation/scale. This preserves the relative
// layout of multi-object stories (e.g. a row of primitives) while still
// letting you position the whole scene with the tag attributes.

(function () {
  const tag = document.currentScript;

  window.addEventListener('bs-loaded', function () {
    const srcUrl  = new URL(tag.src);
    const wsProto = srcUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl   = `${wsProto}//${srcUrl.host}`;

    function parseVec3(attr, dx, dy, dz) {
      const raw = (tag.getAttribute(attr) || '').trim();
      // Number('') is 0, not NaN — without this early return, a MISSING
      // attribute would silently resolve x to 0 (isNaN(0) is false) while
      // y/z correctly fell back to their defaults, producing a lopsided
      // vector like (0, 1, 1) instead of the intended (dx, dy, dz).
      if (!raw) return { x: dx, y: dy, z: dz };
      const parts = raw.split(/\s+/).map(Number);
      return {
        x: isNaN(parts[0]) ? dx : parts[0],
        y: isNaN(parts[1]) ? dy : parts[1],
        z: isNaN(parts[2]) ? dz : parts[2],
      };
    }

    const position = parseVec3('position', 0, 1.5, 2);
    const rotation = parseVec3('rotation', 0, 0,   0);
    const scale    = parseVec3('scale',    1, 1,   1);

    const scene = BS.BanterScene.GetInstance();
    let prevObjects = [];

    function destroyPrev() {
      for (const obj of prevObjects) { try { obj.Destroy(); } catch (_) {} }
      prevObjects = [];
    }

    // Convert serialised config values back to BS types.
    // The mock serialises Vector4 → [x,y,z,w], Vector3 → [x,y,z], Vector2 → [x,y].
    function deserializeConfig(config) {
      const out = {};
      for (const [k, v] of Object.entries(config ?? {})) {
        if (Array.isArray(v) && v.every(n => typeof n === 'number')) {
          if      (v.length === 4) out[k] = new BS.Vector4(...v);
          else if (v.length === 3) out[k] = new BS.Vector3(...v);
          else if (v.length === 2) out[k] = new BS.Vector2(...v);
          else out[k] = v;
        } else {
          out[k] = v;
        }
      }
      return out;
    }

    function reconstructObject(objData, parent) {
      const obj = new BS.GameObject({
        name:             objData.name,
        localPosition:    new BS.Vector3(objData.localPosition.x,    objData.localPosition.y,    objData.localPosition.z),
        localEulerAngles: new BS.Vector3(objData.localEulerAngles.x, objData.localEulerAngles.y, objData.localEulerAngles.z),
        localScale:       new BS.Vector3(objData.localScale.x,       objData.localScale.y,       objData.localScale.z),
        parent,
      });
      prevObjects.push(obj);

      for (const { type, config } of objData.components || []) {
        if (!BS[type]) {
          console.warn('[banter-inject-3d] unknown component type:', type);
          continue;
        }
        obj.AddComponent(new BS[type](deserializeConfig(config)));
      }

      for (const child of objData.children || []) {
        reconstructObject(child, obj);
      }

      return obj;
    }

    function reconstructScene(sceneData) {
      console.log('[banter-inject-3d] reconstructing', sceneData.objects?.length, 'objects');
      destroyPrev();

      // Root container at the tag's world position — story objects are children.
      const root = new BS.GameObject({
        name:             '__story_root__',
        localPosition:    new BS.Vector3(position.x, position.y, position.z),
        localEulerAngles: new BS.Vector3(rotation.x, rotation.y, rotation.z),
        localScale:       new BS.Vector3(scale.x,    scale.y,    scale.z),
      });
      prevObjects.push(root);

      for (const objData of sceneData.objects || []) {
        reconstructObject(objData, root);
      }

      console.log('[banter-inject-3d] done');
    }

    function connect() {
      const ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => {
        console.log('[banter-inject-3d] connected');
        ws.send(JSON.stringify({ type: 'register', role: 'banter-inject' }));
      });
      ws.addEventListener('message', (e) => {
        let msg; try { msg = JSON.parse(e.data); } catch (_) { return; }
        if (msg.type === 'story-rendered' && msg.banterVR3DData) {
          clearTimeout(ws._debounce);
          ws._debounce = setTimeout(() => {
            reconstructScene(msg.banterVR3DData);
          }, 1000);
        }
      });
      ws.addEventListener('close', () => setTimeout(connect, 3000));
      ws.addEventListener('error', () => ws.close());
    }

    scene.On('unity-loaded', connect);
  });
})();
