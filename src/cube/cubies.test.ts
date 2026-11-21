import { applyAlg, solved, type Cube } from './cube'
import { createCubies, matrixFor, stickersOf, turnCubies } from './cubies'
import { parseAlg } from './cube'

const key = (c: Cube) =>
  c.map((t) => `${t.p.join(',')}|${t.n.join(',')}|${t.c}`).sort().join(';')

describe('cubies (modelo para el 3D)', () => {
  it('hay 26 cubies y 54 pegatinas', () => {
    const cs = createCubies(false)
    expect(cs).toHaveLength(26)
    expect(stickersOf(cs)).toHaveLength(54)
  })
  it('el estado inicial coincide con el modelo de pegatinas', () => {
    expect(key(stickersOf(createCubies(false)))).toBe(key(solved(false)))
    expect(key(stickersOf(createCubies(true)))).toBe(key(solved(true)))
  })
  it('tras cualquier algoritmo coincide con el modelo de pegatinas', () => {
    const alg = "R' F R' B2 R F' R' B2 R2 U' D L2 F' U2"
    let cs = createCubies(true)
    for (const m of parseAlg(alg)) cs = turnCubies(cs, m.face, m.k)
    const ref = solved(true)
    applyAlg(ref, alg)
    expect(key(stickersOf(cs))).toBe(key(ref))
  })
  it('turnCubies no muta el estado anterior', () => {
    const a = createCubies(false)
    const antes = key(stickersOf(a))
    turnCubies(a, 'U', 1)
    expect(key(stickersOf(a))).toBe(antes)
  })
})

describe('matrixFor', () => {
  it('con ángulo 0 devuelve la identidad en 4x4 CSS (16 valores)', () => {
    const m = matrixFor('U', 0)
    expect(m).toHaveLength(16)
    expect(m[0]).toBeCloseTo(1)
    expect(m[5]).toBeCloseTo(1)
    expect(m[10]).toBeCloseTo(1)
    expect(m[15]).toBeCloseTo(1)
  })
})
