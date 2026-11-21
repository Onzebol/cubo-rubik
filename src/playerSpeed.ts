/** Velocidades del reproductor: 1× es lenta (la antigua 0,5×) y 2× es la antigua 1×. No hay más. */
export const SPEEDS = [1, 2] as const

const BASE_MOVE_MS = 840
const BASE_GAP_MS = 320

/** Duración del giro de un movimiento. */
export const moveMs = (speed: number): number => BASE_MOVE_MS / speed
/** Pausa entre un movimiento y el siguiente al reproducir de seguido. */
export const gapMs = (speed: number): number => BASE_GAP_MS / speed

/** Segundos de cuenta atrás del botón «Reproducir con cuenta atrás». */
export const COUNTDOWN_SECONDS = 3
