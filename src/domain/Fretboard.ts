import { PitchClass } from './PitchClass';

/**
 * FretboardCoordinate - Represents a position on the fretboard
 */
export interface FretboardCoordinate {
  string: number;  // 0-4 (B, E, A, D, G)
  fret: number;    // 0-24
}

/**
 * Fretboard - Models a 24-fret, 5-string bass in standard tuning
 * String 0: B (11)
 * String 1: E (4)
 * String 2: A (9)
 * String 3: D (2)
 * String 4: G (7)
 */
export class Fretboard {
  private readonly NUM_STRINGS = 5;
  private readonly NUM_FRETS = 24;
  
  // Standard 5-string bass tuning (low to high): B0, E1, A1, D2, G2
  private readonly openStringPitches: PitchClass[] = [
    new PitchClass(11), // B
    new PitchClass(4),  // E
    new PitchClass(9),  // A
    new PitchClass(2),  // D
    new PitchClass(7)   // G
  ];

  /**
   * Gets the pitch class at a specific fretboard coordinate
   * @param coordinate - Fretboard position
   * @returns PitchClass at that position
   */
  getPitchAt(coordinate: FretboardCoordinate): PitchClass {
    this.validateCoordinate(coordinate);
    return this.openStringPitches[coordinate.string].add(coordinate.fret);
  }

  /**
   * Returns all coordinates on the fretboard that match any of the given pitches
   * @param pitches - Array of pitch classes to find
   * @returns Array of all matching coordinates
   */
  getCoordinatesForPitches(pitches: PitchClass[]): FretboardCoordinate[] {
    const coordinates: FretboardCoordinate[] = [];
    const pitchValues = new Set(pitches.map(p => p.getValue()));

    for (let string = 0; string < this.NUM_STRINGS; string++) {
      for (let fret = 0; fret <= this.NUM_FRETS; fret++) {
        const coordinate: FretboardCoordinate = { string, fret };
        const pitchAtPosition = this.getPitchAt(coordinate);
        
        if (pitchValues.has(pitchAtPosition.getValue())) {
          coordinates.push(coordinate);
        }
      }
    }

    return coordinates;
  }

  /**
   * Returns all coordinates for a single pitch class
   * @param pitch - Pitch class to find
   * @returns Array of all matching coordinates
   */
  getCoordinatesForPitch(pitch: PitchClass): FretboardCoordinate[] {
    return this.getCoordinatesForPitches([pitch]);
  }

  /**
   * Gets the open string tuning
   */
  getOpenStrings(): PitchClass[] {
    return [...this.openStringPitches];
  }

  /**
   * Returns the number of strings
   */
  getNumStrings(): number {
    return this.NUM_STRINGS;
  }

  /**
   * Returns the number of frets
   */
  getNumFrets(): number {
    return this.NUM_FRETS;
  }

  /**
   * Validates that a coordinate is within the fretboard bounds
   */
  private validateCoordinate(coordinate: FretboardCoordinate): void {
    if (coordinate.string < 0 || coordinate.string >= this.NUM_STRINGS) {
      throw new Error(`Invalid string index: ${coordinate.string}. Must be 0-${this.NUM_STRINGS - 1}`);
    }
    if (coordinate.fret < 0 || coordinate.fret > this.NUM_FRETS) {
      throw new Error(`Invalid fret index: ${coordinate.fret}. Must be 0-${this.NUM_FRETS}`);
    }
  }

  /**
   * Checks if a coordinate is valid
   */
  isValidCoordinate(coordinate: FretboardCoordinate): boolean {
    return coordinate.string >= 0 && 
           coordinate.string < this.NUM_STRINGS &&
           coordinate.fret >= 0 && 
           coordinate.fret <= this.NUM_FRETS;
  }

  /**
   * Factory method for custom tunings
   */
  static withTuning(openStrings: PitchClass[]): Fretboard {
    const fretboard = new Fretboard();
    (fretboard as any).openStringPitches = [...openStrings];
    return fretboard;
  }
}
