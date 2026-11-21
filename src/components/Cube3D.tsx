import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { faceOf, type Face, type Vec } from '../cube/cube'
import { animatedMatrix, cssMatrix, type Cubie } from '../cube/cubies'

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

interface Props {
  cubies: Cubie[]
  turn?: { face: Face; turns: number } | null
  className?: string
}

export function Cube3D({ cubies, turn, className }: Props) {
  const [view, setView] = useState({ rx: -28, ry: -38 })
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
        {cubies.map((c) => (
          <div
            key={c.id}
            className="cubie"
            style={{ transform: cssMatrix(animatedMatrix(c, CUBIE_SIZE, turn ?? undefined)) }}
          >
            {ALL_FACES.map((f) => (
              <div key={f} className="base" style={{ transform: FACE_TRANSFORM[f] } as CSSProperties} />
            ))}
            {c.faces.map((f) => {
              const face = faceOf({ p: c.p, n: f.n as Vec, c: f.c })
              return (
                <div
                  key={face}
                  className={`sticker c-${f.c}`}
                  style={{ transform: `${FACE_TRANSFORM[face]} translateZ(0.5px)` }}
                >
                  {c.faces.length === 1 && <span className="label">{face}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
