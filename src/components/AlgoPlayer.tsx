import { useEffect, useMemo, useRef, useState } from 'react'
import { invert, parseAlg } from '../cube/cube'
import { createCubies, turnCubies } from '../cube/cubies'
import type { Focus } from '../cube/focus'
import { explainedIds } from '../cube/coloring'
import { explainedPieces } from '../cube/highlight'
import { COUNTDOWN_SECONDS, SPEEDS, gapMs, moveMs } from '../playerSpeed'
import { useAnimator } from '../useAnimator'
import { Cube3D } from './Cube3D'

interface Props {
  alg: string
  /** movimientos desde el cubo resuelto hasta la situación de partida (por defecto, el inverso de `alg`) */
  setup?: string
  yellowUp: boolean
  title?: string
  /** qué se ve y qué hay que hacer en este caso */
  instructions?: string
  focus?: Focus
  /** piezas a resaltar indicadas a mano; por defecto, las que mueve el algoritmo */
  highlight?: string[]
  instant?: boolean
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Cubo 3D que se prepara con el inverso del algoritmo y lo reproduce paso a paso, animado. */
export function AlgoPlayer({ alg, setup: setupAlg, yellowUp, title, instructions, focus, highlight, instant = false }: Props) {
  const moves = useMemo(() => parseAlg(alg), [alg])
  const setup = () => {
    let cs = createCubies(yellowUp)
    for (const m of parseAlg(setupAlg ?? invert(alg))) cs = turnCubies(cs, m.face, m.k)
    return cs
  }
  const anim = useAnimator(setup, instant)
  const explained = useMemo(
    () => explainedPieces({ alg, setup: setupAlg, yellowUp, focus: focus ?? 'all', highlight }),
    [alg, setupAlg, yellowUp, focus, highlight],
  )
  const alsoColored = useMemo(() => explainedIds(explained, createCubies(yellowUp)), [explained, yellowUp])
  const [index, setIndex] = useState(0)
  /** movimiento que se está animando ahora mismo: en amarillo desde que empieza y hasta que acaba */
  const [active, setActive] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<number>(SPEEDS[0])
  /** segundos que quedan de la cuenta atrás (null = no hay cuenta atrás en marcha) */
  const [countdown, setCountdown] = useState<number | null>(null)
  const idx = useRef(0)
  const busy = useRef(false)
  const playRef = useRef(false)
  const countdownRef = useRef(false)
  const speedRef = useRef(1)
  useEffect(() => { speedRef.current = speed }, [speed])

  useEffect(() => () => { playRef.current = false; countdownRef.current = false }, [])

  const ms = () => (instant ? 0 : moveMs(speedRef.current))

  const forward = async () => {
    if (busy.current || idx.current >= moves.length) return
    busy.current = true
    setActive(idx.current)
    await anim.move(moves[idx.current], ms())
    idx.current += 1
    setIndex(idx.current)
    setActive(null)
    busy.current = false
  }
  const back = async () => {
    if (busy.current || idx.current <= 0) return
    busy.current = true
    const m = moves[idx.current - 1]
    setActive(idx.current - 1) // el que se deshace sigue marcado mientras gira
    await anim.move({ face: m.face, k: m.k === 2 ? 2 : ((-m.k) as 1 | -1), name: m.name }, ms())
    idx.current -= 1
    setIndex(idx.current)
    setActive(null)
    busy.current = false
  }
  const reset = () => {
    playRef.current = false
    countdownRef.current = false
    setCountdown(null)
    setPlaying(false)
    busy.current = false
    idx.current = 0
    setIndex(0)
    setActive(null)
    anim.reset(setup())
  }
  const play = async () => {
    if (playRef.current) { playRef.current = false; setPlaying(false); return }
    if (idx.current >= moves.length) reset()
    playRef.current = true
    setPlaying(true)
    while (playRef.current && idx.current < moves.length) {
      await forward()
      if (!instant) await wait(gapMs(speedRef.current))
    }
    playRef.current = false
    setPlaying(false)
  }

  /** Cuenta 3, 2, 1 y luego reproduce desde el principio. Volver a pulsar la cancela. */
  const playWithCountdown = async () => {
    if (countdownRef.current) { countdownRef.current = false; setCountdown(null); return }
    if (playRef.current || busy.current) return
    if (idx.current >= moves.length) reset()
    countdownRef.current = true
    for (let n = COUNTDOWN_SECONDS; n >= 1; n--) {
      setCountdown(n)
      await wait(1000)
      if (!countdownRef.current) return
    }
    countdownRef.current = false
    setCountdown(null)
    await play()
  }

  const done = index === moves.length
  const counting = countdown !== null

  if (moves.length === 0) {
    return (
      <figure className="player">
        {title && <figcaption><strong>{title}</strong></figcaption>}
        {instructions && <p className="instructions">{instructions}</p>}
        <Cube3D cubies={anim.cubies} focus={focus} highlight={explained} alsoColored={alsoColored} />
      </figure>
    )
  }

  return (
    <figure className="player">
      {title && <figcaption><strong>{title}</strong></figcaption>}
        {instructions && <p className="instructions">{instructions}</p>}
      <div className="stage">
        <Cube3D cubies={anim.cubies} turn={anim.turn} focus={focus} highlight={explained} alsoColored={alsoColored} />
        {countdown !== null && <div className="countdown" role="timer" aria-live="assertive">{countdown}</div>}
      </div>
      <ol className="moves" aria-label="Movimientos del algoritmo">
        {moves.map((m, i) => (
          <li key={i} className={i < index ? 'hecho' : ''} aria-current={i === active ? 'step' : undefined}>
            {m.name}
          </li>
        ))}
      </ol>
      <p className="counter" aria-live="polite">
        <span>{index} / {moves.length}</span>
        {done && <span className="ok"> · ¡Hecho!</span>}
      </p>
      <div className="controls">
        <button type="button" onClick={reset} aria-label="Reiniciar">⏮</button>
        <button type="button" onClick={back} disabled={index === 0 || playing || counting} aria-label="Anterior">◀</button>
        <button type="button" className="primary" onClick={play} disabled={counting} aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button type="button" onClick={forward} disabled={done || playing || counting} aria-label="Siguiente">▶|</button>
        <button
          type="button"
          className="countdown-btn"
          onClick={playWithCountdown}
          disabled={playing}
          aria-label={counting ? 'Cancelar cuenta atrás' : 'Reproducir con cuenta atrás'}
        >
          {counting ? '✕' : `▶ ${COUNTDOWN_SECONDS} s`}
        </button>
        <label className="speed">
          <span className="sr-only">Velocidad</span>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((v) => <option key={v} value={v}>{v}×</option>)}
          </select>
        </label>
      </div>
    </figure>
  )
}
