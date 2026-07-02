import { PitchClass } from '../domain/PitchClass';
import { Fretboard, FretboardCoordinate } from '../domain/Fretboard';

/**
 * PathNode - Represents a node in the optimal path
 */
export interface PathNode extends FretboardCoordinate {
  pitch: PitchClass;
  cost: number;
}

/**
 * RoutingOptions - Configuration for path optimization
 */
export interface RoutingOptions {
  fretShiftWeight?: number;    // Weight for horizontal movement (default: 1.0)
  stringJumpWeight?: number;   // Weight for vertical movement (default: 1.5)
  maxFretStretch?: number;     // Maximum comfortable fret span (default: 4)
}

/**
 * ViterbiRouter - Ergonomic routing service using Viterbi pathfinding
 * Finds optimal physical trajectories on the fretboard that minimize:
 * - Horizontal fret shifts
 * - Vertical string jumps
 * 
 * This is a skeletal implementation that will be expanded with full Viterbi logic
 */
export class ViterbiRouter {
  private readonly fretboard: Fretboard;
  private readonly options: Required<RoutingOptions>;

  constructor(fretboard: Fretboard, options: RoutingOptions = {}) {
    this.fretboard = fretboard;
    this.options = {
      fretShiftWeight: options.fretShiftWeight ?? 1.0,
      stringJumpWeight: options.stringJumpWeight ?? 1.5,
      maxFretStretch: options.maxFretStretch ?? 4
    };
  }

  /**
   * Calculates the movement cost between two coordinates
   * @param from - Starting coordinate
   * @param to - Ending coordinate
   * @returns Movement cost (lower is better)
   */
  private calculateTransitionCost(from: FretboardCoordinate, to: FretboardCoordinate): number {
    const fretDistance = Math.abs(to.fret - from.fret);
    const stringDistance = Math.abs(to.string - from.string);

    const fretCost = fretDistance * this.options.fretShiftWeight;
    const stringCost = stringDistance * this.options.stringJumpWeight;

    // Add penalty for stretches beyond comfortable range
    const stretchPenalty = fretDistance > this.options.maxFretStretch 
      ? (fretDistance - this.options.maxFretStretch) * 2 
      : 0;

    return fretCost + stringCost + stretchPenalty;
  }

  /**
   * Finds the optimal path through a sequence of target pitches
   * Uses Viterbi algorithm to minimize total physical movement cost
   * 
   * @param targetPitches - Ordered sequence of pitches to play (chord progression or melody)
   * @returns Optimal path as array of coordinates with associated costs
   * 
   * NOTE: This is a placeholder implementation. Full Viterbi logic will:
   * 1. Build trellis of all possible coordinates for each pitch
   * 2. Calculate transition costs between all states
   * 3. Use dynamic programming to find minimum-cost path
   * 4. Backtrack to reconstruct optimal sequence
   */
  findOptimalPath(targetPitches: PitchClass[]): PathNode[] {
    if (targetPitches.length === 0) {
      return [];
    }

    // PLACEHOLDER LOGIC - Returns simplest path using middle position preference
    const path: PathNode[] = [];
    let previousCoord: FretboardCoordinate | null = null;

    for (const pitch of targetPitches) {
      const candidates = this.fretboard.getCoordinatesForPitch(pitch);
      
      if (candidates.length === 0) {
        throw new Error(`No fretboard positions found for pitch ${pitch.toString()}`);
      }

      let bestCandidate = candidates[0];
      let bestCost = Infinity;

      if (previousCoord === null) {
        // First note: prefer middle strings and lower frets for ergonomics
        bestCandidate = candidates.reduce((best, current) => {
          const middleStringPreference = Math.abs(current.string - 2);
          const fretPreference = current.fret;
          const currentScore = middleStringPreference + fretPreference * 0.5;
          
          const bestMiddleStringPreference = Math.abs(best.string - 2);
          const bestFretPreference = best.fret;
          const bestScore = bestMiddleStringPreference + bestFretPreference * 0.5;
          
          return currentScore < bestScore ? current : best;
        });
        bestCost = 0;
      } else {
        // Subsequent notes: minimize transition cost
        for (const candidate of candidates) {
          const cost = this.calculateTransitionCost(previousCoord, candidate);
          if (cost < bestCost) {
            bestCost = cost;
            bestCandidate = candidate;
          }
        }
      }

      path.push({
        ...bestCandidate,
        pitch,
        cost: bestCost
      });

      previousCoord = bestCandidate;
    }

    return path;
  }

  /**
   * Calculates the total cost of a given path
   */
  calculatePathCost(path: PathNode[]): number {
    return path.reduce((total, node) => total + node.cost, 0);
  }

  /**
   * Returns all possible paths through the target pitches (for comparison/analysis)
   * NOTE: This will be used for validation and testing of the Viterbi implementation
   */
  getAllPossiblePaths(targetPitches: PitchClass[]): PathNode[][] {
    // PLACEHOLDER: Will be implemented for comprehensive path enumeration
    // Used for validating that Viterbi finds the true optimal path
    return [this.findOptimalPath(targetPitches)];
  }
}
