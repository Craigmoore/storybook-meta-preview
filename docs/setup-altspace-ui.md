# Setup: altspace-ui

## Purpose
Parallel fork of [`bantervr-ui`](setup-bantervr-ui.md) targeting the `Altspace` branch of BanterSDK (`~/dev/flashygraphics/projects/BanterSDK`) — SideQuest's internal rebrand of the SDK ("SideQuest Creator SDK", Unity 6000.3). Kept as its own named copy (own stories, mock, meta-preview, inject script) so it can diverge independently if Altspace's runtime changes later.

Confirmed by diffing `main` against `origin/Altspace` in BanterSDK: the UI Toolkit component API (`BanterUIPanel`, `UILabel`, `UIButton`, `UISlider`, `UIToggle`, `UIScrollView`, `UIVisualElement` and their properties) is **unchanged** on that branch. The only UI-adjacent diffs are:
- `Runtime/Resources/UI/DefaultTheme.tss` (new) — sets `.unity-label { color: white; }` as a default theme
- `Runtime/Scripts/Utils/AddPanelStuff.cs` — adds an internal `PanelReady` C# event, not exposed to JS

Neither affects story authoring or the JS-facing API, so everything below is identical to `bantervr-ui` with names swapped.

## Ports
- Storybook: 6016
- Relay: 3343

## Run
```bash
yarn dev:altspace-ui
```

---

## Two different delivery pages — don't confuse them

- **`public/meta-preview-altspace-ui.html`** — a desktop-browser dev preview (`http://[host]:3343/meta-preview-altspace-ui.html`). Renders the mock HTML approximation of whatever story is selected in Storybook. It checks for `BS` only to show a "detected" indicator — it never calls real BS APIs, even when BS is present. Good for iterating on story visuals without an Altspace client running.
- **`public/meta-preview-altspace-inject.js`** — the piece that actually **loads directly into Altspace**. A self-contained script, added via a `<script src="...">` tag directly in the Altspace world's own `index.html` (not viewed in a regular browser). It connects to the relay over WebSocket and, using the live `BS` API available inside the world, reconstructs the selected story as a real `BS.BanterUIPanel` with real `UILabel`/`UIButton`/`UISlider`/`UIToggle`/`UIScrollView`/`UIVisualElement` children.

## Story format

Stories use the `altspaceUiStory()` helper from `src/altspace-ui/story.js`. The render function receives `(scene, BS)` where `BS` is the mock API in Storybook preview and the real API in-world.

```js
import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Atoms/Label' };

export const Default = {
  render: () => altspaceUiStory((scene, BS) => {
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

`altspaceUiStory()` renders the mock DOM tree in the Storybook preview and stashes `sceneData` on `window.__metaPreviewAltspaceUI` for the relay to pick up. `src/storybook-channel.js` forwards it as `altspaceUIHtml` (to the dev-preview page) and `altspaceUIData` (to the inject script).

---

## Story structure

Stories follow atomic design: atoms → molecules → organisms — identical set to `bantervr-ui`.

```
src/altspace-ui/
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

The inject script (`public/meta-preview-altspace-inject.js`) is a self-contained file that you add to your Altspace world's `index.html`. It reads its relay address from its own `src` URL so no separate config is needed.

```html
<script position="0 1.5 2" rotation="0 180 0" scale="1 1 1"
        src="http://[host]:3343/meta-preview-altspace-inject.js"></script>
```

1. The script connects to the relay via WebSocket on load, registering with role `altspace-inject`
2. On story selected: relay sends the JSON scene description (`altspaceUIData`)
3. Script destroys any previous story objects, then reconstructs the panel in-world using the live BS API
4. `sanitizeStyles()` strips properties that abort Altspace's `SetStyles` call (see below)

---

## Style constraints

Same JS→Unity bridge as `bantervr-ui` — `SetStyles` passes styles through Unity UI Toolkit. Certain CSS properties cause the entire `SetStyles` call to abort silently, discarding all other properties in the same call.

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
// In async contexts (altspace-ui-test.js pattern):
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

### Setting label/button text directly against real BS (not via the generic inject pipeline)

Confirmed by a live in-world test on `meta-preview-altspace-tetris-inject.js`: `el.SetProperty(BS.PN.text, value)` does not render — the label/button exists and is sized/styled correctly, but the text is invisible. Set it as a direct property instead:
```js
// Correct — matches bantervr-ui-test.js and the working meta-preview-*-inject.js scripts
label.text = 'Hello';
// Wrong — silently renders no text on real Altspace (docs show this form, but it doesn't work)
label.SetProperty(BS.PN.text, 'Hello');
```
This only bit a *standalone* in-world script that calls `panel.CreateLabel`/`CreateButton` directly — story authoring (via the mock `BS`) and the generic `meta-preview-altspace-inject.js` pipeline were never affected, since the generic inject script's `buildElement()` already special-cases the `text` property this same correct way (`if (k === 'text') el.text = v; else el.SetProperty(...)`) when translating a story's serialized properties into real BS calls.

---

## Reference patterns

`public/altspace-ui-test.js` is the authoritative reference for all known-good UI patterns on Altspace, with inline comments explaining each constraint. Load it in an Altspace world to verify the panel pipeline works independently of Storybook:

```html
<script src="http://[host]:3343/altspace-ui-test.js"></script>
```

---

## Known limitations

- `backgroundImage` on `UIVisualElement` does not render — Unity UI Toolkit requires a `Sprite`/`Texture2D` asset reference and does not support runtime URLs. Use emoji characters for inline icons instead.

## Open questions

- Not yet verified live inside an actual Altspace client — the inject script logic is a straight copy of `bantervr-ui`'s working, in-world-tested script, but hasn't itself been run in-world. Flag here if Altspace's live behavior diverges from Banter once tested.
