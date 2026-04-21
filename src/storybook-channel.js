// Shared storybook-channel decorator.
// Connects Storybook's preview iframe to the relay server and sends rendered
// HTML after each story render. Each setup injects STORYBOOK_RELAY_PORT via
// its dev script so this file stays setup-agnostic.

const relayPort = process.env.STORYBOOK_RELAY_PORT ?? '3333';
const relay = new WebSocket(`ws://${location.hostname}:${relayPort}`);

relay.addEventListener('open', () => {
  relay.send(JSON.stringify({ type: 'register', role: 'storybook-channel' }));
});

export const decorators = [
  (StoryFn, context) => {
    window.__metaPreviewScene = null;
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

      const root = document.querySelector('#storybook-root');
      if (!root) return;

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
