# Motor de Música para Bajo - Núcleo del Dominio

Español · English: [English](README.md)

Implementación en TypeScript (Modo Estricto) de un motor de teoría musical para bajo de 5 cuerdas, siguiendo principios de Clean Architecture. Esta carpeta contiene la lógica de dominio testable, sin UI ni servicios externos.

## Arquitectura

```
src/
├── domain/              # Lógica de teoría musical (pura)
│   ├── PitchClass.ts           # Aritmética módulo-12
│   ├── ScaleEngine.ts          # Vectores de escala, modos, tríadas, tétradas
│   ├── Fretboard.ts            # Mapeo espacial del mástil (5 cuerdas)
│   └── *.spec.ts               # Pruebas unitarias
│
└── infrastructure/      # Implementaciones técnicas
    ├── ViterbiRouter.ts        # Enrutador ergonómico (Viterbi DP)
    └── ConsoleViewer.ts        # Visualización ASCII del mástil
```

## Funcionalidades

### 1. PitchClass — Objeto valor módulo-12
- Representa clases de altura (0=C, 1=C#, ..., 11=B)
- Operaciones inmutables (add/subtract)
- Maneja intervalos negativos para descender
- Calcula la distancia intervalica más corta
- Factory para nombres de notas

Ejemplo:

```typescript
const c = PitchClass.fromName('C');
const quinta = c.add(7); // G
```

### 2. ScaleEngine — Escalas y modos
- Acepta patrones de intervalos (Mayor, Menor, etc.)
- Genera modos (rotación de intervalos)
- Extrae tríadas y tétradas desde grados de la escala

Ejemplo:

```typescript
const cMajor = ScaleEngine.major(new PitchClass(0));
const dDorian = cMajor.getMode(2);
```

### 3. Fretboard — Mapeo del mástil
- 24 trastes, afinación estándar: B, E, A, D, G
- Sistema de coordenadas: `{ string: 0-4, fret: 0-24 }`
- Mapea clases de altura a todas las posiciones del mástil

### 4. ViterbiRouter — Optimización ergonómica
- Implementa el algoritmo de Viterbi por programación dinámica
- Encuentra la trayectoria de digitación de costo mínimo (global)
- Pesos configurables: desplazamiento de traste, cambio de cuerda, penalización por estiramiento

Ejemplo:

```typescript
const router = new ViterbiRouter(fretboard, {
  fretShiftWeight: 1.0,
  stringJumpWeight: 1.5,
  maxFretStretch: 4
});
const path = router.findOptimalPath([c, e, g, c]);
```

### 5. ConsoleViewer — Visualización ASCII
- Dibuja el mástil en ASCII con nodos activos
- Muestra formas de acordes y secuencias de digitación

## Instalación

```bash
npm install
```

## Uso

Ejecutar pruebas:

```bash
npm test
npm run test:coverage
```

Demo:

```bash
npm run demo         # Demo general
npm run demo:viterbi # Demo centrada en Viterbi
```

Compilar:

```bash
npm run build
```

## Pruebas y Cobertura
- La capa de dominio está completamente testeada (PitchClass, ScaleEngine)
- ViterbiRouter cuenta con pruebas de integración extensas
- Ejecuta `npm run test:coverage` para el reporte de cobertura

## Principios de Diseño
- Clean Architecture: dominio aislado de infraestructura
- Inmutabilidad: objetos valor inmutables
- TypeScript estricto para seguridad de tipos
- Testabilidad: funciones puras y pruebas unitarias

## Roadmap
- Extender restricciones de digitación (dedos)
- Ponderación temporal y sincronización rítmica
- Integración MIDI y síntesis (futuro)

## Licencia
ISC

---

Este proyecto prioriza la corrección del dominio y la ergonomía; la interfaz y la síntesis de audio quedan fuera del alcance actual.