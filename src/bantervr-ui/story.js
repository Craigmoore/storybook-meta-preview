import { MockBS } from './mock-bs.js';

export function banterUiStory(renderFn) {
  const result  = renderFn({}, MockBS);
  const objects = Array.isArray(result) ? result : [result];

  const wrapper = document.createElement('div');
  wrapper.className = 'bantervr-ui-preview';
  for (const obj of objects) {
    if (obj?._el) wrapper.appendChild(obj._el);
  }

  const sceneData = { objects: objects.map(o => o.toJSON?.()).filter(Boolean) };
  window.__metaPreviewBanterUI = { sceneData };
  return wrapper;
}
