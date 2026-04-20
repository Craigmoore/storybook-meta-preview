# Tonal.js API Reference

## Overview

Tonal.js is a functional music theory library. It provides tools for working with notes, intervals, chords, scales, keys, and progressions. In this project it is used by the `audio` setup to build story data — note names, chord spellings, progressions — which Tone.js then plays.

**GitHub:** https://github.com/tonaljs/tonal  
**npm:** `tonal` (monorepo with individual packages like `@tonaljs/chord`, `@tonaljs/scale` etc., or the combined `tonal` package)

---

## Installation & Import

```javascript
// Full package
import { Note, Chord, Scale, Key, Progression, Interval } from 'tonal';

// Or individual modules
import { Note } from '@tonaljs/note';
import { Chord } from '@tonaljs/chord';
```

---

## Note

```javascript
import { Note } from 'tonal';

Note.get('C4')
// { name: 'C4', pc: 'C', step: 0, oct: 4, alteration: 0, midi: 60, freq: 261.63 }

Note.midi('C4')      // 60
Note.freq('A4')      // 440
Note.pitchClass('C#4')  // 'C#'
Note.octave('C4')    // 4
Note.accidentals('Db4') // 'b'

// Transpose a note by an interval
Note.transpose('C4', '3M')   // 'E4'  (major third up)
Note.transpose('C4', '-2M')  // 'Bb3' (major second down)

// Distance between notes
Note.distance('C4', 'G4')  // '5P' (perfect fifth)

// Sort notes
['E4', 'C4', 'G4'].sort(Note.sortedAsc)   // ['C4', 'E4', 'G4']
['E4', 'C4', 'G4'].sort(Note.sortedDesc)  // ['G4', 'E4', 'C4']

// Enharmonic equivalents
Note.enharmonic('Db4')  // 'C#4'
```

---

## Interval

```javascript
import { Interval } from 'tonal';

Interval.get('3M')
// { name: '3M', num: 3, q: 'M', type: 'M', alt: 0, dir: 1, simple: 3, semitones: 4 }

Interval.semitones('3M')   // 4
Interval.semitones('P5')   // 7
Interval.semitones('8P')   // 12

Interval.fromSemitones(7)  // '5P'
Interval.fromSemitones(4)  // '3M'

// Common interval names:
// '1P'  unison
// '2M'  major second
// '3m'  minor third
// '3M'  major third
// '4P'  perfect fourth
// '5P'  perfect fifth
// '6M'  major sixth
// '7m'  minor seventh
// '7M'  major seventh
// '8P'  octave
```

---

## Chord

```javascript
import { Chord } from 'tonal';

Chord.get('Cmaj7')
// { name: 'Cmaj7', tonic: 'C', type: 'maj7', notes: ['C', 'E', 'G', 'B'], ... }

Chord.get('C major')
// { name: 'C major', tonic: 'C', type: 'major', notes: ['C', 'E', 'G'], ... }

// Get note names (without octave)
Chord.get('Dm7').notes      // ['D', 'F', 'A', 'C']
Chord.get('G7').notes       // ['G', 'B', 'D', 'F']

// Add octave to chord notes for Tone.js
function chordNotes(name, octave = 4) {
  return Chord.get(name).notes.map(n => n + octave);
}
chordNotes('C major', 4)    // ['C4', 'E4', 'G4']
chordNotes('G7', 3)         // ['G3', 'B3', 'D4', 'F4']

// Detect chord from notes
Chord.detect(['C', 'E', 'G'])         // ['C major', 'C5']
Chord.detect(['C', 'Eb', 'G'])        // ['C minor']
Chord.detect(['C', 'E', 'G', 'B'])    // ['Cmaj7']

// All chord types
Chord.chordTypes()  // array of all known chord type names

// Chord by intervals
Chord.get('C major').intervals  // ['1P', '3M', '5P']
```

---

## Scale

```javascript
import { Scale } from 'tonal';

Scale.get('C major')
// { name: 'C major', tonic: 'C', type: 'major', notes: ['C','D','E','F','G','A','B'], intervals: [...] }

Scale.get('A minor')
// { notes: ['A','B','C','D','E','F','G'], ... }

Scale.get('D dorian').notes        // ['D','E','F','G','A','B','C']
Scale.get('F# pentatonic').notes   // ['F#','G#','A#','C#','D#']

// Add octave
function scaleNotes(name, octave = 4) {
  return Scale.get(name).notes.map(n => n + octave);
}
scaleNotes('C major', 4)  // ['C4','D4','E4','F4','G4','A4','B4']

// Common scale types:
// 'major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'
// 'pentatonic', 'minor pentatonic', 'blues', 'whole tone', 'diminished'

// Detect scale from notes
Scale.detect(['C','D','E','F','G','A','B'])  // ['C major', 'D dorian', ...]
```

---

## Key

```javascript
import { Key } from 'tonal';

// Major key
const key = Key.majorKey('C');
key.scale        // ['C','D','E','F','G','A','B']
key.chords       // ['Cmaj7','Dm7','Em7','Fmaj7','G7','Am7','Bm7b5']
key.chordsHarms  // ['I','ii','iii','IV','V','vi','vii°']
key.triads       // ['C','Dm','Em','F','G','Am','Bdim']
key.grades       // ['I','II','III','IV','V','VI','VII']

// Minor key
const minor = Key.minorKey('A');
minor.natural.scale    // ['A','B','C','D','E','F','G']
minor.natural.chords   // ['Am7','Bm7b5','Cmaj7','Dm7','Em7','Fmaj7','G7']
minor.harmonic.scale   // ['A','B','C','D','E','F','G#']
```

---

## Progression

```javascript
import { Progression } from 'tonal';

// Convert Roman numerals to chord names in a key
Progression.fromRomanNumerals('C', ['I', 'IV', 'V', 'I'])
// ['C', 'F', 'G', 'C']

Progression.fromRomanNumerals('G', ['I', 'ii', 'V7', 'I'])
// ['G', 'Am', 'D7', 'G']

// With 7th chords
Progression.fromRomanNumerals('C', ['Imaj7', 'IVmaj7', 'V7', 'VIm7'])
// ['Cmaj7', 'Fmaj7', 'G7', 'Am7']
```

---

## RomanNumeral

```javascript
import { RomanNumeral } from 'tonal';

RomanNumeral.get('V7')
// { name: 'V7', num: 5, roman: 'V', major: true, ... }

RomanNumeral.get('ii')
// { name: 'ii', num: 2, roman: 'ii', major: false, ... }
```

---

## Common Patterns for Audio Stories

### Build a chord from tonal name + octave
```javascript
import { Chord } from 'tonal';

function chordNotes(name, octave = 4) {
  return Chord.get(name).notes.map(n => n + octave);
}

chordNotes('C major', 4)   // ['C4', 'E4', 'G4']
chordNotes('Am7', 3)       // ['A3', 'C4', 'E4', 'G4']
```

### Build a progression from Roman numerals
```javascript
import { Progression, Chord } from 'tonal';

const chordNames = Progression.fromRomanNumerals('C', ['I', 'IV', 'V', 'I']);
// ['C', 'F', 'G', 'C']

const storyNotes = chordNames.map((name, i) => ({
  time: `${i}m`,
  pitch: Chord.get(name + ' major').notes.map(n => n + '4'),
  duration: '1m'
}));
```

### Get scale notes for a melody
```javascript
import { Scale } from 'tonal';

const notes = Scale.get('C pentatonic').notes.map(n => n + '4');
// ['C4', 'D4', 'E4', 'G4', 'A4']
```
