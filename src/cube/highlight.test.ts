import { LESSONS } from '../lessons'
import { explainedPieces, pieceKey } from './highlight'
import { createCubies } from './cubies'

const demo = (lessonId: string, id: string) => {
  const l = LESSONS.find((x) => x.id === lessonId)!
  return { l, d: l.demos.find((x) => x.id === id)! }
}
const pieces = (lessonId: string, id: string) => {
  const { l, d } = demo(lessonId, id)
  return explainedPieces({ alg: d.alg, setup: d.setup, yellowUp: l.yellowUp, focus: d.focus ?? l.focus, highlight: d.highlight })
}

describe('pieceKey', () => {
  it('identifica una pieza por sus colores, sin importar el orden', () => {
    const cs = createCubies(true)
    const borde = cs.find((c) => c.faces.length === 2 && c.faces.some((f) => f.c === 'W') && c.faces.some((f) => f.c === 'G'))!
    expect(pieceKey(borde)).toBe('GW')
    const esquina = cs.find((c) => c.faces.length === 3 && c.faces.every((f) => ['W', 'G', 'R'].includes(f.c)))!
    expect(pieceKey(esquina)).toBe('GRW')
  })
})

describe('explainedPieces: la porción del cubo que se explica', () => {
  it('margarita, F2 desde abajo: solo la arista blanco-verde', () => {
    expect(pieces('margarita', 'abajo-blanco-abajo')).toEqual(['GW'])
  })
  it('margarita, hueco ocupado: el pétalo apartado y la arista que sube', () => {
    expect(pieces('margarita', 'chocar')).toHaveLength(2)
  })
  it('un ejemplo estático no resalta nada salvo que se indique', () => {
    expect(pieces('margarita', 'final')).toEqual([])
    expect(pieces('margarita', 'arriba-bien')).toEqual(['GW'])
  })
  it('si el algoritmo mueve demasiadas piezas, no se resalta ninguna (la zona en color ya es la explicada)', () => {
    expect(pieces('cruz-amarilla', 'linea')).toEqual([])
  })
  it('nunca resalta centros ni piezas fuera del foco', () => {
    for (const l of LESSONS) for (const d of l.demos) {
      const ps = explainedPieces({ alg: d.alg, setup: d.setup, yellowUp: l.yellowUp, focus: d.focus ?? l.focus, highlight: d.highlight })
      for (const k of ps) expect(k.length, `${l.id}/${d.title}`).toBeGreaterThanOrEqual(2)
    }
  })
  it('las piezas indicadas a mano existen', () => {
    const todas = new Set(createCubies(true).map(pieceKey))
    for (const l of LESSONS) for (const d of l.demos) for (const k of d.highlight ?? []) {
      expect(todas.has(k), `${l.id}/${d.title}: ${k}`).toBe(true)
    }
  })
})
