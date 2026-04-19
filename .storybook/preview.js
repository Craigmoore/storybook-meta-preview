// storybook-channel: connects Storybook's preview to the relay server.
// After each story renders, captures the DOM and sends it to relay,
// which broadcasts it to any connected meta-preview clients.

const relay = new WebSocket(`ws://${location.hostname}:3333`);

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
