/**
 * Quick Start Examples - Bass Music Engine
 * Copy and paste these examples to get started quickly
 */

import { PitchClass } from './domain/PitchClass';
import { ScaleEngine } from './domain/ScaleEngine';
import { Fretboard } from './domain/Fretboard';
import { ViterbiRouter } from './infrastructure/ViterbiRouter';
import { renderFretboard, renderPath, renderChordShape } from './infrastructure/ConsoleViewer';

// ============================================================================
// EXAMPLE 1: Pitch Class Arithmetic
// ============================================================================
export function example1_pitchArithmetic() {
  console.log('\n=== EXAMPLE 1: Pitch Class Arithmetic ===\n');
  
  const c = PitchClass.fromName('C');
  const d = PitchClass.fromName('D');
  
  // Adding intervals
  const majorThird = c.add(4);  // C + major third = E
  console.log(`C + major third (4 semitones) = ${majorThird.toString()}`);
  
  // Subtracting intervals
  const down = c.subtract(3);   // C - minor third = A
  console.log(`C - minor third (3 semitones) = ${down.toString()}`);
  
  // Shortest distance
  const distance = c.shortestIntervalTo(d);
  console.log(`Shortest distance C to D = ${distance} semitones`);
  
  // Negative intervals (descending)
  const descending = c.add(-7);  // C down a fifth = F
  console.log(`C - perfect fifth (descending) = ${descending.toString()}`);
}

// ============================================================================
// EXAMPLE 2: Scale Construction and Modes
// ============================================================================
export function example2_scalesAndModes() {
  console.log('\n=== EXAMPLE 2: Scales and Modes ===\n');
  
  const g = PitchClass.fromName('G');
  const gMajor = ScaleEngine.major(g);
  
  // Get all pitches
  const pitches = gMajor.getPitches();
  console.log('G Major scale:', pitches.map(p => p.toString()).join(' - '));
  
  // Get modes
  const aMixolydian = gMajor.getMode(2);
  console.log('A Mixolydian (mode 2):', aMixolydian.getPitches().map(p => p.toString()).join(' - '));
  
  // Natural minor scale
  const eMinor = ScaleEngine.naturalMinor(PitchClass.fromName('E'));
  console.log('E Natural Minor:', eMinor.getPitches().map(p => p.toString()).join(' - '));
  
  // Harmonic minor
  const aHarmonicMinor = ScaleEngine.harmonicMinor(PitchClass.fromName('A'));
  console.log('A Harmonic Minor:', aHarmonicMinor.getPitches().map(p => p.toString()).join(' - '));
}

// ============================================================================
// EXAMPLE 3: Chord Extraction (Triads and Tetrads)
// ============================================================================
export function example3_chordExtraction() {
  console.log('\n=== EXAMPLE 3: Chord Extraction ===\n');
  
  const c = PitchClass.fromName('C');
  const cMajor = ScaleEngine.major(c);
  
  // Extract triads from each scale degree
  for (let degree = 1; degree <= 7; degree++) {
    const triad = cMajor.getTriad(degree);
    const names = triad.map(p => p.toString()).join('-');
    console.log(`Degree ${degree} triad: ${names}`);
  }
  
  console.log('\nSeventh chords:');
  
  // Extract tetrads
  const IMaj7 = cMajor.getTetrad(1);
  console.log('I maj7:', IMaj7.map(p => p.toString()).join('-'));
  
  const ii7 = cMajor.getTetrad(2);
  console.log('ii min7:', ii7.map(p => p.toString()).join('-'));
  
  const V7 = cMajor.getTetrad(5);
  console.log('V7:', V7.map(p => p.toString()).join('-'));
}

// ============================================================================
// EXAMPLE 4: Fretboard Mapping
// ============================================================================
export function example4_fretboardMapping() {
  console.log('\n=== EXAMPLE 4: Fretboard Mapping ===\n');
  
  const fretboard = new Fretboard();
  
  // Show tuning
  const tuning = fretboard.getOpenStrings();
  console.log('Standard 5-string tuning:', tuning.map(p => p.toString()).join(' - '));
  
  // Find all positions for a specific pitch
  const e = PitchClass.fromName('E');
  const ePositions = fretboard.getCoordinatesForPitch(e);
  console.log(`\nAll E notes on fretboard (${ePositions.length} positions):`);
  ePositions.slice(0, 6).forEach(coord => {
    console.log(`  String ${coord.string}, Fret ${coord.fret}`);
  });
  
  // Find positions for a chord
  const cMajor = ScaleEngine.major(PitchClass.fromName('C'));
  const cMajorTriad = cMajor.getTriad(1);
  const chordPositions = fretboard.getCoordinatesForPitches([...cMajorTriad]);
  console.log(`\nC Major chord positions: ${chordPositions.length} total`);
}

// ============================================================================
// EXAMPLE 5: Fretboard Visualization
// ============================================================================
export function example5_visualization() {
  console.log('\n=== EXAMPLE 5: Fretboard Visualization ===\n');
  
  const fretboard = new Fretboard();
  const aMajor = ScaleEngine.major(PitchClass.fromName('A'));
  
  // Visualize A major pentatonic (1, 2, 3, 5, 6)
  const pentatonic = [
    aMajor.getPitches()[0],  // A
    aMajor.getPitches()[1],  // B
    aMajor.getPitches()[2],  // C#
    aMajor.getPitches()[4],  // E
    aMajor.getPitches()[5],  // F#
  ];
  
  const coords = fretboard.getCoordinatesForPitches(pentatonic);
  console.log('A Major Pentatonic (frets 0-12):\n');
  renderFretboard(coords, { startFret: 0, endFret: 12 });
  
  // Visualize higher on the neck
  console.log('\nA Major Pentatonic (frets 10-20):\n');
  renderFretboard(coords, { startFret: 10, endFret: 20 });
}

