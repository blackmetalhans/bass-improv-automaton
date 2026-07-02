import { FretboardCoordinate } from '../domain/Fretboard';

/**
 * ConsoleViewer - ASCII visualization of the fretboard
 * Renders a 5-string bass neck with highlighted active nodes
 */

/**
 * Renders the fretboard to console with active coordinates highlighted
 * @param activeCoordinates - Array of coordinates to highlight on the fretboard
 * @param options - Optional rendering configuration
 */
export function renderFretboard(
  activeCoordinates: FretboardCoordinate[],
  options: {
    startFret?: number;
    endFret?: number;
    showFretNumbers?: boolean;
  } = {}
): void {
  const {
    startFret = 0,
    endFret = 12,
    showFretNumbers = true
  } = options;

  const output = buildFretboardString(activeCoordinates, startFret, endFret, showFretNumbers);
  console.log(output);
}

/**
 * Builds the ASCII fretboard string representation
 */
function buildFretboardString(
  activeCoordinates: FretboardCoordinate[],
  startFret: number,
  endFret: number,
  showFretNumbers: boolean
): string {
  const stringNames = ['G', 'D', 'A', 'E', 'B']; // High to low (for visual top-to-bottom)
  const numFrets = endFret - startFret + 1;
  
  // Create a set for O(1) lookup of active coordinates
  const activeSet = new Set(
    activeCoordinates.map(coord => `${coord.string}-${coord.fret}`)
  );

  const lines: string[] = [];

  // Header with fret numbers
  if (showFretNumbers) {
    const header = '    ' + Array.from(
      { length: numFrets },
      (_, i) => (startFret + i).toString().padStart(3, ' ')
    ).join('');
    lines.push(header);
    lines.push('    ' + '---'.repeat(numFrets));
  }

  // Render each string (from high G to low B)
  for (let visualString = 4; visualString >= 0; visualString--) {
    const stringLine = stringNames[4 - visualString] + ' |';
    const fretMarkers: string[] = [];

    for (let fret = startFret; fret <= endFret; fret++) {
      const coordKey = `${visualString}-${fret}`;
      const isActive = activeSet.has(coordKey);
      
      if (fret === 0) {
        // Open string
        fretMarkers.push(isActive ? ' ● ' : ' ○ ');
      } else {
        fretMarkers.push(isActive ? '-●-' : '---');
      }
    }

    lines.push(stringLine + fretMarkers.join(''));
  }

  // Add footer with position markers for common frets
  if (showFretNumbers) {
    const markers = ['    '];
    for (let fret = startFret; fret <= endFret; fret++) {
      if ([3, 5, 7, 9, 12].includes(fret)) {
        markers.push(' • ');
      } else {
        markers.push('   ');
      }
    }
    lines.push(markers.join(''));
  }

  return lines.join('\n');
}

/**
 * Renders a compact single-line representation of a chord shape
 * @param coordinates - Chord shape coordinates
 */
export function renderChordShape(coordinates: FretboardCoordinate[]): void {
  const stringNames = ['B', 'E', 'A', 'D', 'G'];
  const frets = new Map<number, number>(); // string -> fret

  coordinates.forEach(coord => {
    frets.set(coord.string, coord.fret);
  });

  const shape = stringNames.map((name, idx) => {
    const fret = frets.get(idx);
    return `${name}: ${fret !== undefined ? fret : 'x'}`;
  }).join('  ');

  console.log(shape);
}

/**
 * Renders a path sequence showing movement across the fretboard
 * @param path - Ordered sequence of coordinates
 */
export function renderPath(path: FretboardCoordinate[]): void {
  if (path.length === 0) {
    console.log('(empty path)');
    return;
  }

  const stringNames = ['B', 'E', 'A', 'D', 'G'];
  
  console.log('\nPath sequence:');
  path.forEach((coord, idx) => {
    const arrow = idx < path.length - 1 ? ' → ' : '';
    process.stdout.write(`${stringNames[coord.string]}${coord.fret}${arrow}`);
  });
  console.log('\n');
}

/**
 * Exports the fretboard as a string (useful for testing)
 */
export function getFretboardString(
  activeCoordinates: FretboardCoordinate[],
  startFret: number = 0,
  endFret: number = 12,
  showFretNumbers: boolean = true
): string {
  return buildFretboardString(activeCoordinates, startFret, endFret, showFretNumbers);
}
