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

## Three different delivery pages — don't confuse them

- **`public/meta-preview-altspace-ui.html`** — a desktop-browser dev preview (`http://[host]:3343/meta-preview-altspace-ui.html`). Renders the mock HTML approximation of whatever story is selected in Storybook. It checks for `BS` only to show a "detected" indicator — it never calls real BS APIs, even when BS is present. Good for iterating on story visuals without an Altspace client running.
- **`public/meta-preview-altspace-inject.js`** — the piece that actually **loads directly into Altspace**. A self-contained script, added via a `<script src="...">` tag directly in the Altspace world's own `index.html` (not viewed in a regular browser). It connects to the relay over WebSocket and, using the live `BS` API available inside the world, destroys its previous panel and reconstructs whichever story is currently selected as a real `BS.BanterUIPanel` with real `UILabel`/`UIButton`/`UISlider`/`UIToggle`/`UIScrollView`/`UIVisualElement` children, every time the selection changes.
- **`public/meta-preview-altspace-blockdrop-inject.js`** — a *third* file, needed only because `Organisms/BlockDrop` is a continuously-animating game that a per-selection snapshot rebuild fundamentally can't drive (see "Spawn/despawn lifecycle for an in-world game" below). Also a `<script src="...">` tag in the world's `index.html`, also connects to the relay — but only to know when to spawn and despawn, never to receive gameplay data. Once spawned, it runs its own self-contained game loop, completely independent of the relay, until despawned.

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

Stories follow atomic design: atoms → molecules → organisms — same set as `bantervr-ui`, plus `Block`/`Grid`/`BlockDrop` (unique to `altspace-ui`).

```
src/altspace-ui/
  atoms/
    Buttons.stories.js      — Button, ConfirmCancel, IconButton
    Labels.stories.js       — Label (all properties)
    Inputs.stories.js       — Slider, Toggle
    VisualElement.stories.js — VisualElement, FlexRow, FlexColumn, FlexWrap, Nested
    Block.stories.js        — a single coloured square; size + color controls
    components.js           — atom constructor functions (makeBlock, makeLabel, makeButton) — NOT stories, imported by molecule/organism stories
  molecules/
    ActionCard.stories.js   — title + description + button
    ButtonGroup.stories.js  — IconButton (emoji), ImageIconButton, ConfirmCancel
    Labels.stories.js       — Scoreboard, StatusBadge
    Sliders.stories.js      — SliderLabelled, SliderWithRange
    Toggles.stories.js      — ToggleLabelled, ToggleGroup
    ScrollView.stories.js   — VerticalList, HorizontalList, MixedContent
    SettingsPanel.stories.js — volume slider, brightness slider, music toggle, SFX toggle
    Grid.stories.js         — rows×cols grid of Block atoms; cellSize/gap/colours/pattern controls
    components.js           — molecule constructor functions (makeStatusBadge, makePlayerRow, makeToggleRow, makeSliderRow, makeGrid) — NOT stories, imported by organism stories
  organisms/
    GameLobby.stories.js    — full panel: status badge, player scroll list, music toggle, volume slider, action button
    BlockDrop.stories.js    — playable falling-block game; composed from Grid (board + next-piece preview) and the atom-level makeLabel/makeButton constructors
```

