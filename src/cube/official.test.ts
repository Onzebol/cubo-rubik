import { LESSONS } from '../lessons'
import { applyAlg, faceOf, invert, isSolved, parseAlg, solved, type Cube } from './cube'

// Pegatinas cuyo color no es el de su cara en el cubo resuelto
const wrong = (c: Cube, yellowUp: boolean) => {
  const ref: Record<string, string> = {}
  solved(yellowUp).forEach((t) => { ref[faceOf(t)] = t.c })
  return c.filter((t) => ref[faceOf(t)] !== t.c)
}
const run = (alg: string) => {
  const c = solved(true)
  applyAlg(c, alg)
  return wrong(c, true)
}
const esquinas = (ts: Cube) => ts.filter((t) => t.p.every((v) => v !== 0))
const aristas = (ts: Cube) => ts.filter((t) => t.p.filter((v) => v !== 0).length === 2)

describe('lecciones de la guía oficial', () => {
  it('todos los algoritmos de las demos son válidos y se deshacen con su inverso', () => {
    for (const l of LESSONS) for (const d of l.demos) {
      expect(parseAlg(d.alg).length > 0 || d.setup !== undefined).toBe(true)
      const c = solved(l.yellowUp)
      applyAlg(c, d.alg)
      applyAlg(c, invert(d.alg))
      expect(isSolved(c)).toBe(true)
    }
  })
  it('los ids son únicos', () => {
    const ids = LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('efectos de los algoritmos de capa media y última capa', () => {
  it('la capa media conserva la capa inferior (y solo toca arriba y el medio)', () => {
    for (const alg of ["U' L' U L U F U' F'", "U R U' R' U' F' U F"]) {
      expect(run(alg).every((t) => t.p[1] >= 0), alg).toBe(true)
    }
  })
  it('la última capa conserva las dos primeras capas', () => {
    for (const alg of [
      "F U R U' R' F'", "R U R' U R U2 R'",
      "R' F R' B2 R F' R' B2 R2 U'", "F2 U L R' F2 L' R U F2",
    ]) {
      expect(run(alg).every((t) => t.p[1] === 1), alg).toBe(true)
    }
  })
  it('colocar aristas: solo se mueven 3 aristas y ninguna esquina', () => {
    const w = run("F2 U L R' F2 L' R U F2")
    expect(esquinas(w)).toHaveLength(0)
    expect(aristas(w)).toHaveLength(3)
  })
  it("colocar esquinas (sin el U' final): solo se mueven esquinas", () => {
    const w = run("R' F R' B2 R F' R' B2 R2")
    expect(aristas(w)).toHaveLength(0)
    expect(esquinas(w).length).toBeGreaterThan(0)
  })
  it('la variante hacia la derecha deshace la de la izquierda', () => {
    const c = solved(true)
    applyAlg(c, "F2 U L R' F2 L' R U F2")
    applyAlg(c, "F2 U' L R' F2 L' R U' F2")
    expect(isSolved(c)).toBe(true)
  })
})
