import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { faceOf, type Face, type Vec } from '../cube/cube'
import { animatedMatrix, cssMatrix, type Cubie } from '../cube/cubies'
import { stickerColored } from '../cube/coloring'
import type { Focus } from '../cube/focus'
import { pieceKey } from '../cube/highlight'

export const CUBIE_SIZE = 50
const HALF = CUBIE_SIZE / 2

// Transformación de cada cara dentro del cubie (ejes CSS: y hacia abajo)
const FACE_TRANSFORM: Record<Face, string> = {
  F: `translateZ(${HALF}px)`,
  B: `rotateY(180deg) translateZ(${HALF}px)`,
  R: `rotateY(90deg) translateZ(${HALF}px)`,
  L: `rotateY(-90deg) translateZ(${HALF}px)`,
  U: `rotateX(90deg) translateZ(${HALF}px)`,
  D: `rotateX(-90deg) translateZ(${HALF}px)`,
}
const ALL_FACES: Face[] = ['F', 'B', 'R', 'L', 'U', 'D']

// Cada pieza es un sólido negro de verdad: tres bloques cruzados, cada uno 2·R más corto en dos ejes.
// Su unión es un cubo con las aristas rebajadas R px; así no hay huecos ni canales por los que ver
// a través, y las caras exteriores redondeadas (.base) tapan los escalones.
const R = 8
const SOLID_FACES: CSSProperties[] = (() => {
  const out: CSSProperties[] = []
  const lado = CUBIE_SIZE - 2 * R
  for (const [sx, sy, sz] of [[CUBIE_SIZE, lado, lado], [lado, CUBIE_SIZE, lado], [lado, lado, CUBIE_SIZE]]) {
    const cara = (w: number, h: number, transform: string) =>
      out.push({ width: w, height: h, left: (CUBIE_SIZE - w) / 2, top: (CUBIE_SIZE - h) / 2, transform })
    cara(sx, sy, `translateZ(${sz / 2}px)`)
    cara(sx, sy, `rotateY(180deg) translateZ(${sz / 2}px)`)
    cara(sz, sy, `rotateY(90deg) translateZ(${sx / 2}px)`)
    cara(sz, sy, `rotateY(-90deg) translateZ(${sx / 2}px)`)
    cara(sx, sz, `rotateX(90deg) translateZ(${sy / 2}px)`)
    cara(sx, sz, `rotateX(-90deg) translateZ(${sy / 2}px)`)
  }
  return out
})()

interface Props {
  cubies: Cubie[]
  turn?: { face: Face; turns: number } | null
  className?: string
  /** qué piezas van en color; el resto en gris (por defecto, todas) */
  focus?: Focus
  /** piezas (por colores, p. ej. 'GW') que se resaltan con un halo */
  highlight?: readonly string[]
  /** ids de piezas que van en color aunque el foco las pondría en gris (la pieza que se explica) */
  alsoColored?: readonly number[]
}

const DEFAULT_VIEW = { rx: -28, ry: -38 }

export function Cube3D({ cubies, turn, className, focus = 'all', highlight = [], alsoColored = [] }: Props) {
  const [view, setView] = useState(DEFAULT_VIEW)
  const enVistaPorDefecto = view.rx === DEFAULT_VIEW.rx && view.ry === DEFAULT_VIEW.ry
  const extra = useMemo(() => new Set(alsoColored), [alsoColored])
  const drag = useRef<{ x: number; y: number } | null>(null)

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = { x: e.clientX, y: e.clientY }
    setView((v) => ({ rx: Math.max(-85, Math.min(85, v.rx - dy * 0.6)), ry: v.ry + dx * 0.6 }))
  }
  const onUp = () => { drag.current = null }

  return (
    <div className="cube-wrap">
    <div
      className={`cube3d ${className ?? ''}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label="Cubo de Rubik en 3D. Arrastra para girar la vista."
    >
      <div className="scene" style={{ transform: `rotateX(${view.rx}deg) rotateY(${view.ry}deg)` }}>
        {cubies.map((c) => {
          const resaltada = c.faces.length > 1 && highlight.includes(pieceKey(c))
          return (
          <div
            key={c.id}
            className="cubie"
            style={{ transform: cssMatrix(animatedMatrix(c, CUBIE_SIZE, turn ?? undefined)) }}
          >
            {SOLID_FACES.map((style, i) => (
              <div key={`solid-${i}`} className="solid" style={style} />
            ))}
            {ALL_FACES.map((f) => (
              <div key={f} className="base" style={{ transform: FACE_TRANSFORM[f] } as CSSProperties} />
            ))}
            {c.faces.map((f) => {
              const face = faceOf({ p: c.p, n: f.n as Vec, c: f.c })
              const conColor = stickerColored(focus, extra, c, f)
              const hl = resaltada && conColor // el halo nunca va en una cara gris
              return (
                <div
                  key={face}
                  className={`sticker c-${conColor ? f.c : 'gray'}${hl ? ' hl' : ''}`}
                  style={{ transform: `${FACE_TRANSFORM[face]} translateZ(${hl ? 2 : 0.5}px)` }}
                >
                  {c.faces.length === 1 && <span className="label">{face}</span>}
                </div>
              )
            })}
          </div>
          )
        })}
      </div>
    </div>
    <button
      type="button"
      className="view-reset"
      onClick={() => setView(DEFAULT_VIEW)}
      disabled={enVistaPorDefecto}
      aria-label="Restablecer la vista del cubo"
      title="Restablecer la vista"
    >
      ⟲
    </button>
    </div>
  )
}
