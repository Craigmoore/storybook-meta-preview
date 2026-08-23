import { altspaceUiStory } from '../story.js';
import { makeStatusBadge, makePlayerRow, makeToggleRow, makeSliderRow } from '../molecules/components.js';

export default { title: 'Altspace-UI/Organisms/GameLobby' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });
const select = (...options)          => ({ control: { type: 'select' }, options });

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
  render: ({ playerCount, status, musicEnabled, volume, buttonText }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'GameLobby' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(380, 400) }));
    panel.root.style.display        = 'flex';
    panel.root.style.flexDirection  = 'column';
    panel.root.style.paddingTop     = '16px';
    panel.root.style.paddingRight   = '16px';
    panel.root.style.paddingBottom  = '16px';
    panel.root.style.paddingLeft    = '16px';

    // Title (atom)
    const title = new BS.UILabel();
    title.SetProperty(BS.PN.text, 'Game Lobby');
    title.style.fontSize     = '24px';
    title.style.color        = '#ffffff';
    title.style.marginBottom = '8px';
    panel.root.AppendChild(title);

    // Status badge (molecule)
    const badge = makeStatusBadge(BS, status, STATUS_THEME[status] ?? STATUS_THEME.WAITING);
    badge.style.marginBottom = '12px';
    panel.root.AppendChild(badge);

    // Player scroll list (molecule rows)
    const sv = new BS.UIScrollView();
    sv.style.width        = '100%';
    sv.style.height       = '150px';
    sv.style.marginBottom = '12px';
    for (let i = 0; i < playerCount; i++) {
      sv.AppendChild(makePlayerRow(BS, i, PLAYER_NAMES[i]));
    }
    panel.root.AppendChild(sv);

    // Music toggle row (molecule)
    const musicRow = makeToggleRow(BS, 'Music', musicEnabled);
    musicRow.style.marginBottom = '10px';
    panel.root.AppendChild(musicRow);

    // Volume slider row (molecule)
    const volRow = makeSliderRow(BS, 'Volume', 0, 100, volume);
    volRow.style.marginBottom = '16px';
    panel.root.AppendChild(volRow);

    // Action button (atom)
    const btn = new BS.UIButton();
    btn.SetProperty(BS.PN.text, buttonText);
    btn.style.height   = '48px';
    btn.style.fontSize = '18px';
    panel.root.AppendChild(btn);

    return obj;
  }),
};
