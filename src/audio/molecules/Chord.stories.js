import { audioStory } from '../story.js';

export default { title: 'Audio/Molecules/Chord' };

export const CMajor = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'E4', 'G4'], duration: '2n' }),
};

export const AMinor = {
  render: () => audioStory({ type: 'chord', notes: ['A3', 'C4', 'E4'], duration: '2n' }),
};

export const DMajor7 = {
  render: () => audioStory({ type: 'chord', notes: ['D4', 'F#4', 'A4', 'C#5'], duration: '2n' }),
};
