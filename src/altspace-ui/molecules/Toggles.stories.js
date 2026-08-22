import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Molecules/Toggles' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Toggle: With Label ───────────────────────────────────────────────────────

export const ToggleLabelled = {
  args: { label: 'Enable Music', checked: true },
  argTypes: {
    label:   { control: 'text' },
    checked: { control: 'boolean' },
  },
  render: ({ label, checked }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ToggleLabelled' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(300, 60) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'row';
    panel.root.style.alignItems      = 'center';
    panel.root.style.paddingTop      = '8px';
    panel.root.style.paddingRight    = '16px';
    panel.root.style.paddingBottom   = '8px';
    panel.root.style.paddingLeft     = '16px';

    const toggle = new BS.UIToggle();
    toggle.SetChecked(checked);
    toggle.style.marginRight = '12px';

    const lbl = new BS.UILabel();
    lbl.SetProperty(BS.PN.text, label);
    lbl.style.fontSize = '18px';

    panel.root.AppendChild(toggle);
    panel.root.AppendChild(lbl);
    return obj;
  }),
};

// ─── Toggle: Group ────────────────────────────────────────────────────────────

export const ToggleGroup = {
  args: { musicOn: true, sfxOn: true, hapticsOn: false },
  argTypes: {
    musicOn:   { control: 'boolean' },
    sfxOn:     { control: 'boolean' },
    hapticsOn: { control: 'boolean' },
  },
  render: ({ musicOn, sfxOn, hapticsOn }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ToggleGroup' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(300, 160) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'column';
    panel.root.style.paddingTop      = '16px';
    panel.root.style.paddingRight    = '16px';
    panel.root.style.paddingBottom   = '16px';
    panel.root.style.paddingLeft     = '16px';

    function row(labelText, isChecked, isLast) {
      const container = new BS.UIVisualElement();
      container.style.display        = 'flex';
      container.style.flexDirection  = 'row';
      container.style.alignItems     = 'center';
      if (!isLast) container.style.marginBottom = '8px';

      const t = new BS.UIToggle();
      t.SetChecked(isChecked);
      t.style.marginRight = '12px';

      const l = new BS.UILabel();
      l.SetProperty(BS.PN.text, labelText);
      l.style.fontSize = '16px';

      container.AppendChild(t);
      container.AppendChild(l);
      return container;
    }

    panel.root.AppendChild(row('Music',    musicOn,    false));
    panel.root.AppendChild(row('Sound FX', sfxOn,      false));
    panel.root.AppendChild(row('Haptics',  hapticsOn,  true));
    return obj;
  }),
};
