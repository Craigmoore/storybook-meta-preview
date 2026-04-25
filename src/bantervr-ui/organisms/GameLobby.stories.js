import { banterUiStory } from '../story.js';

export default { title: 'BanterVR-UI/Organisms/GameLobby' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });
const select = (...options)          => ({ control: { type: 'select', options } });

const PLAYER_NAMES = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];

const STATUS_THEME = {
  WAITING:  { bg: '#1e2260', text: '#8899ff' },
  READY:    { bg: '#1a4a2a', text: '#52e08a' },
  STARTING: { bg: '#4a2a10', text: '#e0a252' },
};

export const GameLobby = {
  args: {
    playerCount:  4,
    status:       'WAITING',
    musicEnabled: true,
    volume:       70,
    buttonText:   'Start Game',
  },
  argTypes: {
    playerCount:  range(1, 8, 1),
    status:       select('WAITING', 'READY', 'STARTING'),
    musicEnabled: { control: 'boolean' },
    volume:       range(0, 100, 5),
    buttonText:   { control: 'text' },
  },
  render: ({ playerCount, status, musicEnabled, volume, buttonText }) => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'GameLobby' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(380, 400) }));
    panel.root.style.display        = 'flex';
    panel.root.style.flexDirection  = 'column';
    panel.root.style.paddingTop     = '16px';
    panel.root.style.paddingRight   = '16px';
    panel.root.style.paddingBottom  = '16px';
    panel.root.style.paddingLeft    = '16px';

    // ── 1. Title ──────────────────────────────────────────────────────────────
    const title = new BS.UILabel();
    title.SetProperty(BS.PN.text, 'Game Lobby');
    title.style.fontSize     = '24px';
    title.style.color        = '#ffffff';
    title.style.marginBottom = '8px';
    panel.root.AppendChild(title);

    // ── 2. Status badge ───────────────────────────────────────────────────────
    const theme = STATUS_THEME[status] ?? STATUS_THEME.WAITING;
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
    badge.style.marginBottom    = '12px';
    const badgeLbl = new BS.UILabel();
    badgeLbl.SetProperty(BS.PN.text, status);
    badgeLbl.style.fontSize      = '13px';
    badgeLbl.style.color         = theme.text;
    badgeLbl.style.letterSpacing = '1px';
    badge.AppendChild(badgeLbl);
    panel.root.AppendChild(badge);

    // ── 3. Player scroll list ─────────────────────────────────────────────────
    const sv = new BS.UIScrollView();
    sv.style.width        = '100%';
    sv.style.height       = '150px';
    sv.style.marginBottom = '12px';
    for (let i = 0; i < playerCount; i++) {
      const row = new BS.UIVisualElement();
      row.style.display           = 'flex';
      row.style.flexDirection     = 'row';
      row.style.alignItems        = 'center';
      row.style.height            = '36px';
      row.style.paddingLeft       = '10px';
      row.style.paddingRight      = '10px';
      row.style.backgroundColor   = i % 2 === 0 ? '#14172a' : '#10121c';
      row.style.borderBottomColor = '#2a2d40';
      row.style.borderBottomWidth = '1px';
      const numLbl = new BS.UILabel();
      numLbl.SetProperty(BS.PN.text, `${i + 1}`);
      numLbl.style.fontSize    = '12px';
      numLbl.style.color       = '#555577';
      numLbl.style.width       = '20px';
      numLbl.style.marginRight = '8px';
      const nameLbl = new BS.UILabel();
      nameLbl.SetProperty(BS.PN.text, PLAYER_NAMES[i]);
      nameLbl.style.fontSize = '15px';
      nameLbl.style.color    = '#ffffff';
      row.AppendChild(numLbl);
      row.AppendChild(nameLbl);
      sv.AppendChild(row);
    }
    panel.root.AppendChild(sv);

    // ── 4. Music toggle row ───────────────────────────────────────────────────
    const musicRow = new BS.UIVisualElement();
    musicRow.style.display        = 'flex';
    musicRow.style.flexDirection  = 'row';
    musicRow.style.alignItems     = 'center';
    musicRow.style.justifyContent = 'space-between';
    musicRow.style.marginBottom   = '10px';
    const musicLbl = new BS.UILabel();
    musicLbl.SetProperty(BS.PN.text, 'Music');
    musicLbl.style.fontSize = '15px';
    musicLbl.style.color    = '#cccccc';
    const musicToggle = new BS.UIToggle();
    musicToggle.SetChecked(musicEnabled);
    musicToggle.style.width  = '40px';
    musicToggle.style.height = '20px';
    musicRow.AppendChild(musicLbl);
    musicRow.AppendChild(musicToggle);
    panel.root.AppendChild(musicRow);

    // ── 5. Volume slider row ──────────────────────────────────────────────────
    const volRow = new BS.UIVisualElement();
    volRow.style.display        = 'flex';
    volRow.style.flexDirection  = 'row';
    volRow.style.alignItems     = 'center';
    volRow.style.justifyContent = 'space-between';
    volRow.style.marginBottom   = '16px';
    const volLbl = new BS.UILabel();
    volLbl.SetProperty(BS.PN.text, 'Volume');
    volLbl.style.fontSize = '15px';
    volLbl.style.color    = '#cccccc';
    volLbl.style.width    = '70px';
    const volSlider = new BS.UISlider();
    volSlider.SetRange(0, 100);
    volSlider.SetValue(volume);
    volSlider.style.width  = '240px';
    volSlider.style.height = '20px';
    volRow.AppendChild(volLbl);
    volRow.AppendChild(volSlider);
    panel.root.AppendChild(volRow);

    // ── 6. Action button ──────────────────────────────────────────────────────
    const btn = new BS.UIButton();
    btn.SetProperty(BS.PN.text, buttonText);
    btn.style.height   = '48px';
    btn.style.fontSize = '18px';
    panel.root.AppendChild(btn);

    return obj;
  }),
};
