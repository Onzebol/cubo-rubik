import type { Cubie } from './cubies'

/** Qué piezas se colorean en un ejemplo (como en la guía oficial: el resto va en gris). */
export type Focus =
  | 'all'
  | 'white-edges'
  | 'white-layer'
  | 'two-layers'
  | 'top-face'
  | 'top-corners'
  | 'top-layer'

type CubieFace = Cubie['faces'][number]

/** La decisión es por pieza (posición de origen), así que no cambia al moverse. Los centros siempre van en color. */
export function isColored(focus: Focus, c: Cubie, face: CubieFace): boolean {
  if (focus === 'all' || c.faces.length === 1) return true
  const top = c.home[1] === 1
  switch (focus) {
    case 'white-edges': return c.faces.length === 2 && c.faces.some((f) => f.c === 'W')
    case 'white-layer': return c.faces.some((f) => f.c === 'W')
    case 'two-layers': return c.home[1] <= 0 || (top && c.faces.length === 2)
    case 'top-face': return top && face.n[1] === 1
    case 'top-corners': return top && c.faces.length === 3
    case 'top-layer': return top
  }
}
