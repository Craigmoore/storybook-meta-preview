// Molecule constructor functions — return UI elements, not full panels.
// Import these in organism stories to compose molecules cleanly.

export function makeStatusBadge(BS, status, theme) {
  const badge = new BS.UIVisualElement();
  badge.style.display         = 'flex';
  badge.style.flexDirection   = 'row';
  badge.style.alignItems      = 'center';
  badge.style.alignSelf       = 'flex-start';
  badge.style.backgroundColor = theme.bg;
  badge.style.borderRadius    = '4px';
  badge.style.paddingTop      = '5px';
  badge.style.paddingRight    = '12px';
  badge.style.paddingBottom   = '5px';
  badge.style.paddingLeft     = '12px';
  const lbl = new BS.UILabel();
  lbl.SetProperty(BS.PN.text, status);
  lbl.style.fontSize      = '13px';
  lbl.style.color         = theme.text;
  lbl.style.letterSpacing = '1px';
  badge.AppendChild(lbl);
  return badge;
}

export function makePlayerRow(BS, index, name) {
  const row = new BS.UIVisualElement();
  row.style.display           = 'flex';
  row.style.flexDirection     = 'row';
  row.style.alignItems        = 'center';
  row.style.height            = '36px';
  row.style.paddingLeft       = '10px';
  row.style.paddingRight      = '10px';
  row.style.backgroundColor   = index % 2 === 0 ? '#14172a' : '#10121c';
  row.style.borderBottomColor = '#2a2d40';
  row.style.borderBottomWidth = '1px';
  const numLbl = new BS.UILabel();
  numLbl.SetProperty(BS.PN.text, `${index + 1}`);
  numLbl.style.fontSize    = '12px';
  numLbl.style.color       = '#555577';
  numLbl.style.width       = '20px';
  numLbl.style.marginRight = '8px';
  const nameLbl = new BS.UILabel();
  nameLbl.SetProperty(BS.PN.text, name);
  nameLbl.style.fontSize = '15px';
  nameLbl.style.color    = '#ffffff';
  row.AppendChild(numLbl);
  row.AppendChild(nameLbl);
  return row;
}

export function makeToggleRow(BS, label, checked) {
  const row = new BS.UIVisualElement();
  row.style.display        = 'flex';
  row.style.flexDirection  = 'row';
  row.style.alignItems     = 'center';
  row.style.justifyContent = 'space-between';
  const lbl = new BS.UILabel();
  lbl.SetProperty(BS.PN.text, label);
  lbl.style.fontSize = '15px';
  lbl.style.color    = '#cccccc';
  const toggle = new BS.UIToggle();
  toggle.SetChecked(checked);
  toggle.style.width  = '40px';
  toggle.style.height = '20px';
  row.AppendChild(lbl);
  row.AppendChild(toggle);
  return row;
}

export function makeSliderRow(BS, label, min, max, value, labelWidth = '70px') {
  const row = new BS.UIVisualElement();
  row.style.display        = 'flex';
  row.style.flexDirection  = 'row';
  row.style.alignItems     = 'center';
  row.style.justifyContent = 'space-between';
  const lbl = new BS.UILabel();
  lbl.SetProperty(BS.PN.text, label);
  lbl.style.fontSize = '15px';
  lbl.style.color    = '#cccccc';
  lbl.style.width    = labelWidth;
  const slider = new BS.UISlider();
  slider.SetRange(min, max);
  slider.SetValue(value);
  slider.style.width  = '240px';
  slider.style.height = '20px';
  row.AppendChild(lbl);
  row.AppendChild(slider);
  return row;
}
