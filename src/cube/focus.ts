import type { Cubie } from './cubies'

/** Qué piezas se colorean en un ejemplo (como en la guía oficial: el resto va en gris). */
export type Focus =
  | 'all'
  | 'white-edges'
  | 'white-layer'
  // última capa: dos primeras capas terminadas en color y, de la última, solo lo que importa en cada paso
  | 'two-layers-yellow' // cruz amarilla y orientar esquinas: solo el amarillo
  | 'two-layers-yellow-corners' // colocar esquinas: esquinas enteras (importan sus colores laterales) y el amarillo
  // colocar aristas: las esquinas ya están bien, así que va todo el cubo en color ('all')

type CubieFace = Cubie['faces'][number]

/** Focos que deciden por pegatina: las piezas resaltadas no se pintan enteras por ser las explicadas. */
export const STICKER_FOCI: readonly Focus[] = ['two-layers-yellow', 'two-layers-yellow-corners']

/** La decisión es por pieza (posición de origen), así que no cambia al moverse. Los centros siempre van en color. */
export function isColored(focus: Focus, c: Cubie, face: CubieFace): boolean {
  if (focus === 'all' || c.faces.length === 1) return true
  const dosPrimerasCapas = c.home[1] <= 0
  const ultimaCapa = c.home[1] === 1
  switch (focus) {
    case 'white-edges': return c.faces.length === 2 && c.faces.some((f) => f.c === 'W')
    case 'white-layer': return c.faces.some((f) => f.c === 'W')
    case 'two-layers-yellow': return dosPrimerasCapas || face.c === 'Y'
    case 'two-layers-yellow-corners': return dosPrimerasCapas || face.c === 'Y' || (ultimaCapa && c.faces.length === 3)
  }
}
