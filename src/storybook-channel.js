// Shared storybook-channel decorator.
// Connects Storybook's preview iframe to the relay server and sends rendered
// HTML after each story render. Each setup injects STORYBOOK_RELAY_PORT via
// its dev script so this file stays setup-agnostic.

const relayPort = process.env.STORYBOOK_RELAY_PORT ?? '3333';
const relay     = new WebSocket(`ws://${location.hostname}:${relayPort}`);

let currentStoryId = null;

relay.addEventListener('open', () => {
  relay.send(JSON.stringify({ type: 'register', role: 'storybook-channel' }));
});

relay.addEventListener('message', (event) => {
  let msg;
  try { msg = JSON.parse(event.data); } catch { return; }
  if (msg.type === 'tui-resize' && currentStoryId) {
    const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (channel) {
      channel.emit('updateStoryArgs', { storyId: currentStoryId, updatedArgs: { cols: msg.cols, rows: msg.rows } });
    }
  }
});

export const decorators = [
  (StoryFn, context) => {
    currentStoryId                 = context.id;
    window.__metaPreviewScene      = null;
    window.__metaPreviewData       = null;
    window.__metaPreviewBrush      = null;
    window.__metaPreviewBanterUI   = null;
    window.__metaPreviewBanterVR3D = null;
    window.__metaPreviewTUI        = null;
    window.__metaPreviewSDF2D      = null;
    window.__metaPreviewSDF3D      = null;
    const result = StoryFn();

    requestAnimationFrame(() => {
      if (relay.readyState !== WebSocket.OPEN) return;

      if (window.__metaPreviewScene) {
        try {
          relay.send(JSON.stringify({
            type: 'story-rendered',
            storyId: context.id,
            name: context.name,
            kind: context.kind,
            sceneJson: window.__metaPreviewScene.toJSON(),
          }));
        } catch (err) {
          console.error('[storybook-channel] scene serialization failed:', err);
        }
        window.__metaPreviewScene = null;
        return;
      }

      if (window.__metaPreviewData) {
        relay.send(JSON.stringify({
          type: 'story-rendered',
          storyId: context.id,
          name: context.name,
          kind: context.kind,
          audioData: window.__metaPreviewData,
        }));
        window.__metaPreviewData = null;
        return;
      }

      if (window.__metaPreviewBrush) {
        relay.send(JSON.stringify({
          type: 'story-rendered',
          storyId: context.id,
          name: context.name,
          kind: context.kind,
          brushData: window.__metaPreviewBrush,
        }));
        window.__metaPreviewBrush = null;
        return;
      }

      if (window.__metaPreviewBanterVR3D) {
        relay.send(JSON.stringify({
          type:          'story-rendered',
          storyId:       context.id,
          name:          context.name,
          kind:          context.kind,
          banterVR3DData: window.__metaPreviewBanterVR3D.sceneData,
        }));
        window.__metaPreviewBanterVR3D = null;
        return;
      }

      if (window.__metaPreviewTUI) {
        relay.send(JSON.stringify({
          type:    'story-rendered',
          storyId: context.id,
          name:    context.name,
          kind:    context.kind,
          tuiData: window.__metaPreviewTUI,
        }));
        window.__metaPreviewTUI = null;
        return;
      }

      if (window.__metaPreviewSDF2D) {
        relay.send(JSON.stringify({
          type:     'story-rendered',
          storyId:  context.id,
          name:     context.name,
          kind:     context.kind,
          sdf2dData: window.__metaPreviewSDF2D,
        }));
        window.__metaPreviewSDF2D = null;
        return;
      }

      if (window.__metaPreviewSDF3D) {
        relay.send(JSON.stringify({
          type:     'story-rendered',
          storyId:  context.id,
          name:     context.name,
          kind:     context.kind,
          sdf3dData: window.__metaPreviewSDF3D,
        }));
        window.__metaPreviewSDF3D = null;
        return;
      }

      const root = document.querySelector('#storybook-root');
      if (!root) return;

      if (window.__metaPreviewBanterUI) {
        relay.send(JSON.stringify({
          type: 'story-rendered',
          storyId: context.id,
          name: context.name,
          kind: context.kind,
          banterUIHtml: root.innerHTML,
          banterUIData: window.__metaPreviewBanterUI.sceneData,
        }));
        window.__metaPreviewBanterUI = null;
        return;
      }

      relay.send(JSON.stringify({
        type: 'story-rendered',
        storyId: context.id,
        name: context.name,
        kind: context.kind,
        html: root.innerHTML,
      }));
    });

    return result;
  },
];
