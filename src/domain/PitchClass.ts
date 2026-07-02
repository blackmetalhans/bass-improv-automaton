/**
 * PitchClass - Value object representing pitch classes using modulo 12 arithmetic
 * 0 = C, 1 = C#/Db, 2 = D, ..., 11 = B
 * Implements immutable operations for interval arithmetic
 */
export class PitchClass {
  private readonly value: number;

  constructor(value: number) {
    this.value = this.mod12(value);
  }

  /**
   * Modulo 12 operation that handles negative numbers correctly
   */
  private mod12(n: number): number {
    return ((n % 12) + 12) % 12;
  }

  /**
   * Returns the underlying pitch class value (0-11)
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Adds an interval to this pitch class (supports negative intervals for descending)
   * @param interval - Number of semitones to add (can be negative)
   * @returns New PitchClass instance
   */
  add(interval: number): PitchClass {
    return new PitchClass(this.value + interval);
  }

  /**
   * Subtracts an interval from this pitch class
   * @param interval - Number of semitones to subtract
   * @returns New PitchClass instance
   */
  subtract(interval: number): PitchClass {
    return new PitchClass(this.value - interval);
  }

  /**
   * Calculates the shortest interval distance to another pitch class
   * Returns a value between 0 and 6 (inclusive)
   * @param other - Target pitch class
   * @returns Shortest interval distance in semitones
   */
  shortestIntervalTo(other: PitchClass): number {
    const distance = Math.abs(this.value - other.value);
    return Math.min(distance, 12 - distance);
  }

  /**
   * Calculates the ascending interval to another pitch class
   * @param other - Target pitch class
   * @returns Interval in semitones (0-11)
   */
  intervalTo(other: PitchClass): number {
    return this.mod12(other.value - this.value);
  }

  /**
   * Checks equality with another pitch class
   */
  equals(other: PitchClass): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the pitch class name
   */
  toString(): string {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return names[this.value];
  }

  /**
   * Factory method for creating pitch classes from note names
   */
  static fromName(name: string): PitchClass {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    
    const value = noteMap[name];
    if (value === undefined) {
      throw new Error(`Invalid note name: ${name}`);
    }
    
    return new PitchClass(value);
  }
}
