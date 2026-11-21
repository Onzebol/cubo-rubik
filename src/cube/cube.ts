// Modelo del cubo 3x3: 54 pegatinas con posición (x,y,z) y normal.
export type Face = 'U' | 'D' | 'R' | 'L' | 'F' | 'B'
export type Color = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O'
export type Vec = [number, number, number]
export interface Sticker { p: Vec; n: Vec; c: Color }
export type Cube = Sticker[]
export interface Move { face: Face; k: 1 | -1 | 2; name: string }

export type Axis = 0 | 1 | 2

// k=+1: giro de 90° a derechas sobre el eje positivo
export function rot(v: Vec, a: Axis, k: number): Vec {
  let [x, y, z] = v
  for (let i = 0; i < ((k % 4) + 4) % 4; i++) {
    if (a === 0) [y, z] = [-z, y]
    else if (a === 1) [x, z] = [z, -x]
    else [x, y] = [-y, x]
  }
  return [x + 0, y + 0, z + 0]
}

export const FACES: Record<Face, [Axis, number, number]> = {
  U: [1, 1, -1], D: [1, -1, 1],
  R: [0, 1, -1], L: [0, -1, 1],
  F: [2, 1, -1], B: [2, -1, 1],
}
const NORMAL_FACE: Record<string, Face> = {
  '0,1,0': 'U', '0,-1,0': 'D', '1,0,0': 'R', '-1,0,0': 'L', '0,0,1': 'F', '0,0,-1': 'B',
}
const COLORS: Record<Face, Color> = { U: 'W', D: 'Y', F: 'G', B: 'B', R: 'R', L: 'O' }
// giro z2: amarillo arriba, verde al frente
const COLORS_YELLOW_UP: Record<Face, Color> = { U: 'Y', D: 'W', F: 'G', B: 'B', R: 'O', L: 'R' }

export const faceOf = (t: Sticker): Face => NORMAL_FACE[t.n.join(',')]

export function solved(yellowUp = false): Cube {
  const map = yellowUp ? COLORS_YELLOW_UP : COLORS
  const st: Cube = []
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const pos: Vec = [x, y, z]
    for (const a of [0, 1, 2] as Axis[]) {
      if (!pos[a]) continue
      const n: Vec = [0, 0, 0]
      n[a] = pos[a]
      st.push({ p: pos, n, c: map[NORMAL_FACE[n.join(',')]] })
    }
  }
  return st
}

export function turn(st: Cube, face: Face, k: number): void {
  const [a, layer, s] = FACES[face]
  for (const t of st) {
    if (t.p[a] === layer) { t.p = rot(t.p, a, s * k); t.n = rot(t.n, a, s * k) }
  }
}

export function parseAlg(alg: string): Move[] {
  return alg.trim().split(/\s+/).filter(Boolean).map((m) => {
    const face = m[0] as Face
    const q = m.slice(1)
    if (!(face in FACES) || !['', "'", '2'].includes(q)) throw new Error(`Movimiento no válido: ${m}`)
    return { face, k: q === "'" ? -1 : q === '2' ? 2 : 1, name: m }
  })
}

export function invert(alg: string): string {
  return parseAlg(alg).reverse()
    .map((m) => (m.k === 2 ? `${m.face}2` : m.k === 1 ? `${m.face}'` : m.face))
    .join(' ')
}

export function applyAlg(st: Cube, alg: string): void {
  for (const m of parseAlg(alg)) turn(st, m.face, m.k)
}

export const cloneCube = (st: Cube): Cube => st.map((t) => ({ p: [...t.p] as Vec, n: [...t.n] as Vec, c: t.c }))

// Posición en el desarrollo plano: cara y (fila, columna) de 0 a 2
export function netPosition(t: Sticker): { f: Face; r: number; c: number } {
  const [x, y, z] = t.p
  const f = faceOf(t)
  const rc = {
    U: [z + 1, x + 1], D: [1 - z, x + 1], F: [1 - y, x + 1],
    B: [1 - y, 1 - x], R: [1 - y, 1 - z], L: [1 - y, z + 1],
  }[f]
  return { f, r: rc[0], c: rc[1] }
}

export function isSolved(st: Cube): boolean {
  const seen: Partial<Record<Face, Color>> = {}
  for (const t of st) {
    const f = faceOf(t)
    if (seen[f] && seen[f] !== t.c) return false
    seen[f] = t.c
  }
  return true
}
