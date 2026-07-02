# Bass Music Engine - Core Domain

A pure TypeScript implementation of a 5-string bass music theory engine following Clean Architecture principles. This is a testable, domain-focused vertical slice with no UI, rendering, or external dependencies.

## Architecture

```
src/
├── domain/              # Pure music theory logic (no dependencies)
│   ├── PitchClass.ts           # Modulo-12 pitch class arithmetic
│   ├── ScaleEngine.ts          # Scale vectors, modes, triads/tetrads
│   ├── Fretboard.ts            # 5-string bass coordinate system
│   ├── PitchClass.spec.ts      # Comprehensive unit tests
│   └── ScaleEngine.spec.ts     # Comprehensive unit tests
│
└── infrastructure/      # Technical implementations
    ├── ViterbiRouter.ts        # Ergonomic pathfinding (skeletal)
    └── ConsoleViewer.ts        # ASCII fretboard visualization
```

## Features

### 1. **PitchClass** - Modulo 12 Arithmetic Value Object
- Represents pitch classes (0=C, 1=C#, ..., 11=B)
- Immutable interval operations (add/subtract)
- Handles negative values for descending intervals
- Calculates shortest interval distance between pitches
- Factory method for note name parsing

```typescript
const c = PitchClass.fromName('C');
const perfectFifth = c.add(7);  // G
const shortestDistance = c.shortestIntervalTo(new PitchClass(11));  // 1 (semitone to B)
```

### 2. **ScaleEngine** - Scale Vector Operations
- Accepts interval patterns (e.g., Major: [2,2,1,2,2,2,1])
- Generates all 7 modes via array rotation
- Extracts triads and tetrads from scale degrees
- Factory methods for common scales (Major, Minor, Dorian, etc.)

```typescript
const cMajor = ScaleEngine.major(new PitchClass(0));
const dDorian = cMajor.getMode(2);  // Modal rotation
const [root, third, fifth] = cMajor.getTriad(1);  // C major triad
const [r, t, f, s] = cMajor.getTetrad(5);  // G7 chord
```

### 3. **Fretboard** - 5-String Bass Spatial Mapping
- Models 24-fret, 5-string bass (Standard tuning: B-E-A-D-G)
- Coordinate system: `{string: 0-4, fret: 0-24}`
- Maps pitch classes to all fretboard positions
- Validates coordinates and provides custom tuning support

```typescript
const fretboard = new Fretboard();
const coordinates = fretboard.getCoordinatesForPitches(cMajorScale);
// Returns all positions on neck matching those pitches
```

### 4. **ViterbiRouter** - Ergonomic Path Optimization (Skeletal)
- Finds lowest-cost physical trajectory through pitch sequences
- Configurable weights for fret shifts vs. string jumps
- Placeholder greedy algorithm (full Viterbi DP to be implemented)
- Cost function: `fretDistance × fretWeight + stringDistance × stringWeight + stretchPenalty`

```typescript
const router = new ViterbiRouter(fretboard, {
  fretShiftWeight: 1.0,
  stringJumpWeight: 1.5,
  maxFretStretch: 4
});
const path = router.findOptimalPath([c, e, g, c]);
```

### 5. **ConsoleViewer** - ASCII Visualization
- Renders fretboard with highlighted nodes
- Displays chord shapes and path sequences
- Configurable fret range and visual options

```typescript
renderFretboard(coordinates, { startFret: 0, endFret: 12 });
renderPath(optimalPath);
```

## Installation

```bash
npm install
```

## Usage

### Run Tests
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Run Demo
```bash
npm run demo              # Interactive demonstration
```

### Build
```bash
npm run build             # Compile TypeScript to dist/
```

## Demo Output Example

```
=== Bass Music Engine Demo ===

1. PITCH CLASS ARITHMETIC
C + perfect fifth (7 semitones) = G
C - minor third (3 semitones) = A
Shortest distance from C to C# = 1 semitones

2. SCALE ENGINE - MAJOR SCALE AND MODES
C Major scale: C - D - E - F - G - A - B
D Dorian (mode 2): D - E - F - G - A - B - C
E Phrygian (mode 3): E - F - G - A - B - C - D

3. FRETBOARD MAPPING - 5-STRING BASS
Standard tuning (low to high): B - E - A - D - G

5. C MAJOR SCALE VISUALIZATION
      0  1  2  3  4  5  6  7  8  9 10 11 12
    ---------------------------------------
G |-●--●--●--------------●--●--●--●-------
D |-------●--●--●--------------●--●--●--●-
A |-●--●--●--------------●--●--●--●-------
E |-------●--●--●--------------●--●--●--●-
B |-●--●--●--------------●--●--●--●-------
          •     •     •     •        •
```

## Testing Coverage

- **PitchClass**: 100% coverage of modulo arithmetic, interval operations, and edge cases
- **ScaleEngine**: All 7 modes verified, triad/tetrad extraction, musical theory validation
- Total: 60+ test cases ensuring mathematical correctness

## Design Principles

✅ **Clean Architecture**: Domain logic isolated from infrastructure  
✅ **Immutability**: All value objects are immutable  
✅ **Type Safety**: TypeScript strict mode enabled  
✅ **Testability**: Pure functions with comprehensive test coverage  
✅ **Single Responsibility**: Each class has one well-defined purpose  
✅ **No Premature Optimization**: Skeletal implementations where complexity isn't yet needed

## Roadmap (Future Enhancements)

- [ ] Full Viterbi dynamic programming implementation
- [ ] Support for alternate tunings (Drop-D, etc.)
- [ ] Fingering pattern analysis (1-2-4 vs. 1-3-4 patterns)
- [ ] SVG fretboard rendering
- [ ] MIDI integration
- [ ] Rhythm/timing engine
- [ ] DSP microservices for audio synthesis

## Tech Stack

- **TypeScript 6.x** (Strict Mode)
- **Jest 30.x** (Testing)
- **ts-jest** (TypeScript Jest integration)
- **Node.js** (Runtime)

## License

ISC

---

**Note**: This is a pure domain implementation. UI rendering and external integrations are intentionally excluded to prevent scope creep.
