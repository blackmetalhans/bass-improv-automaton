# Bass Music Engine - Core Domain

English · Español: [Español](README.es.md)

A pure TypeScript implementation of a 5-string bass music theory engine following Clean Architecture principles. This repository contains a testable, domain-focused vertical slice with no UI, rendering, or external dependencies.

## Architecture

```
src/
├── domain/              # Pure music theory logic (no dependencies)
│   ├── PitchClass.ts           # Modulo-12 pitch class arithmetic
│   ├── ScaleEngine.ts          # Scale vectors, modes, triads/tetrads
│   ├── Fretboard.ts            # 5-string bass coordinate system
│   ├── PitchClass.spec.ts      # Unit tests
│   └── ScaleEngine.spec.ts     # Unit tests
│
└── infrastructure/      # Technical implementations
    ├── ViterbiRouter.ts        # Ergonomic pathfinding (Viterbi DP)
    └── ConsoleViewer.ts        # ASCII fretboard visualization
```

## Features

### 1. PitchClass — Modulo-12 value object
- Represents pitch classes (0=C, 1=C#, ..., 11=B)
- Immutable interval arithmetic (add/subtract)
- Handles negative intervals (descending)
- Shortest interval distance computation
- Factory for note name parsing

Example:

```typescript
const c = PitchClass.fromName('C');
const perfectFifth = c.add(7); // G
```

### 2. ScaleEngine — Scale vectors & modes
- Accepts interval patterns (Major, Minor, etc.)
- Produces modal rotations (all 7 modes)
- Extracts triads and tetrads from scale degrees

Example:

```typescript
const cMajor = ScaleEngine.major(new PitchClass(0));
const dDorian = cMajor.getMode(2);
```

### 3. Fretboard — 5-string bass mapping
- 24 frets, standard tuning: B, E, A, D, G
- Coordinate system: `{ string: 0-4, fret: 0-24 }`
- Map pitch classes to all positions on the neck

### 4. ViterbiRouter — Ergonomic path optimization
- Implements the Viterbi dynamic programming algorithm
- Finds the global minimum-cost fingering path for a sequence of pitches
- Configurable weights: fret shifts, string jumps, and stretch penalty

Example:

```typescript
const router = new ViterbiRouter(fretboard, {
  fretShiftWeight: 1.0,
  stringJumpWeight: 1.5,
  maxFretStretch: 4
});
const path = router.findOptimalPath([c, e, g, c]);
```

### 5. ConsoleViewer — ASCII visualization
- Render fretboard with highlighted nodes
- Show chord shapes and fingering paths

Example:

```typescript
renderFretboard(coordinates, { startFret: 0, endFret: 12 });
renderPath(optimalPath);
```

## Installation

```bash
npm install
```

## Usage

Run tests:

```bash
npm test
npm run test:coverage
```

Run demos:

```bash
npm run demo         # General demo
npm run demo:viterbi # Viterbi-focused demo
```

Build:

```bash
npm run build
```

## Testing & Coverage
- Domain layer fully tested (PitchClass, ScaleEngine)
- ViterbiRouter includes comprehensive integration tests
- Run `npm run test:coverage` for coverage report

## Design Principles
- Clean Architecture: domain isolated from infrastructure
- Immutability: value objects are immutable
- Strict TypeScript: strong typing and safety
- Testability: pure functions and unit tests

## Roadmap
- Extended fingering constraints (finger numbers)
- Temporal weighting and rhythmic integration
- MIDI and synthesis integrations (future)

## License
ISC

---

This project focuses on domain correctness and ergonomic fingering; UI and audio synthesis are intentionally out of scope.