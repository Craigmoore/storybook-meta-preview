import { audioStory } from '../story.js';

export default { title: 'Audio/Atoms/Note' };

// Deep sub-bass — felt as much as heard
export const SubBass = {
  render: () => audioStory({ type: 'note', note: 'A1', duration: '1n' }),
};

// Classic bass guitar open A string
export const BassA = {
  render: () => audioStory({ type: 'note', note: 'A2', duration: '2n' }),
};

// The universal reference — middle C
export const MiddleC = {
  render: () => audioStory({ type: 'note', note: 'C4', duration: '4n' }),
};

// Concert A — the tuning note
export const ConcertA = {
  render: () => audioStory({ type: 'note', note: 'A4', duration: '4n' }),
};

// Bright upper register
export const HighE = {
  render: () => audioStory({ type: 'note', note: 'E5', duration: '4n' }),
};

// Glassy, almost bell-like at this range
export const Crystal = {
  render: () => audioStory({ type: 'note', note: 'C6', duration: '8n' }),
};

// The highest C on a standard piano
export const Stratosphere = {
  render: () => audioStory({ type: 'note', note: 'C8', duration: '16n' }),
};
