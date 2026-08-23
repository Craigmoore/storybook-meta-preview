// Altspace 3D inject script — self-contained, no story files required.
// Reads config from its own <script> tag attributes. Relay URL is derived
// from the script src, so no separate configuration is needed.
//
// Targets the Altspace (SideQuest Creator SDK) fork of BanterVR — the 3D
// geometry/material component API (BanterBox/BanterSphere/BanterCylinder/
// BanterCone/BanterTorus/BanterTorusKnot/BanterMaterial and their config
// properties) is unchanged from upstream Banter as of the Altspace branch,
// so this script is a straight copy of meta-preview-bantervr-inject-3d.js
// kept as its own file in case that API diverges later.
//
// Usage:
//   <script position="0 1.5 2" rotation="0 0 0" scale="1 1 1"
//           src="https://YOUR_DEV_IP:33440/meta-preview-altspace-inject-3d.js"></script>
//
// Each top-level story object folds the tag's position/rotation/scale
// directly into its own values (no wrapper "root" GameObject in between) —
// this preserves the relative layout of multi-object stories (e.g. a row of
// primitives) while still letting you position the whole scene with the tag
// attributes, without depending on a parent GameObject's transform being
// composed correctly for children created in the same tick. See
// docs/setup-altspace-3d.md for why.

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

    // Every object (top-level AND nested) is created flat — no `parent`
    // field at all. Its localPosition/localEulerAngles are the FULL
    // cumulative sum of every ancestor's offset plus its own authored
    // offset (localScale is the cumulative product); localScale multiplies
    // through the same way. `posOffset`/`rotOffset`/`scaleOffset` carry the
    // running total down from reconstructScene()'s tag-level starting point.
    //
    // This was originally `parent: <object>` + the object's own unmodified
    // local values (the pattern the docs describe, and the one
    // altspace-3d-test.js's known-good group/childA/childB demo uses) — live
    // testing in Altspace showed that composition isn't reliable here: a
    // top-level wrapper's position never reached its children, and even
    // after removing that wrapper, FractalTree/Sierpinski/MengerSponge's own
    // nested branch/vertex children (each parented to the reconstructed
    // story object) were STILL sunk at their raw authored offset — while
    // Primitives/Volumes (no nested children at all) positioned correctly.
    // Summing every level's offset in JS and creating fully independent,
    // unparented GameObjects sidesteps relying on parent-transform
    // composition working at all, at any depth.
    //
    // Rotation/scale composition is a plain component-wise sum/product
    // rather than true 3D rotation composition (rotating the position
    // offset by the accumulated rotation first) — exact whenever every
    // ancestor's own rotation is (0,0,0), which is true for every current
    // story: FractalTree's branches already compute their own absolute
    // orientation directly (see the "no pivot parents with cascading
    // rotations" comment in Fractals.stories.js) rather than relying on
    // inheriting rotation from a rotated parent.
    function reconstructObject(objData, posOffset, rotOffset, scaleOffset) {
      const pos = {
        x: objData.localPosition.x + posOffset.x,
        y: objData.localPosition.y + posOffset.y,
        z: objData.localPosition.z + posOffset.z,
      };
      const rot = {
        x: objData.localEulerAngles.x + rotOffset.x,
        y: objData.localEulerAngles.y + rotOffset.y,
        z: objData.localEulerAngles.z + rotOffset.z,
      };
      const scl = {
        x: objData.localScale.x * scaleOffset.x,
        y: objData.localScale.y * scaleOffset.y,
        z: objData.localScale.z * scaleOffset.z,
      };

      console.log('[altspace-inject-3d]', objData.name, 'placed at', pos);

      const obj = new BS.GameObject({
        name:             objData.name,
        localPosition:    new BS.Vector3(pos.x, pos.y, pos.z),
        localEulerAngles: new BS.Vector3(rot.x, rot.y, rot.z),
        localScale:       new BS.Vector3(scl.x, scl.y, scl.z),
      });
      prevObjects.push(obj);

      for (const { type, config } of objData.components || []) {
        if (!BS[type]) {
          console.warn('[altspace-inject-3d] unknown component type:', type);
          continue;
        }
        obj.AddComponent(new BS[type](deserializeConfig(config)));
      }

      for (const child of objData.children || []) {
        reconstructObject(child, pos, rot, scl);
      }

      return obj;
    }

    function reconstructScene(sceneData) {
      console.log('[altspace-inject-3d] reconstructing', sceneData.objects?.length, 'objects, tag position:', position, 'rotation:', rotation, 'scale:', scale);
      destroyPrev();

      for (const objData of sceneData.objects || []) {
        reconstructObject(objData, position, rotation, scale);
      }

      console.log('[altspace-inject-3d] done');
    }

    function connect() {
      const ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => {
        console.log('[altspace-inject-3d] connected');
        ws.send(JSON.stringify({ type: 'register', role: 'altspace-inject' }));
      });
      ws.addEventListener('message', (e) => {
        let msg; try { msg = JSON.parse(e.data); } catch (_) { return; }
        if (msg.type === 'story-rendered' && msg.altspace3DData) {
          clearTimeout(ws._debounce);
          ws._debounce = setTimeout(() => {
            reconstructScene(msg.altspace3DData);
          }, 1000);
        }
      });
      ws.addEventListener('close', () => setTimeout(connect, 3000));
      ws.addEventListener('error', () => ws.close());
    }

    scene.On('unity-loaded', connect);
  });
})();
