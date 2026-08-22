import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Molecules/ActionCard' };

export const Default = {
  args: { title: 'Join Game', description: 'Enter the arena with up to 8 players', buttonText: 'Join' },
  argTypes: {
    title:       { control: 'text' },
    description: { control: 'text' },
    buttonText:  { control: 'text' },
  },
  render: ({ title, description, buttonText }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ActionCard' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(400, 160) }));
    panel.root.style.display        = 'flex';
    panel.root.style.flexDirection  = 'column';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';
    panel.root.style.paddingTop     = '16px';
    panel.root.style.paddingRight   = '16px';
    panel.root.style.paddingBottom  = '16px';
    panel.root.style.paddingLeft    = '16px';

    const heading = new BS.UILabel();
    heading.SetProperty(BS.PN.text, title);
    heading.style.fontSize     = '26px';
    heading.style.color        = '#ffffff';
    heading.style.marginBottom = '8px';

    const desc = new BS.UILabel();
    desc.SetProperty(BS.PN.text, description);
    desc.style.fontSize     = '14px';
    desc.style.color        = '#888888';
    desc.style.textAlign    = 'center';
    desc.style.marginBottom = '10px';

    const btn = new BS.UIButton();
    btn.SetProperty(BS.PN.text, buttonText);
    btn.style.width    = '160px';
    btn.style.height   = '44px';
    btn.style.fontSize = '18px';

    panel.root.AppendChild(heading);
    panel.root.AppendChild(desc);
    panel.root.AppendChild(btn);
    return obj;
  }),
};
