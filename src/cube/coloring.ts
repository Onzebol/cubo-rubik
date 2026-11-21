import type { Cubie } from './cubies'
import { isColored, STICKER_FOCI, type Focus } from './focus'
import { pieceKey } from './highlight'

/** Ids de los cubies de las piezas explicadas (por colores, p. ej. 'GR'): van siempre en color, estén en el foco o no. */
export function explainedIds(pieces: readonly string[], cubies: readonly Cubie[]): number[] {
  return cubies.filter((c) => pieces.includes(pieceKey(c))).map((c) => c.id)
}

/**
 * Piezas que van enteras en color por ser las explicadas. Los focos de la última capa deciden por pegatina
 * (solo el amarillo), así que no pinta enteras las piezas resaltadas.
 */
export function alsoColoredIds(focus: Focus, pieces: readonly string[], cubies: readonly Cubie[]): number[] {
  return STICKER_FOCI.includes(focus) ? [] : explainedIds(pieces, cubies)
}

/** Si una pegatina va en color: lo decide el foco, más la pieza que se explica (`extra`). */
export const stickerColored = (focus: Focus, extra: ReadonlySet<number>, c: Cubie, f: Cubie['faces'][number]): boolean =>
  extra.has(c.id) || isColored(focus, c, f)
