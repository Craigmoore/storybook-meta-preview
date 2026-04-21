import { setSize } from '../utils.js';
import { makeScene } from '../molecules/structures.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Organisms/Village' };

const SIZE = setSize(0.03);

export const Village = {
  render: () => openbrushStory({ commands: [SIZE, ...makeScene(1)] }),
};
