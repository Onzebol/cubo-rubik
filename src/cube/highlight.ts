import { applyAlgToCubies } from './cubies'
import { createCubies, type Cubie } from './cubies'
import { invert } from './cube'
import { isColored, type Focus } from './focus'

/** Una pieza se identifica por sus colores (sin importar dónde esté): 'GW' = arista blanco-verde. */
export const pieceKey = (c: Cubie): string => c.faces.map((f) => f.c).sort().join('')

/** Si el algoritmo mueve más piezas del foco que estas, no se resalta ninguna: la zona en color ya es la explicada. */
const MAX_HIGHLIGHTED = 3

const moved = (a: Cubie, b: Cubie) =>
  a.p.join() !== b.p.join() || a.cols.some((v, i) => v.join() !== b.cols[i].join())

interface Options {
  alg: string
  setup?: string
  yellowUp: boolean
  focus: Focus
  /** piezas indicadas a mano (ejemplos estáticos) */
  highlight?: string[]
}

/** Piezas protagonistas del ejemplo: las del foco que mueve el algoritmo (nunca centros). */
export function explainedPieces({ alg, setup, yellowUp, focus, highlight }: Options): string[] {
  if (highlight) return highlight
  const start = applyAlgToCubies(createCubies(yellowUp), setup ?? invert(alg))
  const end = applyAlgToCubies(start, alg)
  const changed = start.filter(
    (c, i) => c.faces.length > 1 && moved(c, end[i]) && c.faces.some((f) => isColored(focus, c, f)),
  )
  return changed.length > 0 && changed.length <= MAX_HIGHLIGHTED ? changed.map(pieceKey).sort() : []
}
