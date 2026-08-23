# Docs

Reference material for developing stories and meta-previews in this project. Intended as a self-contained reference — a developer (or future Claude session) should be able to build any setup without leaving this folder.

---

## Project Architecture

- **`storybook-setup.md`** — How the project works: named-setup convention, relay architecture, storybook-channel, story file format, how to add a new setup.
- **`story-hierarchy-audit.md`** — Per-setup configuration summary, story hierarchy, and dependency trees for molecules/organisms, verifying each is at the correct atomic-design level.

---

## Setup References

One file per named setup — purpose, ports, story format, meta-preview behaviour. Status reflects whether the doc file itself has been written, not whether the setup's code exists (every setup in `setups.js` is implemented and runnable regardless of doc status).

| File | Setup | Status |
|---|---|---|
| `setup-html.md` | html | ✅ done |
| `setup-threejs-2d.md` | threejs-2d | ✅ done |
| `setup-threejs-3d.md` | threejs-3d | ✅ done |
| `setup-audio.md` | audio | ✅ done |
| `setup-openbrush.md` | openbrush | ✅ done |
| `setup-bantervr-ui.md` | bantervr-ui | ✅ done |
| `setup-bantervr-3d.md` | bantervr-3d | ✅ done |
| `setup-tui.md` | tui | ✅ done |
| `setup-altspace-ui.md` | altspace-ui | ✅ done |
| `setup-altspace-3d.md` | altspace-3d | ✅ done |
| `setup-sdf2d.md` | sdf2d | 🔲 not written — see the `sdf2d` section in the top-level README instead |
| `setup-sdf3d.md` | sdf3d | 🔲 not written — see the `sdf3d` section in the top-level README instead |

---

## SDK References

API references for every external library used across setups.

| File | Library | Used by |
|---|---|---|
| `sdk-threejs.md` | Three.js | threejs-2d, threejs-3d |
| `sdk-tonejs.md` | Tone.js | audio |
| `sdk-tonaljs.md` | Tonal.js | audio |
| `sdk-openbrush.md` | Open Brush HTTP API | openbrush |
| `sdk-banter.md` | BanterVR SDK | bantervr-ui, bantervr-3d, altspace-ui, altspace-3d |
| `unity-uitoolkit.md` | Unity UI Toolkit (`UnityEngine.UIElements`) | bantervr-ui, bantervr-3d, altspace-ui (underlies the BanterUI panel system) |
