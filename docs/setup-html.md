# Setup: html

## Purpose
Baseline setup demonstrating the core storybook → relay → meta-preview pipeline using plain HTML strings. Reference example for the simplest possible meta-preview integration.

## Ports
- Storybook: 6006
- Relay: 3333

## Run
```bash
yarn dev:html
```

## Story Format
Render functions return HTML strings.

```javascript
// Atom
export default { title: 'Atoms/Hello' };
export const Default = { render: () => `<span class="atom">Hello</span>` };

// Molecule
export default { title: 'Molecules/Greeting', args: { name: 'Stranger' }, argTypes: { name: { control: 'text' } } };
export const Default = {
  render: ({ name }) => `<p class="molecule"><span class="atom">Hello</span> <span class="atom">World</span> <em>${name}</em></p>`
};
```

## Meta-Preview
`public/meta-preview.html` — receives `story-rendered` message from relay and sets `stage.innerHTML = msg.html`.

## Stories
- `Atoms / Hello`
- `Atoms / World`
- `Molecules / Greeting` (live `name` arg)
