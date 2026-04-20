# Setup: audio

## Purpose
Demonstrates Storybook for music theory. Stories define structured music data (notes, chords, progressions). The meta-preview owns the Tone.js engine and plays the content when the user clicks Play.

## Ports
- Storybook: 6009
- Relay: 3336

## Run
```bash
yarn dev:audio
```

## Dependencies
- `tone` — Web Audio framework (playback engine)
- `tonal` — Music theory library (note/chord/scale helpers)

## Story Hierarchy

| Level | Music concept | Example |
|---|---|---|
| Atom | Single note | C4, quarter note |
| Molecule | Chord (simultaneous notes) | C major triad |
| Organism | Progression (sequence of chords) | I–IV–V–I |

## Story Format
Stories export a plain data object — **no Tone.js instances**. The meta-preview owns the engine entirely.

```javascript
// Atom: single note
export default { title: 'Audio/Atoms/C4' };
export const Default = {
  story: {
    bpm: 90,
    notes: [{ time: '0m', pitch: 'C4', duration: '4n' }]
  }
};

// Molecule: chord
export default { title: 'Audio/Molecules/CMajor' };
export const Default = {
  story: {
    bpm: 90,
    notes: [{ time: '0m', pitch: ['C4', 'E4', 'G4'], duration: '2n' }]
  }
};

// Organism: progression
export default { title: 'Audio/Organisms/I-IV-V-I' };
export const Default = {
  story: {
    bpm: 100,
    loop: true,
    notes: [
      { time: '0m', pitch: ['C4', 'E4', 'G4'],  duration: '1m' },
      { time: '1m', pitch: ['F4', 'A4', 'C5'],  duration: '1m' },
      { time: '2m', pitch: ['G4', 'B4', 'D5'],  duration: '1m' },
      { time: '3m', pitch: ['C4', 'E4', 'G4'],  duration: '1m' }
    ]
  }
};
```

## Meta-Preview Behaviour
- On story update: stops all Tone.js playback immediately, shows Play button
- On Play click: `await Tone.start()`, creates `PolySynth`, schedules notes via `Tone.Part`, starts Transport
- Visualiser: waveform + individual notes lighting up as they play
- Uses `Tone.Analyser` for waveform data

## Key APIs
- See `docs/sdk-tonejs.md` for Tone.js reference
- See `docs/sdk-tonaljs.md` for Tonal.js reference (note/chord name helpers)