**The composition discipline** (what makes this "Storybookification" rather than just a component library): an organism should import and compose molecule constructors from `molecules/components.js`, which in turn compose atom constructors from `atoms/components.js` — not hand-roll `new BS.UIVisualElement()`/`UILabel()`/`UIButton()` calls inline. `GameLobby` and `BlockDrop` both follow this. If a molecule/organism story needs a UI pattern that doesn't exist yet, that's usually a sign it belongs in `components.js` as a new constructor (and often deserves its own atom/molecule story too, the way `Block`/`Grid` were pulled out of BlockDrop's original one-off implementation) — not another local, one-off helper duplicated inside a single story file.

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

## Spawn/despawn lifecycle for an in-world game (`meta-preview-altspace-blockdrop-inject.js`)

A continuously-animating, keyboard-controlled game can't be driven by the generic script's per-selection snapshot rebuild above — there's no "next frame" message, just one static tree per selection. The naive fix is to make the game's script fully standalone (build once on world load, run its own loop forever, never touch the relay again) — that's what this file originally did. The problem: without any connection to the relay, it has no way to know when a *different* story gets selected, so it never despawns — unlike every other story, which implicitly disappears via the generic script's destroy-then-rebuild cycle. Sitting in-world permanently regardless of what's selected isn't how any other story here behaves, and isn't what "select this story to see it" is supposed to mean.

The fix that keeps both properties (self-contained gameplay, *and* normal spawn/despawn-on-selection behaviour): connect to the relay, but **only as a lifecycle trigger**, never as a gameplay data source.

```js
const BLOCKDROP_KIND = 'Altspace-UI/Organisms/BlockDrop'; // must match the story's `title` exactly

ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type !== 'story-rendered') return;
  if (msg.kind === BLOCKDROP_KIND) spawn();  // no-op if already spawned
  else despawn();                            // no-op if not currently spawned
});
```
- Registers with the same `altspace-inject` relay role the generic script uses — no relay/server changes needed, it was already broadcasting to that role.
- `spawn()` calls the (unchanged) game-building code and keeps a handle to it; `despawn()` calls that handle's `stop()`, which clears the game's `setInterval` tick and `Destroy()`s its `GameObject`.
- Re-selecting the same story while already running is a no-op — it doesn't tear down and rebuild an in-progress game just because Storybook re-sent the same selection.

**Key-press routing.** The BS API doesn't document a way to remove a specific `scene.On('key-press', ...)` listener once added. Registering a fresh one on every spawn (without a matching way to remove the old one on despawn) would accumulate orphaned listeners across spawn/despawn cycles. Instead, register **one** router for the lifetime of the script, and have spawn/despawn swap a plain variable it forwards to:
```js
let currentKeyHandler = null;
scene.On('key-press', (e) => { if (currentKeyHandler) currentKeyHandler(e); }); // registered once

// spawn(): currentKeyHandler = <this game's handler>
// despawn(): currentKeyHandler = null — input is now inert, not an error
```

**Consequence worth knowing:** the panel now only ever appears after its story has been selected in Storybook at least once, with the relay running — it's no longer available if you load the world without the dev environment up, the way a truly offline-standalone script would be.

Verified with a harness that mocks `WebSocket` in addition to `BS` (the earlier build-only harness doesn't exercise this): unrelated selection → no spawn; matching selection → spawn with fresh elements; re-selecting while active → no-op (no rebuild, no destroy); different selection → exactly one `Destroy()` call; key-press after despawn → inert, not a throw; re-selecting after despawn → spawns again with a fresh instance.

### Opting a story out of the generic script's rebuild (`skipGenericInject`)

A story with its own dedicated lifecycle script (like BlockDrop above) is *still* a normal Storybook story, reachable by the generic `meta-preview-altspace-inject.js` pipeline the same as everything else. Left alone, selecting it fires **both**: the dedicated script's real spawn, and the generic script's usual per-selection static-snapshot rebuild — two panels in-world at once, one playable, one an inert duplicate. The generic script has no story-specific knowledge by design (that's what keeps it reusable across every setup here), so it can't special-case this itself.

The fix is an opt-out declared at the story, not a change to the generic script. `altspaceUiStory()` (`src/altspace-ui/story.js`) takes a second, optional options argument:

```js
altspaceUiStory((scene, BS) => { /* ... */ }, { skipGenericInject: true })
```

When `skipGenericInject` is true, the story simply never sets `window.__metaPreviewAltspaceUI`. `storybook-channel.js`'s existing fallback (unmodified) then sends a plain `html` payload instead of `altspaceUIData`/`altspaceUIHtml` for that story's `story-rendered` message — and the generic script's `if (msg.altspaceUIData)` check just doesn't match, so it builds nothing. `kind` is still sent regardless, so a dedicated lifecycle script's own spawn/despawn (which only ever looks at `kind`, per the pattern above) is unaffected. Default is `false`, so every other story's behaviour is unchanged.

**Use this whenever a story gets its own dedicated in-world script** — otherwise the two will always collide the way BlockDrop's did.

**Gotcha:** the generic script only destroys its own previously-built objects the next time it *matches* a different `altspaceUIData` story. If a static snapshot from before you add `skipGenericInject` is already sitting in-world, it won't self-clear just because the story stopped sending `altspaceUIData` — select any other generic-pipeline story once (e.g. `GameLobby`) to flush it.

### Sharing one in-world position instead of configuring two

Because a `skipGenericInject` story's dedicated script and the generic script are mutually exclusive (only one is ever actually showing a panel — never both), they should render in the *same* spot rather than each carrying its own independently-configured `position`/`rotation` `<script>` tag attribute that has to be kept in sync by hand — that duplication is exactly what caused the panel to visibly jump to the wrong place once the two configs drifted apart.

`meta-preview-altspace-blockdrop-inject.js` doesn't take `position`/`rotation` attributes on its own tag at all. Instead it looks up the generic script's `<script>` tag in the page (matched by path, so its own longer filename — `...altspace-blockdrop-inject.js` — can never accidentally match `...altspace-inject.js`) and reads position/rotation from there:

```js
function findMainInjectTag() {
  for (const s of document.querySelectorAll('script[src]')) {
    if (new URL(s.src).pathname.endsWith('/meta-preview-altspace-inject.js')) return s;
  }
  return null;
}
const positionSource = findMainInjectTag() || tag; // falls back to its own tag, then a hardcoded default
```

So a deployment only needs to set `position`/`rotation` once, on the generic script's tag:
```html
<script position="0 3.0 3" rotation="0 0 0" src=".../meta-preview-altspace-inject.js"></script>
<script scale="1 1 1" src=".../meta-preview-altspace-blockdrop-inject.js"></script>
```
`scale` is unaffected by this — it's still read from each script's own tag, since there's no reason the two would need to share a scale. Apply the same pattern to any future dedicated lifecycle script that uses `skipGenericInject`.

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

The Storybook mock's `UIButton` constructor also defaults `backgroundColor`/`borderWidth`/`borderColor`/`borderRadius`/`color` for free (a nice blue button, styled and readable, with zero code). The real `UIButton` has none of those defaults — confirmed by a live in-world test where a button that looked correct in Storybook rendered as flat Unity-grey with invisible text on real Altspace. Set all of these explicitly:
```js
btn.style.color           = '#ffffff';
btn.style.backgroundColor = 'rgba(50, 80, 180, 0.7)';
btn.style.borderWidth     = '1px';
btn.style.borderColor     = 'rgba(100, 140, 255, 0.4)';
btn.style.borderRadius    = '5px';
```
`makeButton()` in `atoms/components.js` already does this — use it rather than `new BS.UIButton()` directly, so this can't be forgotten again.

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

Confirmed by a live in-world test on `meta-preview-altspace-blockdrop-inject.js`: `el.SetProperty(BS.PN.text, value)` does not render — the label/button exists and is sized/styled correctly, but the text is invisible. Set it as a direct property instead:
```js
// Correct — matches bantervr-ui-test.js and the working meta-preview-*-inject.js scripts
label.text = 'Hello';
// Wrong — silently renders no text on real Altspace (docs show this form, but it doesn't work)
label.SetProperty(BS.PN.text, 'Hello');
```
This only bit a *standalone* in-world script that calls `panel.CreateLabel`/`CreateButton` directly — story authoring (via the mock `BS`) and the generic `meta-preview-altspace-inject.js` pipeline were never affected, since the generic inject script's `buildElement()` already special-cases the `text` property this same correct way (`if (k === 'text') el.text = v; else el.SetProperty(...)`) when translating a story's serialized properties into real BS calls.

### `select` control argType — `options` goes at the top level, not inside `control`

This is a Storybook argType shape issue, not a BS/Altspace one, but it's easy to copy the broken form from an existing story since several already had it (`GameLobby.stories.js` here, plus others across `bantervr-ui`/`tui`/`sdf2d`). The addon logs `Select with no options` and the dropdown renders empty:
```js
// Wrong — options nested under control; dropdown has no options
const select = (...options) => ({ control: { type: 'select', options } });
// Correct — options at the top level of the argType
const select = (...options) => ({ control: { type: 'select' }, options });
```
`Molecules/Grid.stories.js`'s `pattern` control and `GameLobby.stories.js`'s `status` control were both fixed to the correct form. This is the same class of bug the CHANGELOG already documents being fixed once before, for `sdf3d`'s `displayArgType` — worth checking any *other* `select(...)` helper in this repo before copying it as a reference.

### Grid cell spacing — avoid a 1px `marginRight`/`marginBottom` gap

Confirmed live in-world on `Molecules/Grid`'s board and next-piece preview: with every cell given an identical `1px` gap, some cells rendered with a visible gap and some didn't — never reproducible in the browser mock, and confirmed via `git diff` against a pre-existing commit that the construction code itself was unchanged, ruling out a logic bug. The likely cause is sub-pixel rounding: on a world-space panel scaled to fit a 3D quad, a `1px` USS value doesn't necessarily land on a clean physical pixel, so it can round to 0 or 1 inconsistently depending on each cell's cumulative position.
```js
// Risky — 1px is close enough to a rounding boundary to render inconsistently in-world
cell.style.marginRight = '1px';
// Safer — far enough from the boundary to render consistently
cell.style.marginRight = '2px';
```
`Organisms/BlockDrop`'s `gap` now defaults to `2` (both the Storybook control and the inject script's `gap` attribute) rather than a hardcoded `1`. `Molecules/Grid.stories.js` still defaults to `1` since it's browser-preview-only and never rendered in-world — but treat any *other* tightly-packed grid built for in-world use the same way.

### Font glyph coverage — stick to the basic Arrows block for icon-style button text

Confirmed live in-world: `⟲`/`⟳` (U+27F2/U+27F3, Supplemental Arrows-A) rendered as tofu boxes (missing-glyph placeholders) on `Organisms/BlockDrop`'s Rotate buttons, while `←`/`→`/`↺`/`↻` (U+2190/U+2192/U+21BA/U+21BB, the basic Arrows block, U+2190–U+21FF) rendered correctly on the same panel. Altspace's font doesn't cover the more obscure Unicode blocks that a desktop browser's font stack happily falls back through — this only showed up in-world, never in the Storybook/browser preview. Stick to well-known, heavily-used codepoints (basic Latin, basic arrows, common punctuation) for any button/label text meant to render in-world; treat anything from a more obscure block as unverified until tested live.

### A panel's resolution is fixed at construction — give every label an explicit height

A `BanterUIPanel`'s resolution (`new BS.Vector2(panelWidth, panelHeight)`) is set once at construction and can never resize to fit content afterward. If you compute that height by estimating how tall your labels/elements will render — either because a label starts empty and gets text later, or just because you guessed a font's line-height — any mismatch between your guess and what Unity actually measures shows up as visible squishing somewhere in the layout, since flex items shrink under space pressure by default and there's no way for the panel to grow and self-correct. Confirmed live in-world on `Organisms/BlockDrop` twice, from two different causes:
- **Empty-then-populated content.** The status label starts empty during normal play and gets "GAME OVER"/"PAUSED" text later via a separate update call. If its real measured height differs between empty and populated on the real client, the panel was sized for the wrong one.
- **A hand-estimated height budget that was simply too tight.** The next-piece preview always has content, so it wasn't subject to the above — but the sidebar's total estimated height was only a few px under the board's, leaving almost no slack for the label-height guesses in that estimate to be even slightly wrong.

Neither reproduces in the browser mock, which reflows the DOM dynamically and has no fixed-panel constraint at all.
```js
// Risky — height is left to auto-size from content, which may not match what
// Unity actually measures, and can change size later if text is set after creation
const statusLabel = makeLabel(BS, '', { fontSize: 13, color: '#fbbf24' });
// Safer — explicit height makes its layout footprint constant, matching what
// any height budget elsewhere (e.g. a panel resolution calculation) assumed
const statusLabel = makeLabel(BS, '', { fontSize: 13, color: '#fbbf24' });
statusLabel.style.height = '16px';
```
`BlockDrop.stories.js` and the inject script both give every label/wrapper that feeds into their panel-height calculation an explicit height, using one set of named constants (`TITLE_HEIGHT`, `STATS_HEIGHT`, `NEXT_LABEL_HEIGHT`, `STATUS_HEIGHT`, `HINT_HEIGHT`, `BUTTON_HEIGHT`) shared between the budget math and the elements themselves, plus a flat safety margin on top — so the two can't silently drift apart again, and there's slack for the estimates that are still guesses (fonts' real line-height isn't knowable from JS). If a panel's layout ever looks squeezed, check whether every element feeding its height budget has an explicit height, and whether that budget has any safety margin at all.

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

- The generic `meta-preview-altspace-inject.js` itself (the panel-reconstruction pipeline every regular story uses) is now confirmed live in-world — it's what built the second, inert BlockDrop copy that led to the `skipGenericInject` fix above, so it does successfully reconstruct panels on real Altspace. Still worth re-checking against a non-BlockDrop story (e.g. `GameLobby`) to confirm the ordinary case looks right too, since that hasn't been screenshotted live yet.
