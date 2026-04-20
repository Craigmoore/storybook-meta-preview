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
    const result = StoryFn();

    requestAnimationFrame(() => {
      const root = document.querySelector('#storybook-root');
      if (!root || relay.readyState !== WebSocket.OPEN) return;

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