// ============================================================================
// EXAMPLE 6: Optimal Path Finding
// ============================================================================
export function example6_pathFinding() {
  console.log('\n=== EXAMPLE 6: Optimal Path Finding ===\n');
  
  const fretboard = new Fretboard();
  const router = new ViterbiRouter(fretboard, {
    fretShiftWeight: 1.0,      // Cost of moving horizontally
    stringJumpWeight: 1.5,     // Cost of moving vertically
    maxFretStretch: 4          // Maximum comfortable stretch
  });
  
  // Walking bassline: A -> C# -> E -> A
  const bassline = [
    PitchClass.fromName('A'),
    PitchClass.fromName('C#'),
    PitchClass.fromName('E'),
    PitchClass.fromName('A')
  ];
  
  const path = router.findOptimalPath(bassline);
  const cost = router.calculatePathCost(path);
  
  console.log('Bassline: A -> C# -> E -> A');
  console.log(`Total movement cost: ${cost.toFixed(2)}\n`);
  
  path.forEach((node, idx) => {
    const stringNames = ['B', 'E', 'A', 'D', 'G'];
    console.log(`${idx + 1}. ${node.pitch.toString()} at ${stringNames[node.string]}${node.fret} (cost: ${node.cost.toFixed(2)})`);
  });
  
  console.log('\nPath visualization:');
  renderPath(path);
}

// ============================================================================
// EXAMPLE 7: Jazz ii-V-I Progression
// ============================================================================
export function example7_jazzProgression() {
  console.log('\n=== EXAMPLE 7: Jazz ii-V-I Progression ===\n');
  
  const fretboard = new Fretboard();
  const router = new ViterbiRouter(fretboard);
  
  const fMajor = ScaleEngine.major(PitchClass.fromName('F'));
  
  // Build ii-V-I in F major
  const ii7 = fMajor.getTetrad(2);   // G minor 7
  const V7 = fMajor.getTetrad(5);    // C7
  const IMaj7 = fMajor.getTetrad(1); // F major 7
  
  console.log('ii7 (G minor 7):', ii7.map(p => p.toString()).join('-'));
  console.log('V7 (C7):', V7.map(p => p.toString()).join('-'));
  console.log('I maj7 (F major 7):', IMaj7.map(p => p.toString()).join('-'));
  
  // Find optimal voice leading
  const progression = [...ii7, ...V7, ...IMaj7];
  const path = router.findOptimalPath(progression);
  const cost = router.calculatePathCost(path);
  
  console.log(`\nOptimal fingering (${path.length} notes, cost: ${cost.toFixed(2)})`);
  
  // Show first few positions
  path.slice(0, 8).forEach((node, idx) => {
    const stringNames = ['B', 'E', 'A', 'D', 'G'];
    console.log(`  ${idx + 1}. ${node.pitch.toString().padEnd(3)} at ${stringNames[node.string]}${node.fret}`);
  });
}

// ============================================================================
// EXAMPLE 8: Custom Tuning (Drop D)
// ============================================================================
export function example8_customTuning() {
  console.log('\n=== EXAMPLE 8: Custom Tuning (Drop D) ===\n');
  
  // Create Drop D tuning for 4-string bass
  const dropD = Fretboard.withTuning([
    PitchClass.fromName('D'),   // Dropped low D
    PitchClass.fromName('A'),
    PitchClass.fromName('D'),
    PitchClass.fromName('G')
  ]);
  
  const tuning = dropD.getOpenStrings();
  console.log('Drop D tuning:', tuning.map(p => p.toString()).join(' - '));
  
  // Find D power chord positions
  const d = PitchClass.fromName('D');
  const a = PitchClass.fromName('A');
  const powerChord = [d, a];
  
  const positions = dropD.getCoordinatesForPitches(powerChord);
  console.log(`\nD5 power chord positions: ${positions.length} total`);
}

// ============================================================================
// EXAMPLE 9: Modal Interchange
// ============================================================================
export function example9_modalInterchange() {
  console.log('\n=== EXAMPLE 9: Modal Interchange ===\n');
  
  const c = PitchClass.fromName('C');
  
  // Compare parallel modes
  const cIonian = ScaleEngine.major(c);           // C major
  const cDorian = ScaleEngine.dorian(c);           // C dorian
  const cPhrygian = ScaleEngine.phrygian(c);       // C phrygian
  const cLydian = ScaleEngine.lydian(c);           // C lydian
  const cMixolydian = ScaleEngine.mixolydian(c);   // C mixolydian
  const cAeolian = ScaleEngine.naturalMinor(c);    // C aeolian
  
  console.log('Parallel modes of C:\n');
  console.log('Ionian (major):', cIonian.getPitches().map(p => p.toString()).join('-'));
  console.log('Dorian:', cDorian.getPitches().map(p => p.toString()).join('-'));
  console.log('Phrygian:', cPhrygian.getPitches().map(p => p.toString()).join('-'));
  console.log('Lydian:', cLydian.getPitches().map(p => p.toString()).join('-'));
  console.log('Mixolydian:', cMixolydian.getPitches().map(p => p.toString()).join('-'));
  console.log('Aeolian (natural minor):', cAeolian.getPitches().map(p => p.toString()).join('-'));
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================
export function runAllExamples() {
  example1_pitchArithmetic();
  example2_scalesAndModes();
  example3_chordExtraction();
  example4_fretboardMapping();
  example5_visualization();
  example6_pathFinding();
  example7_jazzProgression();
  example8_customTuning();
  example9_modalInterchange();
}

// Uncomment to run:
// runAllExamples();
