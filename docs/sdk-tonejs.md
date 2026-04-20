# Tone.js API Reference

## Overview

Tone.js is a Web Audio framework for creating interactive music and audio in the browser. In this project it is used by the `audio` setup — the meta-preview owns the Tone.js engine entirely; stories only provide structured music data.

---

## Initialization

**Audio context must be started via a user gesture** (browser requirement).

```javascript
import * as Tone from 'tone';

// Call on button click / user interaction
await Tone.start();
Tone.Transport.bpm.value = 120;
```

---

## Transport

The global timeline. All scheduled events sync to it.

```javascript
Tone.Transport.bpm.value = 120;
Tone.Transport.bpm.rampTo(140, 2);    // ramp to 140 BPM over 2s

Tone.Transport.start();
Tone.Transport.pause();
Tone.Transport.stop();
Tone.Transport.cancel();              // clear all scheduled events

Tone.Transport.position;              // current position e.g. "0:0:0"
Tone.Transport.seconds;               // current time in seconds

// Schedule one-time event
Tone.Transport.schedule((time) => {
  synth.triggerAttackRelease('C4', '8n', time);
}, '1m');

// Schedule repeating event
const id = Tone.Transport.scheduleRepeat((time) => {
  synth.triggerAttackRelease('C4', '8n', time);
}, '4n');

Tone.Transport.clear(id);
```

---

## Synthesizers

### Synth
```javascript
const synth = new Tone.Synth({
  oscillator: { type: 'triangle' },   // sine | triangle | square | sawtooth
  envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
}).toDestination();

synth.triggerAttackRelease('C4', '4n');
synth.triggerAttack('C4');
synth.triggerRelease();
```

### PolySynth
Multiple simultaneous notes (chords).
```javascript
const poly = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
}).toDestination();

poly.triggerAttackRelease(['C4', 'E4', 'G4'], '4n');
```

### MembraneSynth
Kick drums and low percussion.
```javascript
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.08,
  octaves: 6,
  envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
}).toDestination();

kick.triggerAttackRelease('C1', '8n');
```

### FMSynth
Complex, evolving tones via frequency modulation.
```javascript
const fm = new Tone.FMSynth({
  harmonicity: 3,
  modulationIndex: 40,
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
}).toDestination();

fm.triggerAttackRelease('C4', '4n');
```

---

## Sequencing

### Part
Schedule a collection of notes at specific times.
```javascript
const part = new Tone.Part((time, note) => {
  synth.triggerAttackRelease(note.pitch, note.duration, time);
}, [
  { time: '0m',       pitch: 'C4', duration: '4n' },
  { time: '0m + 4n',  pitch: 'E4', duration: '4n' },
  { time: '0m + 2n',  pitch: 'G4', duration: '4n' }
]);

part.start(0);
Tone.Transport.start();
```

### Sequence
Cycle through a list of notes.
```javascript
const seq = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, '8n', time);
}, ['C4', 'E4', 'G4', 'E4'], '4n');

seq.start(0);
Tone.Transport.start();
```

### Loop
Repeat a callback.
```javascript
const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease('C4', '8n', time);
}, '4n');

loop.start(0);
Tone.Transport.start();
```

### Pattern
Play notes in a pattern direction.
```javascript
// directions: "upDown" | "downUp" | "alternateUp" | "alternateDown" | "random"
const pattern = new Tone.Pattern((time, note) => {
  synth.triggerAttackRelease(note, '8n', time);
}, ['C4', 'E4', 'G4'], 'upDown');

pattern.start(0);
Tone.Transport.start();
```

---

## Effects

```javascript
const reverb   = new Tone.Reverb({ decay: 2.5, preDelay: 0.01 }).toDestination();
const delay    = new Tone.Delay({ time: '8n', feedback: 0.3 }).toDestination();
const dist     = new Tone.Distortion(4).toDestination();
const filter   = new Tone.Filter({ type: 'lowpass', frequency: 2000, rolloff: -24 }).toDestination();

// Connect
synth.connect(reverb);

// Chain
synth.chain(filter, delay, reverb, Tone.Destination);

// Automate
filter.frequency.rampTo(500, 2);
```

Filter types: `lowpass` | `highpass` | `bandpass` | `notch` | `allpass` | `peaking`

---

## Analysis (for visualiser)

```javascript
const analyser = new Tone.Analyser({ type: 'waveform', size: 1024 });
// or type: 'fft'

synth.connect(analyser);

// In animation loop:
const data = analyser.getValue();  // Float32Array
```

---

## Note Format

### Pitch
```
'C4'   'D4'   'E4'   'F4'   'G4'   'A4'   'B4'
'C#4'  'Db4'  'D#4'  'Eb4'  'F#4'  'Gb4'
'G#4'  'Ab4'  'A#4'  'Bb4'
```
`C4` = middle C. Octave number changes at C (so `B3` is below `C4`).

### Duration
```
'1n'   whole note
'2n'   half note
'4n'   quarter note
'8n'   eighth note
'16n'  sixteenth note
'4n.'  dotted quarter (1.5×)
'8n.'  dotted eighth
'4nt'  quarter triplet (2/3×)
'1m'   one whole measure
```

At 120 BPM: `'4n'` = 500ms, `'8n'` = 250ms, `'16n'` = 125ms.

---

## Audio Story Data Format (used in this project)

Stories export structured data — NOT Tone.js instances. The meta-preview owns the engine.

```javascript
// Atom story: a single note
export const story = {
  bpm: 90,
  notes: [
    { time: '0m', pitch: 'C4', duration: '4n' }
  ]
};

// Molecule story: a chord
export const story = {
  bpm: 90,
  notes: [
    { time: '0m', pitch: ['C4', 'E4', 'G4'], duration: '2n' }
  ]
};

// Organism story: a progression
export const story = {
  bpm: 90,
  loop: true,
  notes: [
    { time: '0m',  pitch: ['C4', 'E4', 'G4'],  duration: '1m' },
    { time: '1m',  pitch: ['F4', 'A4', 'C5'],  duration: '1m' },
    { time: '2m',  pitch: ['G4', 'B4', 'D5'],  duration: '1m' },
    { time: '3m',  pitch: ['C4', 'E4', 'G4'],  duration: '1m' }
  ]
};
```

The meta-preview interprets this format, creates the appropriate `PolySynth` or `Synth`, schedules the notes, and handles the play button, visualiser, and stopping on story change.
