import { audioStory } from '../story.js';

export default { title: 'Audio/Organisms/Progression' };

// The most recognisable pop progression — I–V–vi–IV
// Thousands of songs, one loop: Let It Be, No Woman No Cry, With or Without You
export const PopLoop = {
  render: () => audioStory({
    type: 'progression',
    bpm: 72,
    steps: [
      { notes: ['C4', 'E4', 'G4'],  duration: '2n' },  // I   — C Major
      { notes: ['G3', 'B3', 'D4'],  duration: '2n' },  // V   — G Major
      { notes: ['A3', 'C4', 'E4'],  duration: '2n' },  // vi  — A Minor
      { notes: ['F3', 'A3', 'C4'],  duration: '2n' },  // IV  — F Major
    ],
  }),
};

// Jazz ii–V–I in C — the cornerstone of bebop
// Dm7 creates tension, G7 intensifies it, CMaj7 resolves
export const JazzTwoFiveOne = {
  render: () => audioStory({
    type: 'progression',
    bpm: 120,
    steps: [
      { notes: ['D4', 'F4', 'A4', 'C5'],  duration: '2n' },  // ii7  — Dm7
      { notes: ['G3', 'B3', 'D4', 'F4'],  duration: '2n' },  // V7   — G7
      { notes: ['C4', 'E4', 'G4', 'B4'],  duration: '1n' },  // IMaj7 — CMaj7
    ],
  }),
};

// Andalusian cadence — flamenco / Spanish Phrygian sound
// The descending bass Am–G–F–E is one of the oldest progressions in Western music
export const Andalusian = {
  render: () => audioStory({
    type: 'progression',
    bpm: 90,
    steps: [
      { notes: ['A3', 'C4', 'E4'],   duration: '2n' },  // Am — home
      { notes: ['G3', 'B3', 'D4'],   duration: '2n' },  // G  — step down
      { notes: ['F3', 'A3', 'C4'],   duration: '2n' },  // F  — step down
      { notes: ['E3', 'G#3', 'B3'],  duration: '2n' },  // E  — Phrygian cadence, raw tension
    ],
  }),
};

// Pachelbel's Canon — D major, original key
// The infinite loop: its bass line is one of the most covered in history
export const Pachelbel = {
  render: () => audioStory({
    type: 'progression',
    bpm: 66,
    steps: [
      { notes: ['D4', 'F#4', 'A4'],   duration: '2n' },  // I    — D
      { notes: ['A3', 'E4', 'A4'],    duration: '2n' },  // V    — A
      { notes: ['B3', 'D4', 'F#4'],   duration: '2n' },  // vi   — Bm
      { notes: ['F#3', 'C#4', 'F#4'], duration: '2n' },  // iii  — F#m
      { notes: ['G3', 'D4', 'G4'],    duration: '2n' },  // IV   — G
      { notes: ['D4', 'F#4', 'A4'],   duration: '2n' },  // I    — D
      { notes: ['G3', 'B3', 'D4'],    duration: '2n' },  // IV   — G
      { notes: ['A3', 'E4', 'A4'],    duration: '2n' },  // V    — A
    ],
  }),
};

// 12-bar blues in A — the foundation of rock and roll
export const TwelveBarBlues = {
  render: () => audioStory({
    type: 'progression',
    bpm: 88,
    steps: [
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7  — A7
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7
      { notes: ['D3', 'A3', 'C4', 'F#4'], duration: '2n' },  // IV7 — D7
      { notes: ['D3', 'A3', 'C4', 'F#4'], duration: '2n' },  // IV7
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7
      { notes: ['E3', 'B3', 'D4', 'G#4'], duration: '2n' },  // V7  — E7
      { notes: ['D3', 'A3', 'C4', 'F#4'], duration: '2n' },  // IV7
      { notes: ['A2', 'E3', 'G3', 'C#4'], duration: '2n' },  // I7
      { notes: ['E3', 'B3', 'D4', 'G#4'], duration: '2n' },  // V7  — turnaround
    ],
  }),
};

// Circle of fifths descent — a clockwise walk through C G D A E B
// Each chord is a perfect fifth above the last: you can hear the harmonic motion
export const CircleOfFifths = {
  render: () => audioStory({
    type: 'progression',
    bpm: 100,
    steps: [
      { notes: ['C4', 'E4', 'G4'],   duration: '4n' },  // C
      { notes: ['G3', 'B3', 'D4'],   duration: '4n' },  // G
      { notes: ['D4', 'F#4', 'A4'],  duration: '4n' },  // D
      { notes: ['A3', 'C#4', 'E4'],  duration: '4n' },  // A
      { notes: ['E4', 'G#4', 'B4'],  duration: '4n' },  // E
      { notes: ['B3', 'D#4', 'F#4'], duration: '4n' },  // B
      { notes: ['F#3', 'A#3', 'C#4'],duration: '4n' },  // F#
      { notes: ['C4', 'E4', 'G4'],   duration: '4n' },  // C — back home
    ],
  }),
};

// Chromatic bass ascent under a static harmony — the bass moves, the top stays
// Creates a sense of gradual brightening / lifting
export const ChromaticRise = {
  render: () => audioStory({
    type: 'progression',
    bpm: 100,
    steps: [
      { notes: ['C3', 'E4', 'G4'],   duration: '4n' },
      { notes: ['C#3', 'E4', 'G#4'], duration: '4n' },
      { notes: ['D3', 'F#4', 'A4'],  duration: '4n' },
      { notes: ['D#3', 'G4', 'A#4'], duration: '4n' },
      { notes: ['E3', 'G#4', 'B4'],  duration: '4n' },
      { notes: ['F3', 'A4', 'C5'],   duration: '4n' },
      { notes: ['F#3', 'A#4', 'C#5'],duration: '4n' },
      { notes: ['G3', 'B4', 'D5'],   duration: '4n' },
    ],
  }),
};

// Arpeggiated melody line — single notes as a progression
// The opening of a folk / Celtic melodic phrase
export const CelticMelody = {
  render: () => audioStory({
    type: 'progression',
    bpm: 110,
    steps: [
      { notes: ['D4'],  duration: '4n' },
      { notes: ['E4'],  duration: '4n' },
      { notes: ['F#4'], duration: '4n' },
      { notes: ['A4'],  duration: '4n' },
      { notes: ['B4'],  duration: '4n' },
      { notes: ['A4'],  duration: '4n' },
      { notes: ['F#4'], duration: '4n' },
      { notes: ['D4'],  duration: '2n' },
    ],
  }),
};

// Modal — Dorian vamp, the sound of Miles Davis's So What
// Minor with a raised 6th gives it that bittersweet, sophisticated edge
export const DorianVamp = {
  render: () => audioStory({
    type: 'progression',
    bpm: 108,
    steps: [
      { notes: ['D3', 'F3', 'A3', 'C4'],  duration: '2n' },  // Dm7
      { notes: ['D3', 'F3', 'A3', 'C4'],  duration: '4n' },  // Dm7
      { notes: ['E3', 'G3', 'B3', 'D4'],  duration: '4n' },  // Em7 (Dorian IV)
      { notes: ['D3', 'F3', 'A3', 'C4'],  duration: '2n' },  // Dm7
      { notes: ['D3', 'F3', 'A3', 'C4'],  duration: '4n' },  // Dm7
      { notes: ['Eb3', 'G3', 'Bb3', 'Db4'], duration: '4n' }, // Ebm7 — half-step shift, So What style
    ],
  }),
};
