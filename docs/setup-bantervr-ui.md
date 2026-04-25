# Setup: bantervr-ui

## Purpose
Demonstrates Storybook for BanterVR UI components — panels, buttons, labels, sliders built with the BanterVR UI Toolkit. Stories are authored in JS using a mock BS API; the inject script reconstructs the real panel in-world where the live `BS.*` API is available.

## Ports
- Storybook: 6011
- Relay: 3338

## Run
```bash
yarn dev:bantervr-ui
```

---

## Story format

Stories use the `banterUiStory()` helper from `src/bantervr-ui/story.js`. The render function receives `(scene, BS)` where `BS` is the mock API in Storybook preview and the real API in-world.

```js
import { banterUiStory } from '../story.js';

export default { title: 'BanterVR-UI/Atoms/Label' };

export const Default = {
  render: () => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'StoryLabel' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(400, 100) }));

    const label = new BS.UILabel();
    label.SetProperty(BS.PN.text, 'Hello');
    label.style.fontSize = '24px';
    label.style.color    = '#ffffff';
    panel.root.AppendChild(label);

    return obj;
  }),
};
```

`banterUiStory()` renders the mock DOM tree in the Storybook preview and stashes `sceneData` on `window.__metaPreviewBanterUI` for the relay to pick up.

---

## Story structure

Stories follow atomic design: atoms → molecules → organisms.

```
src/bantervr-ui/
  atoms/
    Buttons.stories.js      — Button, ConfirmCancel, IconButton
    Labels.stories.js       — Label (all properties)
    Inputs.stories.js       — Slider, Toggle
    VisualElement.stories.js — VisualElement, FlexRow, FlexColumn, FlexWrap, Nested
  molecules/
    ActionCard.stories.js   — title + description + button
    ButtonGroup.stories.js  — IconButton (emoji), ImageIconButton, ConfirmCancel
    Labels.stories.js       — Scoreboard, StatusBadge
    Sliders.stories.js      — SliderLabelled, SliderWithRange
    Toggles.stories.js      — ToggleLabelled, ToggleGroup
    ScrollView.stories.js   — VerticalList, HorizontalList, MixedContent
    SettingsPanel.stories.js — volume slider, brightness slider, music toggle, SFX toggle
  organisms/
    GameLobby.stories.js    — full panel: status badge, player scroll list, music toggle, volume slider, action button
```

---

## How the in-world preview works

The inject script (`public/meta-preview-bantervr-inject.js`) is a self-contained file that you add to your Banter world's `index.html`. It reads its relay address from its own `src` URL so no separate config is needed.

```html
<script position="0 1.5 2" rotation="0 180 0" scale="1 1 1"
        src="http://[host]:3338/meta-preview-bantervr-inject.js"></script>
```

1. The script connects to the relay via WebSocket on load
2. On story selected: relay sends the JSON scene description
3. Script destroys any previous story objects, then reconstructs the panel in-world using the live BS API
4. `sanitizeStyles()` strips properties that abort Banter's `SetStyles` call (see below)

---

## Style constraints

Banter's `SetStyles` passes styles through Unity UI Toolkit's JS bridge. Certain CSS properties cause the entire `SetStyles` call to abort silently, discarding all other properties in the same call.

**Never use these — they abort the call:**
- Compound shorthands: `padding`, `margin`, `border`, `gap`, `flex`
- Spacing shorthands: `rowGap`, `columnGap`
- `wordSpacing`
- Any `unity*`-prefixed property: `unityFontStyle`, `unityTextAlign`, etc.

**Instead:**
- Use individual properties: `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`
- Use `marginBottom` / `marginRight` for sibling spacing
- Use explicit `flexDirection`, `flexGrow`, `flexShrink`, `flexBasis` instead of `flex`

---

## Known element quirks

### UILabel
Unity defaults the label background to white. Always set:
```js
label.style.backgroundColor = 'rgba(0,0,0,0)';
```

### UIButton
UIButton uses `content-box` sizing. In a flex-column layout, **do not set `width`** — the 1px border will add to the explicit width and overflow the panel. Let flex stretch handle it:
```js
// Correct — no width set, flex stretch fills the container
btn.style.height   = '44px';
btn.style.fontSize = '16px';
```

### UISlider
`SetRange` / `SetValue` are the correct methods. `lowValue` / `highValue` must also be set via `SetProperty` after `Async()`, then `WaitForEndOfFrame()` before setting `value`:
```js
slider.SetRange(0, 100);
slider.SetValue(50);
// In async contexts (bantervr-ui-test.js pattern):
slider.SetProperty('lowValue', 0);
slider.SetProperty('highValue', 100);
await scene.WaitForEndOfFrame();
slider.SetProperty('value', 65);
```

### UIToggle
Pass the value as a **string**, not a boolean. Call `WaitForEndOfFrame()` before setting:
```js
// Correct
toggle.SetChecked(true);   // in stories via mock BS
toggle.SetProperty('value', 'true');  // in async inject contexts
// Wrong — silently ignored
toggle.SetProperty('value', true);
```

---

## Reference patterns

`public/bantervr-ui-test.js` is the authoritative reference for all known-good Banter UI patterns, with inline comments explaining each constraint. Load it in a Banter world to verify the panel pipeline works independently of Storybook:

```html
<script src="http://[host]:3338/bantervr-ui-test.js"></script>
```

---

## Known limitations

- `backgroundImage` on `UIVisualElement` does not render in BanterVR — Unity UI Toolkit requires a `Sprite`/`Texture2D` asset reference and does not support runtime URLs. Use emoji characters for inline icons instead.
