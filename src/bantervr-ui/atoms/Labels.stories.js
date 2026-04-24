import { banterUiStory } from '../story.js';

export default { title: 'BanterVR-UI/Atoms/Labels' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });
const select = (...options)          => ({ control: { type: 'select', options } });

// ─── Label (all properties) ───────────────────────────────────────────────────

export const Label = {
  args: {
    text:         'Hello, BanterVR',
    panelWidth:   480,
    panelHeight:  80,
    fontSize:     24,
    color:        '#ffffff',
    whiteSpace:   'normal',
    textOverflow: 'clip',
    letterSpacing: 0,
    opacity:      1,
  },
  argTypes: {
    text:          { control: 'text' },
    panelWidth:    range(100, 800, 20),
    panelHeight:   range(40, 400, 20),
    fontSize:      range(8, 72, 2),
    color:         { control: 'color' },
    whiteSpace:    select('normal', 'nowrap'),
    textOverflow:  select('clip', 'ellipsis'),
    letterSpacing: range(0, 20, 1),
    opacity:       range(0, 1, 0.05),
  },
  render: ({
    text, panelWidth, panelHeight, fontSize, color,
    whiteSpace, textOverflow, letterSpacing, opacity,
  }) => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'Label' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width         = '100%';
    panel.root.style.height        = '100%';
    panel.root.style.paddingTop    = '8px';
    panel.root.style.paddingRight  = '8px';
    panel.root.style.paddingBottom = '8px';
    panel.root.style.paddingLeft   = '8px';

    const label = new BS.UILabel();
    label.SetProperty(BS.PN.text, text);
    label.style.width         = '100%';
    label.style.height        = '100%';
    label.style.fontSize      = `${fontSize}px`;
    label.style.color         = color;
    label.style.whiteSpace    = whiteSpace;
    label.style.textOverflow  = textOverflow;
    label.style.letterSpacing = `${letterSpacing}px`;
    label.style.opacity       = opacity;
    panel.root.AppendChild(label);
    return obj;
  }),
};
