import { ScaleEngine } from './ScaleEngine';
import { PitchClass } from './PitchClass';

describe('ScaleEngine', () => {
  describe('constructor', () => {
    it('should create a scale with valid intervals', () => {
      const c = new PitchClass(0);
      const majorIntervals = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, majorIntervals);
      expect(scale.getRoot().getValue()).toBe(0);
      expect(scale.getIntervals()).toEqual(majorIntervals);
    });

    it('should throw error if intervals do not sum to 12', () => {
      const c = new PitchClass(0);
      const invalidIntervals = [2, 2, 2, 2, 2]; // Sum = 10, not 12
      expect(() => new ScaleEngine(c, invalidIntervals)).toThrow('Scale intervals must sum to 12');
    });

    it('should not mutate the input intervals array', () => {
      const c = new PitchClass(0);
      const intervals = [2, 2, 1, 2, 2, 2, 1];
      const originalIntervals = [...intervals];
      new ScaleEngine(c, intervals);
      expect(intervals).toEqual(originalIntervals);
    });
  });

  describe('getPitches()', () => {
    it('should return C major scale pitches correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const pitches = scale.getPitches();
      
      expect(pitches.length).toBe(7);
      expect(pitches.map(p => p.getValue())).toEqual([0, 2, 4, 5, 7, 9, 11]); // C D E F G A B
    });

    it('should return G major scale pitches correctly', () => {
      const g = new PitchClass(7);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(g, major);
      const pitches = scale.getPitches();
      
      expect(pitches.map(p => p.getValue())).toEqual([7, 9, 11, 0, 2, 4, 6]); // G A B C D E F#
    });

    it('should return A natural minor scale pitches correctly', () => {
      const a = new PitchClass(9);
      const naturalMinor = [2, 1, 2, 2, 1, 2, 2];
      const scale = new ScaleEngine(a, naturalMinor);
      const pitches = scale.getPitches();
      
      expect(pitches.map(p => p.getValue())).toEqual([9, 11, 0, 2, 4, 5, 7]); // A B C D E F G
    });
  });

  describe('getMode()', () => {
    it('should return the original scale for mode 1 (Ionian)', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const mode1 = scale.getMode(1);
      
      expect(mode1.getRoot().getValue()).toBe(0); // C
      expect(mode1.getIntervals()).toEqual([2, 2, 1, 2, 2, 2, 1]);
    });

    it('should return Dorian mode (mode 2) correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const dorian = scale.getMode(2);
      
      expect(dorian.getRoot().getValue()).toBe(2); // D
      expect(dorian.getIntervals()).toEqual([2, 1, 2, 2, 2, 1, 2]); // Dorian pattern
    });

    it('should return Phrygian mode (mode 3) correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const phrygian = scale.getMode(3);
      
      expect(phrygian.getRoot().getValue()).toBe(4); // E
      expect(phrygian.getIntervals()).toEqual([1, 2, 2, 2, 1, 2, 2]); // Phrygian pattern
    });

    it('should return Lydian mode (mode 4) correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const lydian = scale.getMode(4);
      
      expect(lydian.getRoot().getValue()).toBe(5); // F
      expect(lydian.getIntervals()).toEqual([2, 2, 2, 1, 2, 2, 1]); // Lydian pattern
    });

    it('should return Mixolydian mode (mode 5) correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const mixolydian = scale.getMode(5);
      
      expect(mixolydian.getRoot().getValue()).toBe(7); // G
      expect(mixolydian.getIntervals()).toEqual([2, 2, 1, 2, 2, 1, 2]); // Mixolydian pattern
    });

    it('should return Aeolian/Natural Minor mode (mode 6) correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const aeolian = scale.getMode(6);
      
      expect(aeolian.getRoot().getValue()).toBe(9); // A
      expect(aeolian.getIntervals()).toEqual([2, 1, 2, 2, 1, 2, 2]); // Aeolian pattern
    });

    it('should return Locrian mode (mode 7) correctly', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      const locrian = scale.getMode(7);
      
      expect(locrian.getRoot().getValue()).toBe(11); // B
      expect(locrian.getIntervals()).toEqual([1, 2, 2, 1, 2, 2, 2]); // Locrian pattern
    });

    it('should throw error for invalid mode degree', () => {
      const c = new PitchClass(0);
      const major = [2, 2, 1, 2, 2, 2, 1];
      const scale = new ScaleEngine(c, major);
      
      expect(() => scale.getMode(0)).toThrow('Invalid mode degree');
      expect(() => scale.getMode(8)).toThrow('Invalid mode degree');
    });
  });

  describe('getTriad()', () => {
    it('should return I triad (major) from C major scale', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      const [root, third, fifth] = scale.getTriad(1);
      
      expect(root.getValue()).toBe(0);  // C
      expect(third.getValue()).toBe(4); // E
      expect(fifth.getValue()).toBe(7); // G
    });

    it('should return ii triad (minor) from C major scale', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      const [root, third, fifth] = scale.getTriad(2);
      
      expect(root.getValue()).toBe(2);  // D
      expect(third.getValue()).toBe(5); // F
      expect(fifth.getValue()).toBe(9); // A
    });

    it('should return vii° triad (diminished) from C major scale', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      const [root, third, fifth] = scale.getTriad(7);
      
      expect(root.getValue()).toBe(11); // B
      expect(third.getValue()).toBe(2); // D
      expect(fifth.getValue()).toBe(5); // F
    });

    it('should throw error for invalid scale degree', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      
      expect(() => scale.getTriad(0)).toThrow('Invalid scale degree');
      expect(() => scale.getTriad(8)).toThrow('Invalid scale degree');
    });
  });

  describe('getTetrad()', () => {
    it('should return I maj7 tetrad from C major scale', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      const [root, third, fifth, seventh] = scale.getTetrad(1);
      
      expect(root.getValue()).toBe(0);   // C
      expect(third.getValue()).toBe(4);  // E
      expect(fifth.getValue()).toBe(7);  // G
      expect(seventh.getValue()).toBe(11); // B
    });

    it('should return ii min7 tetrad from C major scale', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      const [root, third, fifth, seventh] = scale.getTetrad(2);
      
      expect(root.getValue()).toBe(2);  // D
      expect(third.getValue()).toBe(5); // F
      expect(fifth.getValue()).toBe(9); // A
      expect(seventh.getValue()).toBe(0); // C
    });

    it('should return V7 tetrad from C major scale', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      const [root, third, fifth, seventh] = scale.getTetrad(5);
      
      expect(root.getValue()).toBe(7);  // G
      expect(third.getValue()).toBe(11); // B
      expect(fifth.getValue()).toBe(2); // D
      expect(seventh.getValue()).toBe(5); // F
    });

    it('should throw error for invalid scale degree', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      
      expect(() => scale.getTetrad(0)).toThrow('Invalid scale degree');
      expect(() => scale.getTetrad(8)).toThrow('Invalid scale degree');
    });
  });

  describe('factory methods', () => {
    it('should create major scale correctly', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      expect(scale.getIntervals()).toEqual([2, 2, 1, 2, 2, 2, 1]);
    });

    it('should create natural minor scale correctly', () => {
      const a = new PitchClass(9);
      const scale = ScaleEngine.naturalMinor(a);
      expect(scale.getIntervals()).toEqual([2, 1, 2, 2, 1, 2, 2]);
    });

    it('should create harmonic minor scale correctly', () => {
      const a = new PitchClass(9);
      const scale = ScaleEngine.harmonicMinor(a);
      expect(scale.getIntervals()).toEqual([2, 1, 2, 2, 1, 3, 1]);
    });

    it('should create melodic minor scale correctly', () => {
      const a = new PitchClass(9);
      const scale = ScaleEngine.melodicMinor(a);
      expect(scale.getIntervals()).toEqual([2, 1, 2, 2, 2, 2, 1]);
    });

    it('should create dorian mode correctly', () => {
      const d = new PitchClass(2);
      const scale = ScaleEngine.dorian(d);
      expect(scale.getIntervals()).toEqual([2, 1, 2, 2, 2, 1, 2]);
    });

    it('should create phrygian mode correctly', () => {
      const e = new PitchClass(4);
      const scale = ScaleEngine.phrygian(e);
      expect(scale.getIntervals()).toEqual([1, 2, 2, 2, 1, 2, 2]);
    });

    it('should create lydian mode correctly', () => {
      const f = new PitchClass(5);
      const scale = ScaleEngine.lydian(f);
      expect(scale.getIntervals()).toEqual([2, 2, 2, 1, 2, 2, 1]);
    });

    it('should create mixolydian mode correctly', () => {
      const g = new PitchClass(7);
      const scale = ScaleEngine.mixolydian(g);
      expect(scale.getIntervals()).toEqual([2, 2, 1, 2, 2, 1, 2]);
    });
  });

  describe('musical theory integration', () => {
    it('should verify that C major mode 6 equals A natural minor', () => {
      const c = new PitchClass(0);
      const cMajor = ScaleEngine.major(c);
      const aMinorFromMode = cMajor.getMode(6);
      
      const a = new PitchClass(9);
      const aMinorDirect = ScaleEngine.naturalMinor(a);
      
      expect(aMinorFromMode.getIntervals()).toEqual(aMinorDirect.getIntervals());
      expect(aMinorFromMode.getRoot().getValue()).toBe(aMinorDirect.getRoot().getValue());
    });

    it('should verify D dorian is mode 2 of C major', () => {
      const c = new PitchClass(0);
      const cMajor = ScaleEngine.major(c);
      const dDorianFromMode = cMajor.getMode(2);
      
      const d = new PitchClass(2);
      const dDorianDirect = ScaleEngine.dorian(d);
      
      expect(dDorianFromMode.getIntervals()).toEqual(dDorianDirect.getIntervals());
      expect(dDorianFromMode.getPitches().map(p => p.getValue()))
        .toEqual(dDorianDirect.getPitches().map(p => p.getValue()));
    });

    it('should verify major scale has major I, IV, V chords', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      
      // I chord (C major: C-E-G)
      const [i1, i3, i5] = scale.getTriad(1);
      expect(i1.intervalTo(i3)).toBe(4); // Major third
      expect(i3.intervalTo(i5)).toBe(3); // Minor third
      
      // IV chord (F major: F-A-C)
      const [iv1, iv3, iv5] = scale.getTriad(4);
      expect(iv1.intervalTo(iv3)).toBe(4); // Major third
      
      // V chord (G major: G-B-D)
      const [v1, v3, v5] = scale.getTriad(5);
      expect(v1.intervalTo(v3)).toBe(4); // Major third
    });

    it('should verify major scale has minor ii, iii, vi chords', () => {
      const c = new PitchClass(0);
      const scale = ScaleEngine.major(c);
      
      // ii chord (D minor: D-F-A)
      const [ii1, ii3, ii5] = scale.getTriad(2);
      expect(ii1.intervalTo(ii3)).toBe(3); // Minor third
      
      // iii chord (E minor: E-G-B)
      const [iii1, iii3, iii5] = scale.getTriad(3);
      expect(iii1.intervalTo(iii3)).toBe(3); // Minor third
      
      // vi chord (A minor: A-C-E)
      const [vi1, vi3, vi5] = scale.getTriad(6);
      expect(vi1.intervalTo(vi3)).toBe(3); // Minor third
    });
  });
});
