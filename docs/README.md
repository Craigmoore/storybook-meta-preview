# Docs

Reference material for developing stories and meta-previews in this project. Intended as a self-contained reference — a developer (or future Claude session) should be able to build any setup without leaving this folder.

---

## Project Architecture

- **`storybook-setup.md`** — How the project works: named-setup convention, relay architecture, storybook-channel, story file format, how to add a new setup.

---

## Setup References

One file per named setup — purpose, ports, story format, meta-preview behaviour.

| File | Setup | Status |
|---|---|---|
| `setup-html.md` | html | ✅ done |
| `setup-threejs-2d.md` | threejs-2d | 🔲 planned |
| `setup-threejs-3d.md` | threejs-3d | 🔲 planned |
| `setup-audio.md` | audio | 🔲 planned |
| `setup-openbrush.md` | openbrush | 🔲 planned |
| `setup-bantervr-ui.md` | bantervr-ui | 🔲 planned |
| `setup-bantervr-3d.md` | bantervr-3d | 🔲 planned |

---

## SDK References

API references for every external library used across setups.

| File | Library | Used by |
|---|---|---|
| `sdk-threejs.md` | Three.js | threejs-2d, threejs-3d |
| `sdk-tonejs.md` | Tone.js | audio |
| `sdk-tonaljs.md` | Tonal.js | audio |
| `sdk-openbrush.md` | Open Brush HTTP API | openbrush |
| `sdk-banter.md` | BanterVR SDK | bantervr-ui, bantervr-3d |
