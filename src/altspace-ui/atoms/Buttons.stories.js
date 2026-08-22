import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Atoms/Buttons' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Button (all properties) ──────────────────────────────────────────────────

export const Button = {
  args: {
    label:           'Click Me',
    panelWidth:      280,
    panelHeight:     80,
    width:           200,
    height:          52,
    fontSize:        18,
    color:           '#ffffff',
    backgroundColor: '#3250b4',
    borderColor:     '#647fff',
    borderWidth:     1,
    borderRadius:    5,
    paddingH:        0,
    paddingV:        0,
    opacity:         1,
  },
  argTypes: {
    label:           { control: 'text' },
    panelWidth:      range(100, 600, 20),
    panelHeight:     range(40, 200, 10),
    width:           range(60, 500, 4),
    height:          range(24, 160, 4),
    fontSize:        range(8, 48, 2),
    color:           { control: 'color' },
    backgroundColor: { control: 'color' },
    borderColor:     { control: 'color' },
    borderWidth:     range(0, 12, 1),
    borderRadius:    range(0, 40, 1),
    paddingH:        range(0, 80, 4),
    paddingV:        range(0, 60, 4),
    opacity:         range(0, 1, 0.05),
  },
  render: ({
    label, panelWidth, panelHeight, width, height, fontSize,
    color, backgroundColor, borderColor, borderWidth, borderRadius,
    paddingH, paddingV, opacity,
  }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'Button' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display        = 'flex';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';

    const btn = new BS.UIButton();
    btn.SetProperty(BS.PN.text, label);
    btn.style.width           = `${width}px`;
    btn.style.height          = `${height}px`;
    btn.style.fontSize        = `${fontSize}px`;
    btn.style.color           = color;
    btn.style.backgroundColor = backgroundColor;
    btn.style.borderColor     = borderColor;
    btn.style.borderWidth     = `${borderWidth}px`;
    btn.style.borderRadius    = `${borderRadius}px`;
    btn.style.paddingLeft     = `${paddingH}px`;
    btn.style.paddingRight    = `${paddingH}px`;
    btn.style.paddingTop      = `${paddingV}px`;
    btn.style.paddingBottom   = `${paddingV}px`;
    btn.style.opacity         = opacity;
    panel.root.AppendChild(btn);
    return obj;
  }),
};


// ─── Icon Button ──────────────────────────────────────────────────────────────

export const IconButton = {
  args: { icon: '⚙', label: 'Settings', fontSize: 18, width: 190, height: 52 },
  argTypes: {
    icon:     { control: 'text' },
    label:    { control: 'text' },
    fontSize: range(10, 36, 2),
    width:    range(80, 400, 4),
    height:   range(32, 120, 4),
  },
  render: ({ icon, label, fontSize, width, height }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'IconButton' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(width + 40, height + 24) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display        = 'flex';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';

    const btn = new BS.UIButton();
    btn.SetProperty(BS.PN.text, `${icon}  ${label}`);
    btn.style.width    = `${width}px`;
    btn.style.height   = `${height}px`;
    btn.style.fontSize = `${fontSize}px`;
    panel.root.AppendChild(btn);
    return obj;
  }),
};
