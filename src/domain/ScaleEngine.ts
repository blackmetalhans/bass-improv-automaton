import { PitchClass } from './PitchClass';

/**
 * ScaleEngine - Handles scale vector operations, modal derivations, and chord extraction
 * Supports rotation for modes and extraction of triads/tetrads based on scale degrees
 */
export class ScaleEngine {
  private readonly intervals: number[];
  private readonly root: PitchClass;

  /**
   * @param root - Root pitch class of the scale
   * @param intervals - Interval pattern (e.g., Major: [2,2,1,2,2,2,1])
   */
  constructor(root: PitchClass, intervals: number[]) {
    this.root = root;
    this.intervals = [...intervals];
    
    if (this.intervals.reduce((sum, interval) => sum + interval, 0) !== 12) {
      throw new Error('Scale intervals must sum to 12');
    }
  }

  /**
   * Returns all pitch classes in the scale
   */
  getPitches(): PitchClass[] {
    const pitches: PitchClass[] = [this.root];
    let currentPitch = this.root;

    for (let i = 0; i < this.intervals.length - 1; i++) {
      currentPitch = currentPitch.add(this.intervals[i]);
      pitches.push(currentPitch);
    }

    return pitches;
  }

  /**
   * Returns a mode of the scale via rotation
   * @param degree - Scale degree (1-based, 1 = Ionian/original scale)
   * @returns New ScaleEngine instance representing the mode
   */
  getMode(degree: number): ScaleEngine {
    if (degree < 1 || degree > this.intervals.length) {
      throw new Error(`Invalid mode degree: ${degree}. Must be between 1 and ${this.intervals.length}`);
    }

    const rotationIndex = degree - 1;
    const rotatedIntervals = [
      ...this.intervals.slice(rotationIndex),
      ...this.intervals.slice(0, rotationIndex)
    ];

    const pitches = this.getPitches();
    const newRoot = pitches[rotationIndex];

    return new ScaleEngine(newRoot, rotatedIntervals);
  }

  /**
   * Extracts a triad from a specific scale degree
   * @param degree - Scale degree (1-based)
   * @returns Array of three pitch classes forming the triad (root, third, fifth)
   */
  getTriad(degree: number): [PitchClass, PitchClass, PitchClass] {
    const pitches = this.getPitches();
    
    if (degree < 1 || degree > pitches.length) {
      throw new Error(`Invalid scale degree: ${degree}`);
    }

    const rootIndex = degree - 1;
    const thirdIndex = (rootIndex + 2) % pitches.length;
    const fifthIndex = (rootIndex + 4) % pitches.length;

    return [
      pitches[rootIndex],
      pitches[thirdIndex],
      pitches[fifthIndex]
    ];
  }

  /**
   * Extracts a tetrad (seventh chord) from a specific scale degree
   * @param degree - Scale degree (1-based)
   * @returns Array of four pitch classes forming the tetrad (root, third, fifth, seventh)
   */
  getTetrad(degree: number): [PitchClass, PitchClass, PitchClass, PitchClass] {
    const pitches = this.getPitches();
    
    if (degree < 1 || degree > pitches.length) {
      throw new Error(`Invalid scale degree: ${degree}`);
    }

    const rootIndex = degree - 1;
    const thirdIndex = (rootIndex + 2) % pitches.length;
    const fifthIndex = (rootIndex + 4) % pitches.length;
    const seventhIndex = (rootIndex + 6) % pitches.length;

    return [
      pitches[rootIndex],
      pitches[thirdIndex],
      pitches[fifthIndex],
      pitches[seventhIndex]
    ];
  }

  /**
   * Returns the interval pattern of the scale
   */
  getIntervals(): number[] {
    return [...this.intervals];
  }

  /**
   * Returns the root pitch class
   */
  getRoot(): PitchClass {
    return this.root;
  }

  /**
   * Factory methods for common scales
   */
  static major(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 2, 1, 2, 2, 2, 1]);
  }

  static naturalMinor(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 1, 2, 2, 1, 2, 2]);
  }

  static harmonicMinor(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 1, 2, 2, 1, 3, 1]);
  }

  static melodicMinor(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 1, 2, 2, 2, 2, 1]);
  }

  static dorian(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 1, 2, 2, 2, 1, 2]);
  }

  static phrygian(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [1, 2, 2, 2, 1, 2, 2]);
  }

  static lydian(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 2, 2, 1, 2, 2, 1]);
  }

  static mixolydian(root: PitchClass): ScaleEngine {
    return new ScaleEngine(root, [2, 2, 1, 2, 2, 1, 2]);
  }
}
