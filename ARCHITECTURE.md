# Bass Music Engine - Architecture Documentation

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                         PRESENTATION                         │
│                    (Future: UI, SVG, CLI)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                          │
│  ┌──────────────────┐          ┌──────────────────────┐     │
│  │ ViterbiRouter    │          │  ConsoleViewer       │     │
│  │ - Pathfinding    │          │  - ASCII renderer    │     │
│  │ - Cost calc      │          │  - Visualization     │     │
│  └──────────────────┘          └──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         DOMAIN (CORE)                        │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐    │
│  │ PitchClass   │  │ ScaleEngine    │  │  Fretboard   │    │
│  │ - Mod 12     │  │ - Modes        │  │  - 5-string  │    │
│  │ - Intervals  │  │ - Triads       │  │  - Coords    │    │
│  │ - Immutable  │  │ - Tetrads      │  │  - Mapping   │    │
│  └──────────────┘  └────────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Flow

```
Infrastructure → Domain (✅ Allowed)
Domain → Infrastructure (❌ Forbidden)
Domain → Domain (✅ Allowed)
```

## Module Relationships

```
┌─────────────┐
│ PitchClass  │ ◄──┐
└─────────────┘    │
                   │
              ┌────┴──────┐
              │           │
        ┌─────▼──────┐    │
        │ ScaleEngine│    │
        └────────────┘    │
                          │
                    ┌─────▼─────┐
                    │ Fretboard │
                    └───────────┘
                          △
                          │
                    ┌─────┴──────┐
                    │            │
            ┌───────▼────┐  ┌────▼──────────┐
            │ViterbiRouter│  │ConsoleViewer │
            └────────────┘  └───────────────┘
```

## Data Flow Example: ii-V-I Progression

```
1. User Request
   └─> "Generate ii-V-I progression in C"

2. Domain Logic (ScaleEngine)
   └─> cMajor.getTetrad(2) → [D, F, A, C]
   └─> cMajor.getTetrad(5) → [G, B, D, F]
   └─> cMajor.getTetrad(1) → [C, E, G, B]

3. Physical Mapping (Fretboard)
   └─> getCoordinatesForPitches([D,F,A,C,G,B,D,F,C,E,G,B])
   └─> Returns all possible fretboard positions

4. Path Optimization (ViterbiRouter)
   └─> findOptimalPath([D,F,A,C,G,B,D,F,C,E,G,B])
   └─> Calculates lowest-cost trajectory
   └─> Returns: [{string:3,fret:0}, {string:3,fret:3}, ...]

5. Visualization (ConsoleViewer)
   └─> renderFretboard(path)
   └─> ASCII output to console
```

## Value Object Pattern (PitchClass)

```typescript
// Immutable value object with modulo arithmetic
const c = new PitchClass(0);
const g = c.add(7);              // Returns NEW PitchClass(7)
console.log(c.getValue());        // Still 0 (unchanged)

// All operations return new instances
const interval = c.intervalTo(g); // 7 semitones
const shortest = c.shortestIntervalTo(new PitchClass(11)); // 1
```

## Entity vs Value Object Design

| Class | Type | Identity | Mutability |
|-------|------|----------|------------|
| PitchClass | Value Object | By value | Immutable |
| ScaleEngine | Entity | By composition | Immutable |
| Fretboard | Entity | By configuration | Immutable |
| ViterbiRouter | Service | N/A | Stateless |

## Testing Strategy

```
Domain Layer (Pure Logic)
├── PitchClass.spec.ts
│   ├── Modulo arithmetic verification
│   ├── Negative interval handling
│   ├── Shortest distance calculation
│   └── Musical theory validation
│
└── ScaleEngine.spec.ts
    ├── Mode rotation correctness
    ├── Triad/tetrad extraction
    ├── Interval sum validation
    └── Musical theory integration

Infrastructure Layer (To be added)
├── ViterbiRouter.spec.ts (Future)
├── ConsoleViewer.spec.ts (Future)
└── Integration tests (Future)
```

## Extension Points (Future Enhancements)

1. **Alternative Tunings**
   ```typescript
   const dropD = Fretboard.withTuning([
     new PitchClass(2),  // D (dropped)
     new PitchClass(9),  // A
     new PitchClass(2),  // D
     new PitchClass(7)   // G
   ]);
   ```

2. **Viterbi Full Implementation**
   - Dynamic programming trellis
   - Beam search optimization
   - Fingering pattern constraints
   - Hand span analysis

3. **Rhythm Engine**
   - Temporal quantization
   - Swing feel calculations
   - Groove templates

4. **MIDI Integration**
   ```typescript
   interface MidiMapper {
     pitchToMidi(pitch: PitchClass, octave: number): number;
     coordToMidi(coord: FretboardCoordinate): number;
   }
   ```

## Design Principles Applied

✅ **Single Responsibility Principle**  
   Each class has one reason to change

✅ **Open/Closed Principle**  
   ScaleEngine extensible via factory methods

✅ **Liskov Substitution Principle**  
   Value objects replaceable without side effects

✅ **Interface Segregation Principle**  
   Small, focused interfaces (RoutingOptions, etc.)

✅ **Dependency Inversion Principle**  
   Infrastructure depends on domain, not vice versa

## Performance Characteristics

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| PitchClass.add() | O(1) | O(1) |
| ScaleEngine.getPitches() | O(n) | O(n) |
| Fretboard.getCoordinatesForPitches() | O(s×f×p) | O(matches) |
| ViterbiRouter.findOptimalPath() | O(n×c²) (greedy) | O(n×c) |

Where:
- n = number of notes in scale
- s = number of strings (5)
- f = number of frets (24)
- p = number of pitches to find
- c = candidates per pitch (avg ~10)

## Build Artifacts

```
dist/
├── domain/
│   ├── PitchClass.js
│   ├── PitchClass.d.ts
│   ├── ScaleEngine.js
│   ├── ScaleEngine.d.ts
│   ├── Fretboard.js
│   └── Fretboard.d.ts
├── infrastructure/
│   ├── ViterbiRouter.js
│   ├── ViterbiRouter.d.ts
│   ├── ConsoleViewer.js
│   └── ConsoleViewer.d.ts
└── index.js (barrel export)
```

## Usage in External Projects

```typescript
import { 
  PitchClass, 
  ScaleEngine, 
  Fretboard,
  ViterbiRouter,
  renderFretboard 
} from 'bajo-automata-core';

// Use the engine
const scale = ScaleEngine.major(PitchClass.fromName('C'));
const fretboard = new Fretboard();
const router = new ViterbiRouter(fretboard);

const path = router.findOptimalPath(scale.getPitches());
renderFretboard(path);
```
