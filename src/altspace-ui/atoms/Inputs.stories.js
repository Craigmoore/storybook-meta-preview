import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Atoms/Inputs' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Slider (all properties) ──────────────────────────────────────────────────

export const Slider = {
  args: { min: 0, max: 100, value: 50, width: 360, height: 20 },
  argTypes: {
    min:    range(0, 200),
    max:    range(0, 200),
    value:  range(0, 200),
    width:  range(60, 600, 10),
    height: range(10, 80, 2),
  },
  render: ({ min, max, value, width, height }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'Slider' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(width + 40, height + 40) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display        = 'flex';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';

    const slider = new BS.UISlider();
    slider.SetRange(min, max);
    slider.SetValue(value);
    slider.style.width  = `${width}px`;
    slider.style.height = `${height}px`;
    panel.root.AppendChild(slider);
    return obj;
  }),
};

// ─── Toggle (all properties) ──────────────────────────────────────────────────

export const Toggle = {
  args: { checked: true, width: 40, height: 20 },
  argTypes: {
    checked: { control: 'boolean' },
    width:   range(20, 120, 4),
    height:  range(10, 60, 2),
  },
  render: ({ checked, width, height }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'Toggle' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(width + 40, height + 40) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display        = 'flex';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';

    const toggle = new BS.UIToggle();
    toggle.SetChecked(checked);
    toggle.style.width  = `${width}px`;
    toggle.style.height = `${height}px`;
    panel.root.AppendChild(toggle);
    return obj;
  }),
};
