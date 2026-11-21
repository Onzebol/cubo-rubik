import { invert, parseAlg } from './cube'
import { applyAlgToCubies, createCubies, type Cubie } from './cubies'
import { isColored, type Focus } from './focus'

/**
 * Piezas que el foco pintaría en gris pero que, durante el ejemplo, bajan a las dos capas inferiores
 * (p. ej. una esquina de arriba que se cuela un momento en la primera capa). Se pintan en color
 * desde el principio y durante todo el ejemplo, para que ninguna cambie de color al moverse.
 */
export function alwaysColored(o: { alg: string; setup?: string; yellowUp: boolean; focus: Focus }): number[] {
  if (o.focus !== 'two-layers') return []
  let cs = applyAlgToCubies(createCubies(o.yellowUp), o.setup ?? invert(o.alg))
  const ids = new Set<number>()
  const visit = (estado: Cubie[]) => {
    for (const c of estado) {
      if (c.p[1] <= 0 && !c.faces.some((f) => isColored(o.focus, c, f))) ids.add(c.id)
    }
  }
  visit(cs)
  for (const m of parseAlg(o.alg)) { cs = applyAlgToCubies(cs, m.name); visit(cs) }
  return [...ids].sort((a, b) => a - b)
}

/** Si una pegatina va en color: lo decide el foco, más las piezas que se pintan siempre en este ejemplo. */
export const stickerColored = (focus: Focus, extra: ReadonlySet<number>, c: Cubie, f: Cubie['faces'][number]): boolean =>
  extra.has(c.id) || isColored(focus, c, f)
