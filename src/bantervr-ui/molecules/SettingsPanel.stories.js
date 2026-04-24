import { banterUiStory } from '../story.js';

export default { title: 'BanterVR-UI/Molecules/SettingsPanel' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

function settingsRow(BS, labelText) {
  const row = new BS.UIVisualElement();
  row.style.display        = 'flex';
  row.style.flexDirection  = 'row';
  row.style.alignItems     = 'center';
  row.style.justifyContent = 'space-between';
  row.style.marginBottom   = '14px';

  const lbl = new BS.UILabel();
  lbl.SetProperty(BS.PN.text, labelText);
  lbl.style.fontSize   = '15px';
  lbl.style.color      = '#cccccc';
  lbl.style.width      = '110px';
  lbl.style.flexShrink = '0';

  row.AppendChild(lbl);
  return row;
}

export const Default = {
  args: { volume: 70, brightness: 50, musicEnabled: true, sfxEnabled: true },
  argTypes: {
    volume:       range(0, 100),
    brightness:   range(0, 100),
    musicEnabled: { control: 'boolean' },
    sfxEnabled:   { control: 'boolean' },
  },
  render: ({ volume, brightness, musicEnabled, sfxEnabled }) => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'SettingsPanel' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(420, 260) }));
    panel.root.style.display        = 'flex';
    panel.root.style.flexDirection  = 'column';
    panel.root.style.paddingTop     = '20px';
    panel.root.style.paddingRight   = '20px';
    panel.root.style.paddingBottom  = '20px';
    panel.root.style.paddingLeft    = '20px';

    const title = new BS.UILabel();
    title.SetProperty(BS.PN.text, 'Settings');
    title.style.fontSize     = '22px';
    title.style.color        = '#ffffff';
    title.style.marginBottom = '16px';
    panel.root.AppendChild(title);

    const volRow = settingsRow(BS, 'Volume');
    const volSlider = new BS.UISlider();
    volSlider.SetRange(0, 100);
    volSlider.SetValue(volume);
    volSlider.style.width = '250px';
    volRow.AppendChild(volSlider);
    panel.root.AppendChild(volRow);

    const brightRow = settingsRow(BS, 'Brightness');
    const brightSlider = new BS.UISlider();
    brightSlider.SetRange(0, 100);
    brightSlider.SetValue(brightness);
    brightSlider.style.width = '250px';
    brightRow.AppendChild(brightSlider);
    panel.root.AppendChild(brightRow);

    const musicRow = settingsRow(BS, 'Music');
    const musicToggle = new BS.UIToggle();
    musicToggle.SetChecked(musicEnabled);
    musicToggle.style.width  = '40px';
    musicToggle.style.height = '20px';
    musicRow.AppendChild(musicToggle);
    panel.root.AppendChild(musicRow);

    const sfxRow = settingsRow(BS, 'SFX');
    const sfxToggle = new BS.UIToggle();
    sfxToggle.SetChecked(sfxEnabled);
    sfxToggle.style.width  = '40px';
    sfxToggle.style.height = '20px';
    sfxRow.AppendChild(sfxToggle);
    panel.root.AppendChild(sfxRow);

    return obj;
  }),
};
