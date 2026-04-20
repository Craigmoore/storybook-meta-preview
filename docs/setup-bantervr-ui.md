# Setup: bantervr-ui

## Purpose
Demonstrates Storybook for BanterVR UI components — panels, buttons, labels, sliders built with the BanterVR UI Toolkit. The meta-preview script runs embedded in a Banter scene's `index.html`, where the `BS.*` API is available.

## Ports
- Storybook: 6011
- Relay: 3338

## Run
```bash
yarn dev:bantervr-ui
```

## How the Meta-Preview Works

Unlike other setups, the meta-preview is **not a browser page you open** — it is a script embedded directly in a Banter scene's `index.html` by the developer. The script connects to the relay and executes story render functions inside the live Banter environment.

**Embed process:**
1. Run `yarn dev:bantervr-ui`
2. Take the generated meta-preview script and embed it in your Banter scene's `index.html`
3. Configure parameters at embed time: `relayHost`, `relayPort`, and default position/rotation/scale for UI panels
4. Open the scene in Banter — the script connects to the relay and listens for stories
5. Select a story in Storybook → it renders as real UI in the Banter scene

## Story Format
Stories export a render function that receives `(scene, BS)` and creates BanterVR objects.

```javascript
// Atom: a single UI label
export default { title: 'BanterVR-UI/Atoms/Label' };
export const Default = {
  render: (scene, BS) => {
    const panelObj = new BS.GameObject({ name: 'StoryLabel' });
    const panel = panelObj.AddComponent(new BS.BanterUIPanel({
      resolution: new BS.Vector2(400, 100),
    }));

    const label = new BS.UILabel();
    label.SetProperty(BS.PN.text, 'Hello');
    label.style.fontSize = '48px';
    label.style.color = '#ffffff';
    panel.root.AppendChild(label);

    return panelObj;
  }
};

// Molecule: a button + label
export default { title: 'BanterVR-UI/Molecules/LabelledButton' };
export const Default = {
  render: (scene, BS) => {
    const panelObj = new BS.GameObject({ name: 'StoryButton' });
    const panel = panelObj.AddComponent(new BS.BanterUIPanel({
      resolution: new BS.Vector2(400, 200),
    }));

    const label = new BS.UILabel();
    label.SetProperty(BS.PN.text, 'Click me');
    label.style.color = '#ffffff';

    const button = new BS.UIButton();
    button.SetProperty(BS.PN.text, 'Go');
    button.OnClick(() => console.log('clicked'));

    panel.root.AppendChild(label);
    panel.root.AppendChild(button);

    return panelObj;
  }
};
```

## Meta-Preview Protocol
1. Relay serves story files as static assets
2. Meta-preview script (embedded in Banter scene) connects to relay via WebSocket
3. On story selected: script dynamically imports the story module via `import(url)`
4. Calls `story.render(scene, BS)` with the live BanterScene and BS namespace
5. All GameObjects created by the previous story are destroyed first
6. New story objects are positioned according to embed-time parameters

## Scene Clearing
The meta-preview tracks all GameObjects created by each story render. On update, it calls `obj.Destroy()` on each before running the new story.

## Key APIs
See `docs/sdk-banter.md` for the full BanterVR SDK reference. Relevant for this setup:
- `BS.BanterUIPanel`
- `BS.UILabel`, `BS.UIButton`, `BS.UISlider`, `BS.UIToggle`, `BS.UIScrollView`, `BS.UIVisualElement`
- Style properties (flexbox-like: `flexDirection`, `backgroundColor`, `padding`, `borderRadius` etc.)
- `BS.Vector2` for panel resolution
