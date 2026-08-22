import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Molecules/Labels' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Scoreboard ───────────────────────────────────────────────────────────────

export const Scoreboard = {
  args: { heading: 'Score', value: '9,999', headingSize: 18, valueSize: 48 },
  argTypes: {
    heading:     { control: 'text' },
    value:       { control: 'text' },
    headingSize: range(8, 36, 2),
    valueSize:   range(16, 96, 4),
  },
  render: ({ heading, value, headingSize, valueSize }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'Scoreboard' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(280, 140) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'column';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';

    const h = new BS.UILabel();
    h.SetProperty(BS.PN.text, heading);
    h.style.fontSize      = `${headingSize}px`;
    h.style.color         = '#aaaaaa';
    h.style.letterSpacing = '2px';
    h.style.marginBottom  = '4px';

    const v = new BS.UILabel();
    v.SetProperty(BS.PN.text, value);
    v.style.fontSize = `${valueSize}px`;
    v.style.color    = '#ffffff';

    panel.root.AppendChild(h);
    panel.root.AppendChild(v);
    return obj;
  }),
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

export const StatusBadge = {
  args: { text: 'ONLINE', bgColor: '#1a6b3c', textColor: '#52e08a', fontSize: 16 },
  argTypes: {
    text:      { control: 'text' },
    bgColor:   { control: 'color' },
    textColor: { control: 'color' },
    fontSize:  range(8, 36, 2),
  },
  render: ({ text, bgColor, textColor, fontSize }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'StatusBadge' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(200, 50) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';

    const badge = new BS.UIVisualElement();
    badge.style.backgroundColor = bgColor;
    badge.style.borderRadius    = '4px';
    badge.style.paddingTop      = '4px';
    badge.style.paddingRight    = '14px';
    badge.style.paddingBottom   = '4px';
    badge.style.paddingLeft     = '14px';
    badge.style.display         = 'flex';
    badge.style.alignItems      = 'center';

    const lbl = new BS.UILabel();
    lbl.SetProperty(BS.PN.text, text);
    lbl.style.fontSize      = `${fontSize}px`;
    lbl.style.color         = textColor;
    lbl.style.letterSpacing = '1px';

    badge.AppendChild(lbl);
    panel.root.AppendChild(badge);
    return obj;
  }),
};
