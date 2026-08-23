// Atom constructor functions — return UI elements, not full panels.
// Import these in molecule/organism stories to compose atoms cleanly
// (mirrors the pattern in molecules/components.js one layer up).

export function makeBlock(BS, { size = 16, color = '#666666' } = {}) {
  const block = new BS.UIVisualElement();
  block.style.width           = `${size}px`;
  block.style.height          = `${size}px`;
  block.style.backgroundColor = color;
  return block;
}

export function makeLabel(BS, text, { fontSize = 14, color = '#ffffff', backgroundColor = 'rgba(0,0,0,0)' } = {}) {
  const label = new BS.UILabel();
  label.SetProperty(BS.PN.text, text);
  label.style.fontSize        = `${fontSize}px`;
  label.style.color           = color;
  label.style.backgroundColor = backgroundColor;
  return label;
}

// backgroundColor/border/color are set explicitly rather than left to
// default — the Storybook mock's UIButton constructor defaults these for
// free, but the real Altspace UIButton has no such default (confirmed by a
// live in-world test — see docs/setup-altspace-ui.md), so relying on the
// mock default here would look right in preview and wrong in-world.
export function makeButton(BS, text, onClick, { fontSize = 16 } = {}) {
  const btn = new BS.UIButton();
  btn.SetProperty(BS.PN.text, text);
  btn.style.fontSize        = `${fontSize}px`;
  btn.style.color           = '#ffffff';
  btn.style.backgroundColor = 'rgba(50, 80, 180, 0.7)';
  btn.style.borderWidth     = '1px';
  btn.style.borderColor     = 'rgba(100, 140, 255, 0.4)';
  btn.style.borderRadius    = '5px';
  if (onClick) btn.OnClick(onClick);
  return btn;
}
