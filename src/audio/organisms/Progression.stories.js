import { audioStory } from '../story.js';

export default { title: 'Audio/Organisms/Progression' };

export const IViviV = {
  render: () => audioStory({
    type: 'progression',
    bpm: 100,
    steps: [
      { notes: ['C4', 'E4', 'G4'],  duration: '2n' },
      { notes: ['A3', 'C4', 'E4'],  duration: '2n' },
      { notes: ['F3', 'A3', 'C4'],  duration: '2n' },
      { notes: ['G3', 'B3', 'D4'],  duration: '2n' },
    ],
  }),
};

export const BluesLoop = {
  render: () => audioStory({
    type: 'progression',
    bpm: 80,
    steps: [
      { notes: ['A2', 'E3', 'A3'], duration: '4n' },
      { notes: ['A2', 'E3', 'A3'], duration: '4n' },
      { notes: ['D3', 'F3', 'A3'], duration: '4n' },
      { notes: ['A2', 'E3', 'A3'], duration: '4n' },
      { notes: ['E3', 'G#3', 'B3'], duration: '4n' },
      { notes: ['D3', 'F3', 'A3'], duration: '4n' },
      { notes: ['A2', 'E3', 'A3'], duration: '4n' },
      { notes: ['E3', 'G#3', 'B3'], duration: '4n' },
    ],
  }),
};
