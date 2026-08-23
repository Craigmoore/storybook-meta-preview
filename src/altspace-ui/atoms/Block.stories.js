import { altspaceUiStory } from '../story.js';
import { makeBlock } from './components.js';

export default { title: 'Altspace-UI/Atoms/Block' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Block ─────────────────────────────────────────────────────────────────
// A single coloured square — the fundamental "cell" primitive behind
// Molecules/Grid and, in turn, BlockDrop's board and next-piece preview.

export const Block = {
  args: { size: 32, color: '#22d3ee' },
  argTypes: {
    size:  range(8, 128, 4),
    color: { control: 'color' },
  },
  render: ({ size, color }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'Block' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(160, 160) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.alignItems      = 'center';
    panel.root.style.justifyContent  = 'center';
    panel.root.AppendChild(makeBlock(BS, { size, color }));
    return obj;
  }),
};
