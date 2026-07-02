import { PitchClass } from './PitchClass';

describe('PitchClass', () => {
  describe('constructor and modulo 12 arithmetic', () => {
    it('should normalize positive values to 0-11 range', () => {
      expect(new PitchClass(0).getValue()).toBe(0);
      expect(new PitchClass(11).getValue()).toBe(11);
      expect(new PitchClass(12).getValue()).toBe(0);
      expect(new PitchClass(13).getValue()).toBe(1);
      expect(new PitchClass(24).getValue()).toBe(0);
    });

    it('should handle negative values correctly', () => {
      expect(new PitchClass(-1).getValue()).toBe(11);
      expect(new PitchClass(-2).getValue()).toBe(10);
      expect(new PitchClass(-12).getValue()).toBe(0);
      expect(new PitchClass(-13).getValue()).toBe(11);
    });

    it('should be immutable', () => {
      const pitch = new PitchClass(5);
      const value1 = pitch.getValue();
      pitch.add(3); // Should not mutate original
      const value2 = pitch.getValue();
      expect(value1).toBe(value2);
      expect(value1).toBe(5);
    });
  });

  describe('add()', () => {
    it('should add positive intervals correctly', () => {
      const c = new PitchClass(0); // C
      expect(c.add(4).getValue()).toBe(4); // C + major third = E
      expect(c.add(7).getValue()).toBe(7); // C + perfect fifth = G
      expect(c.add(12).getValue()).toBe(0); // C + octave = C
    });

    it('should add negative intervals (descending) correctly', () => {
      const c = new PitchClass(0); // C
      expect(c.add(-1).getValue()).toBe(11); // C - semitone = B
      expect(c.add(-5).getValue()).toBe(7); // C - fifth = G
      expect(c.add(-12).getValue()).toBe(0); // C - octave = C
    });

    it('should handle wraparound correctly', () => {
      const a = new PitchClass(9); // A
      expect(a.add(4).getValue()).toBe(1); // A + major third = C#
      expect(a.add(15).getValue()).toBe(0); // A + 15 semitones = C
    });

    it('should return a new PitchClass instance', () => {
      const original = new PitchClass(5);
      const result = original.add(3);
      expect(result).not.toBe(original);
      expect(result).toBeInstanceOf(PitchClass);
    });
  });

  describe('subtract()', () => {
    it('should subtract intervals correctly', () => {
      const g = new PitchClass(7); // G
      expect(g.subtract(7).getValue()).toBe(0); // G - fifth = C
      expect(g.subtract(2).getValue()).toBe(5); // G - whole step = F
    });

    it('should handle wraparound correctly', () => {
      const c = new PitchClass(0); // C
      expect(c.subtract(1).getValue()).toBe(11); // C - semitone = B
      expect(c.subtract(13).getValue()).toBe(11); // C - 13 semitones = B
    });
  });

  describe('shortestIntervalTo()', () => {
    it('should return 0 for identical pitch classes', () => {
      const c1 = new PitchClass(0);
      const c2 = new PitchClass(0);
      expect(c1.shortestIntervalTo(c2)).toBe(0);
    });

    it('should return shortest distance for ascending intervals', () => {
      const c = new PitchClass(0);
      const d = new PitchClass(2);
      const e = new PitchClass(4);
      expect(c.shortestIntervalTo(d)).toBe(2);
      expect(c.shortestIntervalTo(e)).toBe(4);
    });

    it('should return shortest distance for descending intervals', () => {
      const c = new PitchClass(0);
      const b = new PitchClass(11);
      expect(c.shortestIntervalTo(b)).toBe(1); // C to B is 1 semitone down
    });

    it('should handle tritone correctly (returns 6)', () => {
      const c = new PitchClass(0);
      const fSharp = new PitchClass(6);
      expect(c.shortestIntervalTo(fSharp)).toBe(6);
      expect(fSharp.shortestIntervalTo(c)).toBe(6);
    });

    it('should be symmetric', () => {
      const c = new PitchClass(0);
      const g = new PitchClass(7);
      expect(c.shortestIntervalTo(g)).toBe(5);
      expect(g.shortestIntervalTo(c)).toBe(5);
    });

    it('should never exceed 6', () => {
      for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 12; j++) {
          const p1 = new PitchClass(i);
          const p2 = new PitchClass(j);
          expect(p1.shortestIntervalTo(p2)).toBeLessThanOrEqual(6);
        }
      }
    });
  });

  describe('intervalTo()', () => {
    it('should return ascending interval', () => {
      const c = new PitchClass(0);
      const g = new PitchClass(7);
      expect(c.intervalTo(g)).toBe(7); // C to G ascending
    });

    it('should handle wraparound', () => {
      const g = new PitchClass(7);
      const c = new PitchClass(0);
      expect(g.intervalTo(c)).toBe(5); // G to C ascending (wraps around)
    });

    it('should return 0 for same pitch', () => {
      const c = new PitchClass(0);
      expect(c.intervalTo(c)).toBe(0);
    });
  });

  describe('equals()', () => {
    it('should return true for equal pitch classes', () => {
      const c1 = new PitchClass(0);
      const c2 = new PitchClass(0);
      const c3 = new PitchClass(12); // Wraps to 0
      expect(c1.equals(c2)).toBe(true);
      expect(c1.equals(c3)).toBe(true);
    });

    it('should return false for different pitch classes', () => {
      const c = new PitchClass(0);
      const d = new PitchClass(2);
      expect(c.equals(d)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return correct note names', () => {
      expect(new PitchClass(0).toString()).toBe('C');
      expect(new PitchClass(1).toString()).toBe('C#');
      expect(new PitchClass(4).toString()).toBe('E');
      expect(new PitchClass(7).toString()).toBe('G');
      expect(new PitchClass(11).toString()).toBe('B');
    });
  });

  describe('fromName()', () => {
    it('should create PitchClass from natural note names', () => {
      expect(PitchClass.fromName('C').getValue()).toBe(0);
      expect(PitchClass.fromName('D').getValue()).toBe(2);
      expect(PitchClass.fromName('E').getValue()).toBe(4);
      expect(PitchClass.fromName('F').getValue()).toBe(5);
      expect(PitchClass.fromName('G').getValue()).toBe(7);
      expect(PitchClass.fromName('A').getValue()).toBe(9);
      expect(PitchClass.fromName('B').getValue()).toBe(11);
    });

    it('should create PitchClass from sharp names', () => {
      expect(PitchClass.fromName('C#').getValue()).toBe(1);
      expect(PitchClass.fromName('F#').getValue()).toBe(6);
      expect(PitchClass.fromName('G#').getValue()).toBe(8);
    });

    it('should create PitchClass from flat names', () => {
      expect(PitchClass.fromName('Db').getValue()).toBe(1);
      expect(PitchClass.fromName('Eb').getValue()).toBe(3);
      expect(PitchClass.fromName('Gb').getValue()).toBe(6);
      expect(PitchClass.fromName('Ab').getValue()).toBe(8);
      expect(PitchClass.fromName('Bb').getValue()).toBe(10);
    });

    it('should throw error for invalid note names', () => {
      expect(() => PitchClass.fromName('H')).toThrow('Invalid note name: H');
      expect(() => PitchClass.fromName('X')).toThrow('Invalid note name: X');
      expect(() => PitchClass.fromName('C##')).toThrow();
    });
  });

  describe('musical theory verification', () => {
    it('should correctly represent chromatic scale', () => {
      const c = new PitchClass(0);
      const chromatic = Array.from({ length: 12 }, (_, i) => c.add(i).getValue());
      expect(chromatic).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should correctly represent major scale intervals', () => {
      const c = new PitchClass(0);
      const majorIntervals = [0, 2, 4, 5, 7, 9, 11]; // W-W-H-W-W-W-H
      const cMajor = majorIntervals.map(interval => c.add(interval).getValue());
      expect(cMajor).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should correctly represent perfect fifth interval', () => {
      const c = new PitchClass(0);
      const fifth = c.add(7);
      expect(fifth.getValue()).toBe(7); // G
    });

    it('should correctly represent major third interval', () => {
      const c = new PitchClass(0);
      const majorThird = c.add(4);
      expect(majorThird.getValue()).toBe(4); // E
    });
  });
});
