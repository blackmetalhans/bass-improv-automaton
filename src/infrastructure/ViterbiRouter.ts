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
 * ViterbiRouter - Ergonomic routing service using Viterbi dynamic programming
 * Finds globally optimal physical trajectories on the fretboard that minimize:
 * - Horizontal fret shifts
 * - Vertical string jumps
 * 
 * Uses the Viterbi algorithm to guarantee the absolute minimum-cost path through
 * a sequence of pitches by considering all possible state transitions.
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
   * Uses Viterbi algorithm with dynamic programming to minimize total physical movement cost
   * 
   * @param targetPitches - Ordered sequence of pitches to play (chord progression or melody)
   * @returns Optimal path as array of coordinates with associated costs
   * 
   * Algorithm:
   * 1. Build trellis of all possible coordinates for each pitch (columns)
   * 2. Initialize first column with start costs (middle-string/lower-fret preference)
   * 3. For each subsequent column, compute minimum accumulated cost via DP
   * 4. Store backpointers to track optimal predecessor at each state
   * 5. Backtrack from minimum final state to reconstruct optimal path
   */
  findOptimalPath(targetPitches: PitchClass[]): PathNode[] {
    if (targetPitches.length === 0) {
      return [];
    }

    // Internal state structure for DP trellis
    interface TrellisState {
      coordinate: FretboardCoordinate;
      accumulatedCost: number;
      backpointer: number | null; // Index in previous column, null for t=0
    }

    // Build trellis: array of columns, each column is array of states
    const trellis: TrellisState[][] = [];

    // Column 0: Initialize with start costs
    const firstPitchCandidates = this.fretboard.getCoordinatesForPitch(targetPitches[0]);
    
    if (firstPitchCandidates.length === 0) {
      throw new Error(`No fretboard positions found for pitch ${targetPitches[0].toString()}`);
    }

    const firstColumn: TrellisState[] = firstPitchCandidates.map(coord => {
      // Start cost: prefer middle strings (string 2) and lower frets for natural grounding
      const middleStringPreference = Math.abs(coord.string - 2);
      const fretPreference = coord.fret;
      const startCost = middleStringPreference + fretPreference * 0.5;

      return {
        coordinate: coord,
        accumulatedCost: startCost,
        backpointer: null
      };
    });

    trellis.push(firstColumn);

    // Columns 1..n: Dynamic programming forward pass
    for (let t = 1; t < targetPitches.length; t++) {
      const currentPitchCandidates = this.fretboard.getCoordinatesForPitch(targetPitches[t]);
      
      if (currentPitchCandidates.length === 0) {
        throw new Error(`No fretboard positions found for pitch ${targetPitches[t].toString()}`);
      }

      const currentColumn: TrellisState[] = [];
      const previousColumn = trellis[t - 1];

      // For each candidate in current column
      for (const candidate of currentPitchCandidates) {
        let minAccumulatedCost = Infinity;
        let bestPredecessorIndex = 0;

        // Find best predecessor from previous column
        for (let predIndex = 0; predIndex < previousColumn.length; predIndex++) {
          const predecessor = previousColumn[predIndex];
          const transitionCost = this.calculateTransitionCost(
            predecessor.coordinate,
            candidate
          );
          const totalCost = predecessor.accumulatedCost + transitionCost;

          if (totalCost < minAccumulatedCost) {
            minAccumulatedCost = totalCost;
            bestPredecessorIndex = predIndex;
          }
        }

        currentColumn.push({
          coordinate: candidate,
          accumulatedCost: minAccumulatedCost,
          backpointer: bestPredecessorIndex
        });
      }

      trellis.push(currentColumn);
    }

    // Find minimum cost state in final column
    const finalColumn = trellis[trellis.length - 1];
    let minFinalCost = Infinity;
    let bestFinalStateIndex = 0;

    for (let i = 0; i < finalColumn.length; i++) {
      if (finalColumn[i].accumulatedCost < minFinalCost) {
        minFinalCost = finalColumn[i].accumulatedCost;
        bestFinalStateIndex = i;
      }
    }

    // Backtrack to reconstruct optimal path
    const path: PathNode[] = [];
    let currentStateIndex = bestFinalStateIndex;

    for (let t = trellis.length - 1; t >= 0; t--) {
      const state = trellis[t][currentStateIndex];
      
      // Calculate step-transition cost for this node
      let stepCost = 0;
      if (t === 0) {
        stepCost = state.accumulatedCost; // Start cost for first node
      } else {
        const previousState = trellis[t - 1][state.backpointer!];
        stepCost = state.accumulatedCost - previousState.accumulatedCost;
      }

      // Prepend to path (we're going backwards)
      path.unshift({
        ...state.coordinate,
        pitch: targetPitches[t],
        cost: stepCost
      });

      // Move to predecessor
      if (state.backpointer !== null) {
        currentStateIndex = state.backpointer;
      }
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
