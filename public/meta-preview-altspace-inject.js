// Altspace UI inject script — self-contained, no story files required.
// Reads config from its own <script> tag attributes. Relay URL is derived
// from the script src, so no separate configuration is needed.
//
// Targets the Altspace (SideQuest Creator SDK) fork of BanterVR — the UI
// Toolkit component API (BanterUI, CreateLabel/CreateButton/CreateSlider/
// CreateToggle/CreateScrollView/CreateVisualElement, SetProperty, SetStyles)
// is unchanged from upstream Banter as of the Altspace branch, so this
// script is a straight copy of meta-preview-bantervr-inject.js kept as its
// own file in case that API diverges later.
//
// Usage:
//   <script position="0 1.5 2" rotation="0 180 0" scale="1 1 1"
//           src="https://YOUR_DEV_IP:33430/meta-preview-altspace-inject.js"></script>

(function () {
  const tag = document.currentScript;

  window.addEventListener('bs-loaded', function () {
    const srcUrl  = new URL(tag.src);
    const wsProto = srcUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl   = `${wsProto}//${srcUrl.host}`;

    function parseVec3(attr, dx, dy, dz) {
      const parts = (tag.getAttribute(attr) || '').trim().split(/\s+/).map(Number);
      return {
        x: isNaN(parts[0]) ? dx : parts[0],
        y: isNaN(parts[1]) ? dy : parts[1],
        z: isNaN(parts[2]) ? dz : parts[2],
      };
    }

    const position = parseVec3('position', 0, 1.5, 2);
    const rotation = parseVec3('rotation', 0, 180, 0);
    const scale    = parseVec3('scale',    1, 1,   1);

    const scene = BS.BanterScene.GetInstance();
    let prevObjects = [];

    function destroyPrev() {
      for (const obj of prevObjects) { try { obj.Destroy(); } catch (_) {} }
      prevObjects = [];
    }

    // Strips CSS properties that cause Unity UI Toolkit's SetStyles to abort
    // entirely, discarding all other properties in the same call.
    // Known culprits: gap/rowGap/columnGap, compound shorthands (padding/margin/border),
    // and unity* prefixed properties (unityFontStyle, unityTextAlign, etc.) — these are
    // USS-only and not valid in Banter's JS SetStyles bridge.
    // Also unwraps CSS url('...') syntax from backgroundImage.
    function sanitizeStyles(styles) {
      if (!styles) return {};
      const out = {};
      for (let [k, v] of Object.entries(styles)) {
        if (k === 'gap' || k === 'rowGap' || k === 'columnGap') continue;
        if (k === 'padding' || k === 'margin' || k === 'border') continue;
        if (k === 'wordSpacing') continue;
        if (k.startsWith('unity')) continue;
        if (k === 'backgroundImage' && typeof v === 'string') {
          const m = v.match(/^url\(['"]?(.*?)['"]?\)$/);
          if (m) v = m[1];
        }
        out[k] = v;
      }
      return out;
    }

    async function buildElement(panel, node, parent) {
      let el;
      switch (node.type) {
        case 'UILabel':         el = panel.CreateLabel(undefined, parent);                        break;
        case 'UIButton':        el = panel.CreateButton(parent);                                  break;
        case 'UISlider':        el = panel.CreateSlider(node.min ?? 0, node.max ?? 100, parent); break;
        case 'UIToggle':        el = panel.CreateToggle(parent);                                  break;
        case 'UIScrollView':    el = panel.CreateScrollView(parent);                              break;
        case 'UIVisualElement': el = panel.CreateVisualElement(parent);                           break;
        default: return null;
      }

      await el.Async();

      for (const [k, v] of Object.entries(node.properties || {})) {
        if (k === 'text') el.text = v;
        else el.SetProperty(BS.PN[k] ?? k, v);
      }
      const safe = sanitizeStyles(node.styles);
      if (Object.keys(safe).length > 0) {
        el.SetStyles(safe);
      }
      if (node.type === 'UISlider') {
        el.SetProperty('lowValue',  node.min  ?? 0);
        el.SetProperty('highValue', node.max  ?? 1);
        await scene.WaitForEndOfFrame();
        if (node.value != null) el.SetProperty('value', node.value);
      }
      if (node.type === 'UIToggle') {
        await scene.WaitForEndOfFrame();
        el.SetProperty('value', node.checked ? 'true' : 'false');
      }

      for (const child of node.children || []) {
        await buildElement(panel, child, el);
      }

      return el;
    }

    async function reconstructScene(sceneData) {
      console.log('[altspace-inject] reconstructing', sceneData.objects?.length, 'objects');
      destroyPrev();

      for (const objData of sceneData.objects || []) {
        const obj = new BS.GameObject({
          name:             objData.name,
          localPosition:    new BS.Vector3(position.x, position.y, position.z),
          localEulerAngles: new BS.Vector3(rotation.x, rotation.y, rotation.z),
          localScale:       new BS.Vector3(scale.x,    scale.y,    scale.z),
        });
        prevObjects.push(obj);

        for (const compData of objData.components || []) {
          if (compData.type !== 'BanterUIPanel') continue;

          const res = compData.resolution || { x: 400, y: 200 };
          const panel = await obj.AddComponent(new BS.BanterUI(new BS.Vector2(res.x, res.y), false));
          console.log('[altspace-inject] panel created, oid:', panel.oid);

          const root = panel.CreateVisualElement();
          await root.Async();
          root.SetStyles(sanitizeStyles(compData.rootStyles || {}));

          for (const child of compData.children || []) {
            await buildElement(panel, child, root);
          }
          console.log('[altspace-inject] panel built');
        }
      }
      console.log('[altspace-inject] done');
    }

    function connect() {
      const ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => {
        console.log('[altspace-inject] connected');
        ws.send(JSON.stringify({ type: 'register', role: 'altspace-inject' }));
      });
      ws.addEventListener('message', (e) => {
        let msg; try { msg = JSON.parse(e.data); } catch (_) { return; }
        if (msg.type === 'story-rendered' && msg.altspaceUIData) {
          clearTimeout(ws._debounce);
          ws._debounce = setTimeout(() => {
            reconstructScene(msg.altspaceUIData).catch(err => console.error('[altspace-inject] error:', err));
          }, 1000);
        }
      });
      ws.addEventListener('close', () => setTimeout(connect, 3000));
      ws.addEventListener('error', () => ws.close());
    }

    scene.On('unity-loaded', connect);
  });
})();
