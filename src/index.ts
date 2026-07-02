/**
 * Bass Music Engine - Core Domain Exports
 * Clean Architecture barrel exports for domain and infrastructure layers
 */

// Domain Layer - Pure Music Theory
export { PitchClass } from './domain/PitchClass';
export { ScaleEngine } from './domain/ScaleEngine';
export { Fretboard } from './domain/Fretboard';

// Infrastructure Layer - Technical Implementations
export { ViterbiRouter, RoutingOptions } from './infrastructure/ViterbiRouter';
export { 
  renderFretboard, 
  renderChordShape, 
  renderPath,
  getFretboardString 
} from './infrastructure/ConsoleViewer';
