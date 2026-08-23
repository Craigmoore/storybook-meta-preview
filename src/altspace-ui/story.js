import { MockBS } from './mock-bs.js';

// skipGenericInject: for a story that has its own dedicated in-world script
// (own spawn/despawn lifecycle, own relay connection — e.g. BlockDrop's
// meta-preview-altspace-blockdrop-inject.js), letting the generic
// meta-preview-altspace-inject.js ALSO reconstruct a static snapshot of it
// produces a second, non-interactive copy in-world alongside the real,
// dedicated one every time that story is selected. Not setting
// window.__metaPreviewAltspaceUI lets storybook-channel.js's existing
// fallback branch send a plain `html` payload instead of `altspaceUIData` —
// the generic inject script only reacts to the latter, so it simply has
// nothing to build for this story. The dedicated script's own spawn/despawn
// only ever looks at `kind`, never `altspaceUIData`, so it's unaffected.
// This keeps the generic script itself completely unmodified/story-agnostic
// — the opt-out is declared at the story that needs it, not hardcoded
// anywhere shared.
export function altspaceUiStory(renderFn, { skipGenericInject = false } = {}) {
  const result  = renderFn({}, MockBS);
  const objects = Array.isArray(result) ? result : [result];

  const wrapper = document.createElement('div');
  wrapper.className = 'altspace-ui-preview';
  for (const obj of objects) {
    if (obj?._el) wrapper.appendChild(obj._el);
  }

  if (!skipGenericInject) {
    const sceneData = { objects: objects.map(o => o.toJSON?.()).filter(Boolean) };
    window.__metaPreviewAltspaceUI = { sceneData };
  }
  return wrapper;
}
