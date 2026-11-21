import { useCallback, useEffect, useRef, useState } from 'react'
import type { Move } from './cube/cube'
import { turnCubies, type Cubie } from './cube/cubies'

export interface TurnState { face: Move['face']; turns: number }

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** Estado del cubo 3D con giros animados. `instant` aplica el giro sin animar. */
export function useAnimator(initial: () => Cubie[], instant = false) {
  const [cubies, setCubies] = useState<Cubie[]>(initial)
  const [turn, setTurn] = useState<TurnState | null>(null)
  const raf = useRef(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; cancelAnimationFrame(raf.current) }
  }, [])

  const move = useCallback((m: Move, ms = 380): Promise<void> => new Promise((resolve) => {
    if (instant || ms <= 0) {
      setCubies((c) => turnCubies(c, m.face, m.k))
      resolve()
      return
    }
    const duration = ms * (Math.abs(m.k) === 2 ? 1.5 : 1)
    const start = performance.now()
    const tick = () => {
      if (!alive.current) return resolve()
      // mismo reloj que `start` (el argumento de rAF puede ir en otra escala, p. ej. en jsdom)
      const t = Math.min(1, (performance.now() - start) / duration)
      if (t < 1) {
        setTurn({ face: m.face, turns: m.k * ease(t) })
        raf.current = requestAnimationFrame(tick)
      } else {
        setCubies((c) => turnCubies(c, m.face, m.k))
        setTurn(null)
        resolve()
      }
    }
    raf.current = requestAnimationFrame(tick)
  }), [instant])

  const reset = useCallback((cs: Cubie[]) => {
    cancelAnimationFrame(raf.current)
    setTurn(null)
    setCubies(cs)
  }, [])

  return { cubies, turn, move, reset }
}
