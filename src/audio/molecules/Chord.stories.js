import { audioStory } from '../story.js';

export default { title: 'Audio/Molecules/Chord' };

// --- Triads ---

// Bright, resolved, at home
export const CMajor = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'E4', 'G4'], duration: '2n' }),
};

// Darker but stable — relative minor of C
export const AMinor = {
  render: () => audioStory({ type: 'chord', notes: ['A3', 'C4', 'E4'], duration: '2n' }),
};

// Tense, wants to move — tritone between root and diminished 5th
export const BDiminished = {
  render: () => audioStory({ type: 'chord', notes: ['B3', 'D4', 'F4'], duration: '2n' }),
};

// Unsettled, floating — raised 5th creates ambiguity
export const CAugmented = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'E4', 'G#4'], duration: '2n' }),
};

// Open, suspended — neither major nor minor, unresolved
export const CSus4 = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'F4', 'G4'], duration: '2n' }),
};

// Airy, modal — the sus2 floats where sus4 leans
export const CSus2 = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'D4', 'G4'], duration: '2n' }),
};

// --- Seventh chords ---

// Warm, jazzy sophistication
export const CMaj7 = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'E4', 'G4', 'B4'], duration: '2n' }),
};

// Bluesy, dominant — the definitive tension chord
export const G7 = {
  render: () => audioStory({ type: 'chord', notes: ['G3', 'B3', 'D4', 'F4'], duration: '2n' }),
};

// Rich, melancholic — jazz minor colour
export const DMin7 = {
  render: () => audioStory({ type: 'chord', notes: ['D4', 'F4', 'A4', 'C5'], duration: '2n' }),
};

// Spooky, symmetrical — divides the octave into four equal parts
export const CDim7 = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'Eb4', 'Gb4', 'A4'], duration: '2n' }),
};

// --- Extended and modern ---

// Lush, full — the sound of a string section settling
export const CMaj9 = {
  render: () => audioStory({ type: 'chord', notes: ['C3', 'E4', 'G4', 'B4', 'D5'], duration: '1n' }),
};

// Stacked fourths — quartal harmony, Herbie Hancock / McCoy Tyner territory
export const QuartalStack = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'F4', 'Bb4', 'Eb5'], duration: '2n' }),
};

// Dense chromatic cluster — twelve-tone / modern classical
export const ChromaticCluster = {
  render: () => audioStory({ type: 'chord', notes: ['C4', 'Db4', 'D4', 'Eb4'], duration: '4n' }),
};

// Heavy, hollow — power chord spanning two octaves
export const PowerChord = {
  render: () => audioStory({ type: 'chord', notes: ['C2', 'G2', 'C3', 'G3'], duration: '2n' }),
};
