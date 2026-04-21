import { audioStory } from '../story.js';

export default { title: 'Audio/Atoms/Note' };

export const MiddleC = {
  render: () => audioStory({ type: 'note', note: 'C4', duration: '4n' }),
};

export const HighA = {
  render: () => audioStory({ type: 'note', note: 'A5', duration: '8n' }),
};

export const LongNote = {
  render: () => audioStory({ type: 'note', note: 'E3', duration: '2n' }),
};
