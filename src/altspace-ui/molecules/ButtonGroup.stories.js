import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Molecules/ButtonGroup' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Icon Button ──────────────────────────────────────────────────────────────
// Molecule: UIVisualElement (button shell) + UILabel (icon) + UILabel (text).
// Independent size and colour controls for icon vs. label text.

export const IconButton = {
  args: {
    icon:            '⚙',
    label:           'Settings',
    panelWidth:      280,
    panelHeight:     80,
    width:           220,
    height:          52,
    iconSize:        24,
    labelSize:       16,
    iconColor:       '#5b9fff',
    labelColor:      '#ffffff',
    backgroundColor: '#3250b4',
    borderColor:     '#647fff',
    borderWidth:     1,
    borderRadius:    5,
    iconSpacing:     10,
  },
  argTypes: {
    icon:            { control: 'text' },
    label:           { control: 'text' },
    panelWidth:      range(100, 600, 20),
    panelHeight:     range(40, 200, 10),
    width:           range(80, 500, 4),
    height:          range(32, 120, 4),
    iconSize:        range(10, 48, 2),
    labelSize:       range(10, 36, 2),
    iconColor:       { control: 'color' },
    labelColor:      { control: 'color' },
    backgroundColor: { control: 'color' },
    borderColor:     { control: 'color' },
    borderWidth:     range(0, 12, 1),
    borderRadius:    range(0, 40, 1),
    iconSpacing:     range(0, 40, 2),
  },
  render: ({
    icon, label, panelWidth, panelHeight, width, height,
    iconSize, labelSize, iconColor, labelColor,
    backgroundColor, borderColor, borderWidth, borderRadius, iconSpacing,
  }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'IconButton' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';

    const btn = new BS.UIVisualElement();
    btn.style.width           = `${width}px`;
    btn.style.height          = `${height}px`;
    btn.style.backgroundColor = backgroundColor;
    btn.style.borderColor     = borderColor;
    btn.style.borderWidth     = `${borderWidth}px`;
    btn.style.borderRadius    = `${borderRadius}px`;
    btn.style.display         = 'flex';
    btn.style.flexDirection   = 'row';
    btn.style.alignItems      = 'center';
    btn.style.justifyContent  = 'center';

    const iconLbl = new BS.UILabel();
    iconLbl.SetProperty(BS.PN.text, icon);
    iconLbl.style.fontSize    = `${iconSize}px`;
    iconLbl.style.color       = iconColor;
    iconLbl.style.marginRight = `${iconSpacing}px`;

    const textLbl = new BS.UILabel();
    textLbl.SetProperty(BS.PN.text, label);
    textLbl.style.fontSize = `${labelSize}px`;
    textLbl.style.color    = labelColor;

    btn.AppendChild(iconLbl);
    btn.AppendChild(textLbl);
    panel.root.AppendChild(btn);
    return obj;
  }),
};

// ─── Image Icon Button ────────────────────────────────────────────────────────
// KNOWN LIMITATION: backgroundImage does not render in BanterVR.
// Unity UI Toolkit requires a Sprite/Texture2D asset reference — runtime HTTPS
// URL strings are not supported via USS. Story kept as a reference/test case.

