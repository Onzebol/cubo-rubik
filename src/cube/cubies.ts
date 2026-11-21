// Cubies (26 piezas) con posición y orientación: base del cubo 3D animado.
import { FACES, parseAlg, rot, solved, type Color, type Cube, type Face, type Vec } from './cube'

export interface Cubie {
  id: number
  p: Vec
  /** posición de origen (identidad de la pieza) */
  home: Vec
  /** cols[i] = imagen del eje local i tras los giros acumulados */
  cols: [Vec, Vec, Vec]
  /** pegatinas en coordenadas locales (normal de origen y color) */
  faces: { n: Vec; c: Color }[]
}

export function createCubies(yellowUp: boolean): Cubie[] {
  const byPos = new Map<string, Cubie>()
  let id = 0
  for (const t of solved(yellowUp)) {
    const k = t.p.join(',')
    let c = byPos.get(k)
    if (!c) {
      c = { id: id++, p: [...t.p] as Vec, home: [...t.p] as Vec, cols: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], faces: [] }
      byPos.set(k, c)
    }
    c.faces.push({ n: [...t.n] as Vec, c: t.c })
  }
  return [...byPos.values()]
}

export function turnCubies(cs: Cubie[], face: Face, k: number): Cubie[] {
  const [a, layer, s] = FACES[face]
  return cs.map((c) =>
    c.p[a] === layer
      ? {
          ...c,
          p: rot(c.p, a, s * k),
          cols: c.cols.map((v) => rot(v, a, s * k)) as Cubie['cols'],
        }
      : c,
  )
}

export function applyAlgToCubies(cs: Cubie[], alg: string): Cubie[] {
  return parseAlg(alg).reduce((acc, m) => turnCubies(acc, m.face, m.k), cs)
}

export function stickersOf(cs: Cubie[]): Cube {
  return cs.flatMap((c) =>
    c.faces.map((f) => ({
      p: [...c.p] as Vec,
      n: [0, 1, 2].map((r) => c.cols[0][r] * f.n[0] + c.cols[1][r] * f.n[1] + c.cols[2][r] * f.n[2]) as Vec,
      c: f.c,
    })),
  )
}

// ---- Matrices CSS (eje y hacia abajo en CSS, hacia arriba en el modelo) ----
type M4 = number[] // columna-mayor, 16 valores

const mul = (a: M4, b: M4): M4 => {
  const out = new Array<number>(16).fill(0)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 4; i++) out[c * 4 + r] += a[i * 4 + r] * b[c * 4 + i]
  }
  return out
}
const flipY = (v: number[]) => [v[0], -v[1], v[2]]

/** Rotación de una capa: `turns` cuartos de vuelta (admite fracciones) en la convención de turnCubies. */
export function matrixFor(face: Face, turns: number): M4 {
  const [a, , s] = FACES[face]
  const th = s * turns * (Math.PI / 2)
  const c = Math.cos(th)
  const sn = Math.sin(th)
  // rotación a derechas alrededor del eje positivo `a` en el modelo
  const R: number[][] =
    a === 0 ? [[1, 0, 0], [0, c, -sn], [0, sn, c]]
    : a === 1 ? [[c, 0, sn], [0, 1, 0], [-sn, 0, c]]
    : [[c, -sn, 0], [sn, c, 0], [0, 0, 1]]
  // conjugada con diag(1,-1,1) para pasar a coordenadas CSS
  const D = [1, -1, 1]
  const Rc = R.map((row, i) => row.map((v, j) => v * D[i] * D[j]))
  return [
    Rc[0][0], Rc[1][0], Rc[2][0], 0,
    Rc[0][1], Rc[1][1], Rc[2][1], 0,
    Rc[0][2], Rc[1][2], Rc[2][2], 0,
    0, 0, 0, 1,
  ]
}

/** Matriz CSS de un cubie (posición + orientación), sin animación. */
export function cubieMatrix(c: Cubie, size: number): M4 {
  // D·m·D: se invierte la y de cada columna y además la columna del eje local y
  const x = flipY(c.cols[0]), y = flipY(c.cols[1]).map((v) => -v), z = flipY(c.cols[2])
  const t = flipY(c.p)
  return [...x, 0, ...y, 0, ...z, 0, t[0] * size, t[1] * size, t[2] * size, 1]
}

export const cssMatrix = (m: M4): string => `matrix3d(${m.map((v) => +v.toFixed(5)).join(',')})`

/** Matriz final de un cubie durante una animación de capa. */
export function animatedMatrix(c: Cubie, size: number, turn?: { face: Face; turns: number }): M4 {
  const base = cubieMatrix(c, size)
  if (!turn) return base
  const [a, layer] = FACES[turn.face]
  return c.p[a] === layer ? mul(matrixFor(turn.face, turn.turns), base) : base
}
