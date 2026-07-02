/**
 * Demo - Showcases the bass music engine capabilities
 * Run with: npm run demo
 */

import { PitchClass } from './domain/PitchClass';
import { ScaleEngine } from './domain/ScaleEngine';
import { Fretboard } from './domain/Fretboard';
import { ViterbiRouter } from './infrastructure/ViterbiRouter';
import { renderFretboard, renderPath } from './infrastructure/ConsoleViewer';

console.log('=== Bass Music Engine Demo ===\n');

// 1. Pitch Class Arithmetic
console.log('1. PITCH CLASS ARITHMETIC');
console.log('-------------------------');
const c = PitchClass.fromName('C');
const perfectFifth = c.add(7);
console.log(`C + perfect fifth (7 semitones) = ${perfectFifth.toString()}`);

const descendingMinorThird = c.add(-3);
console.log(`C - minor third (3 semitones) = ${descendingMinorThird.toString()}`);

const cSharp = PitchClass.fromName('C#');
const distance = c.shortestIntervalTo(cSharp);
console.log(`Shortest distance from C to C# = ${distance} semitones\n`);

// 2. Scale Engine - Modes
console.log('2. SCALE ENGINE - MAJOR SCALE AND MODES');
console.log('----------------------------------------');
const cMajor = ScaleEngine.major(c);
const majorPitches = cMajor.getPitches();
console.log('C Major scale:', majorPitches.map(p => p.toString()).join(' - '));

const dDorian = cMajor.getMode(2);
const dorianPitches = dDorian.getPitches();
console.log('D Dorian (mode 2):', dorianPitches.map(p => p.toString()).join(' - '));

const ePhrygian = cMajor.getMode(3);
const phrygianPitches = ePhrygian.getPitches();
console.log('E Phrygian (mode 3):', phrygianPitches.map(p => p.toString()).join(' - '));
console.log();

// 3. Triads and Tetrads
console.log('3. TRIADS AND TETRADS FROM C MAJOR');
console.log('----------------------------------');
const [i1, i3, i5] = cMajor.getTriad(1);
console.log(`I triad (C major): ${i1.toString()} - ${i3.toString()} - ${i5.toString()}`);

const [ii1, ii3, ii5] = cMajor.getTriad(2);
console.log(`ii triad (D minor): ${ii1.toString()} - ${ii3.toString()} - ${ii5.toString()}`);

const [v1, v3, v5, v7] = cMajor.getTetrad(5);
console.log(`V7 tetrad (G7): ${v1.toString()} - ${v3.toString()} - ${v5.toString()} - ${v7.toString()}`);
console.log();

// 4. Fretboard Mapping
console.log('4. FRETBOARD MAPPING - 5-STRING BASS');
console.log('------------------------------------');
const fretboard = new Fretboard();
const openStrings = fretboard.getOpenStrings();
console.log('Standard tuning (low to high):', openStrings.map(p => p.toString()).join(' - '));

// Find all C notes on the fretboard
const cPitch = new PitchClass(0);
const cCoordinates = fretboard.getCoordinatesForPitch(cPitch);
console.log(`\nAll C notes on the fretboard (${cCoordinates.length} positions):`);
console.log(cCoordinates.slice(0, 5).map(coord => `String ${coord.string}, Fret ${coord.fret}`).join(' | '));
console.log();

// 5. Visualize C Major Scale on Fretboard
console.log('5. C MAJOR SCALE VISUALIZATION');
console.log('--------------------------------');
const cMajorCoords = fretboard.getCoordinatesForPitches(majorPitches);
renderFretboard(cMajorCoords, { startFret: 0, endFret: 12 });
console.log();

// 6. Visualize C Major Chord
console.log('6. C MAJOR TRIAD VISUALIZATION');
console.log('-------------------------------');
const cMajorTriad = cMajor.getTriad(1);
const triadCoords = fretboard.getCoordinatesForPitches([...cMajorTriad]);
renderFretboard(triadCoords, { startFret: 0, endFret: 12 });
console.log();

// 7. Viterbi Router - Optimal Path Finding
console.log('7. VITERBI ROUTER - OPTIMAL PATH FINDING');
console.log('-----------------------------------------');
const router = new ViterbiRouter(fretboard, {
  fretShiftWeight: 1.0,
  stringJumpWeight: 1.5,
  maxFretStretch: 4
});

// Find optimal path for a simple bassline: C -> E -> G -> C
const bassline = [
  new PitchClass(0),  // C
  new PitchClass(4),  // E
  new PitchClass(7),  // G
  new PitchClass(0)   // C (octave higher)
];

const optimalPath = router.findOptimalPath(bassline);
console.log('Bassline: C -> E -> G -> C');
console.log('Optimal fingering path:');
optimalPath.forEach((node, idx) => {
  const stringNames = ['B', 'E', 'A', 'D', 'G'];
  console.log(`  ${idx + 1}. ${node.pitch.toString()} at String ${stringNames[node.string]}, Fret ${node.fret} (cost: ${node.cost.toFixed(2)})`);
});

const totalCost = router.calculatePathCost(optimalPath);
console.log(`Total movement cost: ${totalCost.toFixed(2)}`);
console.log();

renderPath(optimalPath);

// 8. Advanced: ii-V-I Progression
console.log('8. ii-V-I JAZZ PROGRESSION IN C');
console.log('--------------------------------');
const dMin7 = cMajor.getTetrad(2);  // ii7
const g7 = cMajor.getTetrad(5);     // V7
const cMaj7 = cMajor.getTetrad(1);  // Imaj7

console.log('D minor 7:', dMin7.map(p => p.toString()).join(' - '));
console.log('G7:', g7.map(p => p.toString()).join(' - '));
console.log('C major 7:', cMaj7.map(p => p.toString()).join(' - '));

const progression = [...dMin7, ...g7, ...cMaj7];
const progressionPath = router.findOptimalPath(progression);
console.log(`\nOptimal path through ii-V-I (${progressionPath.length} notes, cost: ${router.calculatePathCost(progressionPath).toFixed(2)})`);
console.log();

console.log('=== Demo Complete ===');