export const ImageIconButton = {
  args: {
    imageUrl:        `http://${typeof location !== 'undefined' ? location.hostname : 'localhost'}:${process.env.STORYBOOK_RELAY_PORT || 3338}/images/icon-gear.png`,
    label:           'Settings',
    panelWidth:      280,
    panelHeight:     80,
    width:           220,
    height:          52,
    iconSize:        28,
    labelSize:       16,
    labelColor:      '#ffffff',
    backgroundColor: '#3250b4',
    borderColor:     '#647fff',
    borderWidth:     1,
    borderRadius:    5,
    iconSpacing:     10,
  },
  argTypes: {
    imageUrl:        { control: 'text' },
    label:           { control: 'text' },
    panelWidth:      range(100, 600, 20),
    panelHeight:     range(40, 200, 10),
    width:           range(80, 500, 4),
    height:          range(32, 120, 4),
    iconSize:        range(12, 64, 4),
    labelSize:       range(10, 36, 2),
    labelColor:      { control: 'color' },
    backgroundColor: { control: 'color' },
    borderColor:     { control: 'color' },
    borderWidth:     range(0, 12, 1),
    borderRadius:    range(0, 40, 1),
    iconSpacing:     range(0, 40, 2),
  },
  render: ({
    imageUrl, label, panelWidth, panelHeight, width, height,
    iconSize, labelSize, labelColor,
    backgroundColor, borderColor, borderWidth, borderRadius, iconSpacing,
  }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ImageIconButton' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';

    const btn = new BS.UIVisualElement();
    btn.style.width           = `${width}px`;
    btn.style.height          = `${height}px`;
    btn.style.backgroundColor = backgroundColor;
    btn.style.borderColor     = borderColor;
    btn.style.borderWidth     = `${borderWidth}px`;
    btn.style.borderRadius    = `${borderRadius}px`;
    btn.style.display         = 'flex';
    btn.style.flexDirection   = 'row';
    btn.style.alignItems      = 'center';
    btn.style.justifyContent  = 'center';

    const iconBox = new BS.UIVisualElement();
    iconBox.style.width               = `${iconSize}px`;
    iconBox.style.height              = `${iconSize}px`;
    iconBox.style.backgroundImage     = `url('${imageUrl}')`;
    iconBox.style.backgroundSize      = 'contain';
    iconBox.style.backgroundRepeat    = 'no-repeat';
    iconBox.style.backgroundPosition  = 'center';
    iconBox.style.marginRight         = `${iconSpacing}px`;

    const textLbl = new BS.UILabel();
    textLbl.SetProperty(BS.PN.text, label);
    textLbl.style.fontSize = `${labelSize}px`;
    textLbl.style.color    = labelColor;

    btn.AppendChild(iconBox);
    btn.AppendChild(textLbl);
    panel.root.AppendChild(btn);
    return obj;
  }),
};

// ─── Confirm / Cancel ─────────────────────────────────────────────────────────

export const ConfirmCancel = {
  args: {
    confirmLabel:  'Confirm',
    cancelLabel:   'Cancel',
    panelWidth:    380,
    panelHeight:   80,
    buttonWidth:   160,
    buttonHeight:  48,
    fontSize:      18,
    spacing:       16,
    confirmBg:     '#1a5c38',
    confirmBorder: '#52e08a',
    confirmColor:  '#52e08a',
    cancelBg:      '#5c1a28',
    cancelBorder:  '#e05265',
    cancelColor:   '#e05265',
  },
  argTypes: {
    confirmLabel:  { control: 'text' },
    cancelLabel:   { control: 'text' },
    panelWidth:    range(200, 600, 20),
    panelHeight:   range(40, 200, 10),
    buttonWidth:   range(60, 300, 4),
    buttonHeight:  range(24, 120, 4),
    fontSize:      range(8, 48, 2),
    spacing:       range(0, 60, 4),
    confirmBg:     { control: 'color' },
    confirmBorder: { control: 'color' },
    confirmColor:  { control: 'color' },
    cancelBg:      { control: 'color' },
    cancelBorder:  { control: 'color' },
    cancelColor:   { control: 'color' },
  },
  render: ({
    confirmLabel, cancelLabel, panelWidth, panelHeight,
    buttonWidth, buttonHeight, fontSize, spacing,
    confirmBg, confirmBorder, confirmColor,
    cancelBg, cancelBorder, cancelColor,
  }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ConfirmCancel' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'row';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';

    const confirm = new BS.UIButton();
    confirm.SetProperty(BS.PN.text, confirmLabel);
    confirm.style.width           = `${buttonWidth}px`;
    confirm.style.height          = `${buttonHeight}px`;
    confirm.style.fontSize        = `${fontSize}px`;
    confirm.style.backgroundColor = confirmBg;
    confirm.style.borderColor     = confirmBorder;
    confirm.style.color           = confirmColor;
    confirm.style.marginRight     = `${spacing}px`;

    const cancel = new BS.UIButton();
    cancel.SetProperty(BS.PN.text, cancelLabel);
    cancel.style.width           = `${buttonWidth}px`;
    cancel.style.height          = `${buttonHeight}px`;
    cancel.style.fontSize        = `${fontSize}px`;
    cancel.style.backgroundColor = cancelBg;
    cancel.style.borderColor     = cancelBorder;
    cancel.style.color           = cancelColor;

    panel.root.AppendChild(confirm);
    panel.root.AppendChild(cancel);
    return obj;
  }),
};
