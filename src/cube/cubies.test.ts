import { applyAlg, solved, type Cube } from './cube'
import { animatedMatrix, createCubies, cubieMatrix, matrixFor, stickersOf, turnCubies } from './cubies'
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

describe('cubieMatrix', () => {
  it('un cubie sin girar tiene la parte lineal igual a la identidad CSS', () => {
    const c = createCubies(false)[0]
    const m = cubieMatrix(c, 10)
    expect([m[0], m[5], m[10]]).toEqual([1, 1, 1])
    expect([m[1], m[2], m[4], m[6], m[8], m[9]].every((v) => v === 0)).toBe(true)
  })
  it('la posición y del modelo se invierte en CSS (arriba = y negativa)', () => {
    const arriba = createCubies(false).find((c) => c.p.join() === '0,1,0')!
    expect(cubieMatrix(arriba, 10)[13]).toBe(-10)
  })
})

describe('animación coherente con el modelo', () => {
  it('al final de la animación cada cubie queda donde lo deja turnCubies (sin saltos)', () => {
    for (const face of ['U', 'D', 'R', 'L', 'F', 'B'] as const) {
      for (const k of [1, -1, 2]) {
        const antes = turnCubies(createCubies(true), 'R', 1) // estado no trivial
        const despues = turnCubies(antes, face, k)
        antes.forEach((c, i) => {
          const anim = animatedMatrix(c, 10, { face, turns: k })
          const fin = cubieMatrix(despues[i], 10)
          anim.forEach((v, j) => expect(v).toBeCloseTo(fin[j], 5))
        })
      }
    }
  })
})
