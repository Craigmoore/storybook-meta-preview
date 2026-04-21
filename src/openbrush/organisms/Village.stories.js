import { setSize } from '../utils.js';
import { makeScene } from '../molecules/structures.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Organisms/Village' };

export const Village = {
  args: { seed: 1, brushSize: 0.03 },
  argTypes: {
    seed:      { control: { type: 'range', min: 1, max: 99, step: 1 } },
    brushSize: { control: { type: 'range', min: 0.005, max: 0.1, step: 0.005 } },
  },
  render: ({ seed, brushSize }) => openbrushStory({ commands: [setSize(brushSize), ...makeScene(seed)] }),
};
