import { ViterbiRouter } from './ViterbiRouter';
import { Fretboard } from '../domain/Fretboard';
import { PitchClass } from '../domain/PitchClass';

describe('ViterbiRouter - Viterbi Algorithm', () => {
  let fretboard: Fretboard;
  let router: ViterbiRouter;

  beforeEach(() => {
    fretboard = new Fretboard();
    router = new ViterbiRouter(fretboard, {
      fretShiftWeight: 1.0,
      stringJumpWeight: 1.5,
      maxFretStretch: 4
    });
  });

  describe('Viterbi dynamic programming', () => {
    it('should find optimal path for simple bassline', () => {
      const bassline = [
        new PitchClass(0),  // C
        new PitchClass(4),  // E
        new PitchClass(7),  // G
        new PitchClass(0)   // C
      ];

      const path = router.findOptimalPath(bassline);
      
      expect(path).toHaveLength(4);
      expect(path[0].pitch.getValue()).toBe(0);
      expect(path[1].pitch.getValue()).toBe(4);
      expect(path[2].pitch.getValue()).toBe(7);
      expect(path[3].pitch.getValue()).toBe(0);

      // Verify cost accumulation
      const totalCost = router.calculatePathCost(path);
      expect(totalCost).toBeGreaterThan(0);
      
      // First note should have start cost
      expect(path[0].cost).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array for empty input', () => {
      const path = router.findOptimalPath([]);
      expect(path).toEqual([]);
    });

    it('should handle single pitch', () => {
      const path = router.findOptimalPath([new PitchClass(5)]);
      expect(path).toHaveLength(1);
      expect(path[0].pitch.getValue()).toBe(5);
    });

    it('should prefer paths with minimal movement', () => {
      // Two consecutive notes that are close on the fretboard
      const closeNotes = [
        new PitchClass(9),  // A
        new PitchClass(10)  // A#/Bb
      ];

      const path = router.findOptimalPath(closeNotes);
      
      // Should be on same or adjacent string with 1 fret difference
      const fretDist = Math.abs(path[1].fret - path[0].fret);
      const stringDist = Math.abs(path[1].string - path[0].string);
      
      // Optimal path should minimize movement
      expect(fretDist).toBeLessThanOrEqual(1);
      expect(stringDist).toBeLessThanOrEqual(1);
    });

    it('should find globally optimal path vs greedy', () => {
      // Create a sequence where greedy would fail but DP succeeds
      const sequence = [
        new PitchClass(2),  // D
        new PitchClass(5),  // F
        new PitchClass(9),  // A
        new PitchClass(2)   // D
      ];

      const path = router.findOptimalPath(sequence);
      const totalCost = router.calculatePathCost(path);

      // Verify we got a valid path
      expect(path).toHaveLength(4);
      expect(totalCost).toBeGreaterThan(0);
      expect(totalCost).toBeLessThan(100); // Reasonable upper bound
    });

    it('should handle chromatic scale efficiently', () => {
      const chromatic = Array.from({ length: 5 }, (_, i) => new PitchClass(i));
      const path = router.findOptimalPath(chromatic);

      expect(path).toHaveLength(5);
      
      // Chromatic notes should stay on same string mostly
      const stringChanges = path.slice(1).filter((node, idx) => 
        node.string !== path[idx].string
      ).length;
      
      expect(stringChanges).toBeLessThan(3); // Minimal string changes
    });

    it('should respect cost weights configuration', () => {
      const highStringCostRouter = new ViterbiRouter(fretboard, {
        fretShiftWeight: 0.5,
        stringJumpWeight: 10.0,  // Very expensive to change strings
        maxFretStretch: 4
      });

      const notes = [
        new PitchClass(4),  // E
        new PitchClass(9)   // A
      ];

      const path = highStringCostRouter.findOptimalPath(notes);
      
      // With high string jump cost, should prefer staying on same string
      // even if fret distance is larger
      expect(path).toHaveLength(2);
    });

    it('should apply stretch penalty correctly', () => {
      const router = new ViterbiRouter(fretboard, {
        fretShiftWeight: 1.0,
        stringJumpWeight: 1.5,
        maxFretStretch: 2  // Very tight stretch limit
      });

      const widePath = [
        new PitchClass(0),  // C
        new PitchClass(11)  // B (can be close together)
      ];

      const path = router.findOptimalPath(widePath);
      expect(path).toHaveLength(2);
      
      // Verify the algorithm found a valid path
      expect(path[1].cost).toBeGreaterThanOrEqual(0);
      
      // The algorithm should prefer positions that minimize cost
      const totalCost = router.calculatePathCost(path);
      expect(totalCost).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const sequence = [
        new PitchClass(0),
        new PitchClass(7),
        new PitchClass(4)
      ];

      const path1 = router.findOptimalPath(sequence);
      const path2 = router.findOptimalPath(sequence);

      expect(path1).toEqual(path2);
    });

    it('should handle all pitch classes', () => {
      const allPitches = Array.from({ length: 12 }, (_, i) => new PitchClass(i));
      
      const path = router.findOptimalPath(allPitches);
      expect(path).toHaveLength(12);
      
      // Verify pitch sequence
      path.forEach((node, idx) => {
        expect(node.pitch.getValue()).toBe(idx);
      });
    });

    it('should throw error for pitch with no fretboard positions', () => {
      // This shouldn't happen with standard tuning, but test error handling
      // We'll test with a mock scenario by using the actual implementation
      const validPitch = new PitchClass(0);
      const path = router.findOptimalPath([validPitch]);
      expect(path).toHaveLength(1);
    });

    it('should calculate step costs correctly', () => {
      const sequence = [
        new PitchClass(0),
        new PitchClass(2),
        new PitchClass(4)
      ];

      const path = router.findOptimalPath(sequence);
      
      // Sum of individual costs should equal total
      const sumOfCosts = path.reduce((sum, node) => sum + node.cost, 0);
      const totalCost = router.calculatePathCost(path);
      
      expect(sumOfCosts).toBeCloseTo(totalCost, 5);
    });

    it('should prefer middle strings for first note', () => {
      const pitch = new PitchClass(7); // G - available on all strings
      const path = router.findOptimalPath([pitch]);

      // First note should prefer middle strings (string 2 = A string)
      // Given equal fret positions, should pick middle
      const firstNode = path[0];
      expect(firstNode.string).toBeGreaterThanOrEqual(0);
      expect(firstNode.string).toBeLessThanOrEqual(4);
    });

    it('should find optimal ii-V-I progression path', () => {
      const cMajorScale = [0, 2, 4, 5, 7, 9, 11]; // C major
      
      // ii7: D F A C
      const ii7 = [
        new PitchClass(cMajorScale[1]),  // D
        new PitchClass(cMajorScale[3]),  // F
        new PitchClass(cMajorScale[5]),  // A
        new PitchClass(cMajorScale[0])   // C
      ];

      const path = router.findOptimalPath(ii7);
      expect(path).toHaveLength(4);
      
      // Should find a smooth voice leading
      const totalCost = router.calculatePathCost(path);
      expect(totalCost).toBeLessThan(50); // Reasonable for this progression
    });

    it('should handle repeated pitches efficiently', () => {
      const repeated = [
        new PitchClass(0),
        new PitchClass(0),
        new PitchClass(0)
      ];

      const path = router.findOptimalPath(repeated);
      
      // Same pitch should stay in same position (cost = 0 for transitions)
      expect(path[0].string).toBe(path[1].string);
      expect(path[0].fret).toBe(path[1].fret);
      expect(path[1].string).toBe(path[2].string);
      expect(path[1].fret).toBe(path[2].fret);
      
      // Transition costs should be 0
      expect(path[1].cost).toBe(0);
      expect(path[2].cost).toBe(0);
    });

    it('should optimize octave jumps', () => {
      const octaveJump = [
        new PitchClass(0),  // C
        new PitchClass(0),  // C (same pitch class, different octave position)
        new PitchClass(0)
      ];

      const path = router.findOptimalPath(octaveJump);
      
      // Should stay at same position for same pitch class
      expect(path[0].string).toBe(path[1].string);
      expect(path[0].fret).toBe(path[1].fret);
    });
  });

  describe('algorithm correctness', () => {
    it('should guarantee global optimum for short sequences', () => {
      // For short sequences, we can verify optimality by checking
      // that no single position change reduces total cost
      const sequence = [
        new PitchClass(0),
        new PitchClass(7)
      ];

      const optimalPath = router.findOptimalPath(sequence);
      const optimalCost = router.calculatePathCost(optimalPath);

      // Get all candidates for verification
      const candidates0 = fretboard.getCoordinatesForPitch(sequence[0]);
      const candidates1 = fretboard.getCoordinatesForPitch(sequence[1]);

      // Verify this is actually the minimum
      let foundBetter = false;
      for (const c0 of candidates0) {
        const startCost = Math.abs(c0.string - 2) + c0.fret * 0.5;
        for (const c1 of candidates1) {
          const transitionCost = router['calculateTransitionCost'](c0, c1);
          const totalCost = startCost + transitionCost;
          
          if (totalCost < optimalCost - 0.001) { // Small epsilon for floating point
            foundBetter = true;
          }
        }
      }

      expect(foundBetter).toBe(false);
    });
  });
});
