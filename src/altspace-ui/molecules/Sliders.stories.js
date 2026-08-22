import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Molecules/Sliders' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Slider: With Label ───────────────────────────────────────────────────────

export const SliderLabelled = {
  args: { label: 'Volume', min: 0, max: 100, value: 70 },
  argTypes: {
    label: { control: 'text' },
    min:   range(0, 100),
    max:   range(0, 100),
    value: range(0, 100),
  },
  render: ({ label, min, max, value }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'SliderLabelled' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(400, 90) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'column';
    panel.root.style.paddingTop      = '12px';
    panel.root.style.paddingRight    = '20px';
    panel.root.style.paddingBottom   = '12px';
    panel.root.style.paddingLeft     = '20px';

    const row = new BS.UIVisualElement();
    row.style.display        = 'flex';
    row.style.flexDirection  = 'row';
    row.style.alignItems     = 'center';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom   = '6px';

    const lbl = new BS.UILabel();
    lbl.SetProperty(BS.PN.text, label);
    lbl.style.fontSize = '16px';
    lbl.style.color    = '#cccccc';

    const val = new BS.UILabel();
    val.SetProperty(BS.PN.text, String(value));
    val.style.fontSize = '16px';
    val.style.color    = '#ffffff';

    row.AppendChild(lbl);
    row.AppendChild(val);

    const slider = new BS.UISlider();
    slider.SetRange(min, max);
    slider.SetValue(value);
    slider.style.width = '100%';

    panel.root.AppendChild(row);
    panel.root.AppendChild(slider);
    return obj;
  }),
};

// ─── Slider: Range Display ────────────────────────────────────────────────────

export const SliderWithRange = {
  args: { min: 0, max: 200, value: 80 },
  argTypes: {
    min:   range(0, 200),
    max:   range(0, 200),
    value: range(0, 200),
  },
  render: ({ min, max, value }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'SliderWithRange' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(400, 80) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'column';
    panel.root.style.paddingTop      = '10px';
    panel.root.style.paddingRight    = '20px';
    panel.root.style.paddingBottom   = '10px';
    panel.root.style.paddingLeft     = '20px';

    const slider = new BS.UISlider();
    slider.SetRange(min, max);
    slider.SetValue(value);
    slider.style.width        = '100%';
    slider.style.marginBottom = '6px';

    const labels = new BS.UIVisualElement();
    labels.style.display        = 'flex';
    labels.style.flexDirection  = 'row';
    labels.style.justifyContent = 'space-between';

    const minLbl = new BS.UILabel();
    minLbl.SetProperty(BS.PN.text, String(min));
    minLbl.style.fontSize = '12px';
    minLbl.style.color    = '#888888';

    const maxLbl = new BS.UILabel();
    maxLbl.SetProperty(BS.PN.text, String(max));
    maxLbl.style.fontSize = '12px';
    maxLbl.style.color    = '#888888';

    labels.AppendChild(minLbl);
    labels.AppendChild(maxLbl);

    panel.root.AppendChild(slider);
    panel.root.AppendChild(labels);
    return obj;
  }),
};
