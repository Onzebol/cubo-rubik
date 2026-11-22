import { applyAlg, invert, solved, type Cube } from './cube/cube'
import { isColored } from './cube/focus'
import { createCubies } from './cube/cubies'
import { LESSONS, pathOf, type Demo, type Lesson } from './lessons'

// Variante Kubekings de la última capa: cada ejemplo hace lo que dice su texto.
const lesson = (id: string): Lesson => LESSONS.find((l) => l.id === id)!
const demo = (lessonId: string, id: string): Demo => lesson(lessonId).demos.find((d) => d.id === id)!
const ref = solved(true)
const run = (alg: string): Cube => { const c = solved(true); applyAlg(c, alg); return c }
/** Estado de partida de un ejemplo y estado tras su algoritmo. */
const states = (lessonId: string, id: string): [Cube, Cube] => {
  const d = demo(lessonId, id)
  const setup = d.setup ?? invert(d.alg)
  return [run(setup), run(`${setup} ${d.alg}`)]
}

const EDGES = { UF: [0, 1, 1], UR: [1, 1, 0], UB: [0, 1, -1], UL: [-1, 1, 0] }
const CORNERS = { UFR: [1, 1, 1], UFL: [-1, 1, 1], UBR: [1, 1, -1], UBL: [-1, 1, -1] }
const colors = (c: Cube, p: number[]) => c.filter((t) => t.p.join() === p.join()).map((t) => t.c).sort().join('')
const right = (c: Cube, pos: Record<string, number[]>) => Object.keys(pos).filter((k) => colors(c, pos[k]) === colors(ref, pos[k]))
const lowerLayersOk = (c: Cube) =>
  ref.filter((t) => t.p[1] <= 0).every((t) => c.some((o) => o.p.join() === t.p.join() && o.n.join() === t.n.join() && o.c === t.c))
const yellowUp = (c: Cube, pos: Record<string, number[]>) =>
  Object.values(pos).filter((p) => c.some((t) => t.p.join() === p.join() && t.n[1] === 1 && t.c === 'Y')).length
const U_TURNS = ['', 'U', 'U2', "U'"]

describe('variante Kubekings: los pasos van por su propio camino', () => {
  it('son 3 lecciones marcadas como variante, después de la cruz amarilla', () => {
    expect(LESSONS.filter((l) => l.variant).map((l) => l.id)).toEqual(['kk-aristas', 'kk-esquinas', 'kk-orientar'])
  })
  it('el camino de la variante comparte hasta la cruz amarilla y sigue con sus 3 pasos', () => {
    const ids = pathOf(lesson('kk-aristas')).map((l) => l.id)
    expect(ids.slice(-4)).toEqual(['cruz-amarilla', 'kk-aristas', 'kk-esquinas', 'kk-orientar'])
    expect(ids).not.toContain('orientar-esquinas')
  })
  it('el camino de la guía oficial no incluye la variante', () => {
    const ids = pathOf(lesson('orientar-esquinas')).map((l) => l.id)
    expect(ids.some((id) => id.startsWith('kk-'))).toBe(false)
    expect(ids.slice(-4)).toEqual(['cruz-amarilla', 'orientar-esquinas', 'posicionar-esquinas', 'posicionar-aristas'])
  })
  it('hay un enlace desde la cruz amarilla a la variante y desde la variante de vuelta a la guía oficial', () => {
    expect(lesson('cruz-amarilla').altRoute?.id).toBe('kk-aristas')
    expect(lesson('kk-aristas').altRoute?.id).toBe('orientar-esquinas')
  })
})

describe('kk-aristas: ordenar las aristas de la cruz (U + Sune)', () => {
  it('contiguas: las aristas bien están atrás e izquierda; tras el algoritmo, las cuatro', () => {
    const [a, b] = states('kk-aristas', 'contiguas')
    expect(right(a, EDGES).sort()).toEqual(['UB', 'UL'])
    expect(right(b, EDGES)).toHaveLength(4)
    expect(lowerLayersOk(a) && lowerLayersOk(b)).toBe(true)
  })
  it('opuestas: las aristas bien están atrás y delante; tras una pasada quedan dos contiguas bien', () => {
    const [a, b] = states('kk-aristas', 'opuestas')
    expect(right(a, EDGES).sort()).toEqual(['UB', 'UF'])
    // gira U hasta tener dos contiguas bien colocadas
    const contiguas = U_TURNS.some((u) => {
      const bien = right(run(`${demo('kk-aristas', 'opuestas').setup} ${demo('kk-aristas', 'opuestas').alg} ${u}`), EDGES)
      return bien.length === 2 && !(bien.includes('UF') && bien.includes('UB')) && !(bien.includes('UL') && bien.includes('UR'))
    })
    expect(contiguas).toBe(true)
    expect(lowerLayersOk(b)).toBe(true)
  })
  it('conserva las dos primeras capas y la cruz amarilla', () => {
    for (const id of ['contiguas', 'opuestas']) {
      const [a, b] = states('kk-aristas', id)
      expect(yellowUp(a, EDGES), id).toBe(4)
      expect(yellowUp(b, EDGES), id).toBe(4)
    }
  })
  it('las aristas que brillan son las que se intercambian', () => {
    for (const id of ['contiguas', 'opuestas']) {
      const [a, b] = states('kk-aristas', id)
      const mueven = Object.values(EDGES).filter((p) => colors(a, p) !== colors(b, p)).map((p) => colors(a, p)).sort()
      expect([...demo('kk-aristas', id).highlight!].sort(), id).toEqual(mueven)
    }
  })
})

describe('kk-esquinas: colocar las esquinas (U R U\' L\' U R\' U\' L)', () => {
  it('una bien: es la de arriba, delante a la derecha; tras el algoritmo, las cuatro', () => {
    const [a, b] = states('kk-esquinas', 'una-bien')
    expect(right(a, CORNERS)).toEqual(['UFR'])
    expect(right(b, CORNERS)).toHaveLength(4)
    expect(right(a, EDGES)).toHaveLength(4) // las aristas ya estaban bien y siguen bien
    expect(right(b, EDGES)).toHaveLength(4)
    expect(lowerLayersOk(a) && lowerLayersOk(b)).toBe(true)
  })
  it('ninguna bien: tras una pasada queda alguna', () => {
    const [a, b] = states('kk-esquinas', 'ninguna')
    expect(right(a, CORNERS)).toHaveLength(0)
    expect(right(a, EDGES)).toHaveLength(4)
    expect(right(b, CORNERS).length).toBeGreaterThan(0)
  })
  it('las esquinas que brillan son las que cambian de sitio', () => {
    for (const id of ['una-bien', 'ninguna']) {
      const [a, b] = states('kk-esquinas', id)
      const mueven = Object.values(CORNERS).filter((p) => colors(a, p) !== colors(b, p)).map((p) => colors(a, p)).sort()
      expect([...demo('kk-esquinas', id).highlight!].sort(), id).toEqual(mueven)
    }
  })
  it('gira esquinas: por eso no se puede mezclar con la guía oficial, que orienta antes de colocar', () => {
    const d = demo('kk-esquinas', 'una-bien')
    expect(yellowUp(run(d.alg), CORNERS)).toBeLessThan(4)
  })
})

describe("kk-orientar: R' D' R D repetido 2 o 4 veces por esquina", () => {
  const A = "R' D' R D"
  const rep = (n: number) => Array(n).fill(A).join(' ')
  /** Dónde mira el amarillo de la esquina de arriba, delante a la derecha. */
  const mira = (c: Cube) => {
    const t = c.find((x) => x.p.join() === '1,1,1' && x.c === 'Y')
    if (!t) return 'ninguna' // con otra repetición, esa esquina ya no lleva amarillo
    return t.n[1] === 1 ? 'arriba' : t.n[2] === 1 ? 'frente' : 'derecha'
  }
  it('derecha: el amarillo mira a la derecha y 2 repeticiones lo suben', () => {
    const [a, b] = states('kk-orientar', 'derecha')
    expect(mira(a)).toBe('derecha')
    expect(mira(b)).toBe('arriba')
    expect(demo('kk-orientar', 'derecha').alg).toBe(rep(2))
  })
  it('frente: el amarillo mira al frente y 4 repeticiones lo suben', () => {
    const [a, b] = states('kk-orientar', 'frente')
    expect(mira(a)).toBe('frente')
    expect(mira(b)).toBe('arriba')
    expect(demo('kk-orientar', 'frente').alg).toBe(rep(4))
  })
  it('con 1 o 3 repeticiones el amarillo no queda arriba, ni en un caso ni en otro', () => {
    for (const id of ['derecha', 'frente']) {
      const setup = demo('kk-orientar', id).setup!
      for (const n of [1, 3]) expect(mira(run(`${setup} ${rep(n)}`)), `${id} x${n}`).not.toBe('arriba')
    }
  })
  it('con 2 repeticiones en el caso del frente (o 4 en el de la derecha) el amarillo tampoco queda arriba', () => {
    expect(mira(run(`${demo('kk-orientar', 'frente').setup} ${rep(2)}`))).not.toBe('arriba')
    expect(mira(run(`${demo('kk-orientar', 'derecha').setup} ${rep(4)}`))).not.toBe('arriba')
  })
  it('el brillo marca la esquina que se trabaja', () => {
    for (const id of ['derecha', 'frente']) {
      const [a] = states('kk-orientar', id)
      expect([colors(a, [1, 1, 1])], id).toEqual(demo('kk-orientar', id).highlight)
    }
  })
  it('el ejemplo completo: las esquinas se orientan una a una y alinear U deja el cubo resuelto', () => {
    const [a] = states('kk-orientar', 'derecha')
    const alinear = states('kk-orientar', 'alinear')
    expect(yellowUp(alinear[0], CORNERS)).toBe(4)
    expect(yellowUp(a, CORNERS)).toBe(2) // dos esquinas giradas
    expect(alinear[1].every((t) => ref.some((r) => r.p.join() === t.p.join() && r.n.join() === t.n.join() && r.c === t.c))).toBe(true)
  })
  it('durante el algoritmo se desarma el resto del cubo (el texto avisa)', () => {
    const [, b] = states('kk-orientar', 'derecha')
    expect(lowerLayersOk(b)).toBe(false)
    expect(lesson('kk-orientar').intro).toContain('desmontas')
  })
})

describe('foco two-layers-edges', () => {
  const cs = createCubies(true)
  it('una arista de arriba va entera; una esquina de arriba, solo su amarillo', () => {
    const arista = cs.find((c) => c.home[1] === 1 && c.faces.length === 2)!
    expect(arista.faces.every((f) => isColored('two-layers-edges', arista, f))).toBe(true)
    const esquina = cs.find((c) => c.home[1] === 1 && c.faces.length === 3)!
    expect(esquina.faces.map((f) => isColored('two-layers-edges', esquina, f))).toEqual(esquina.faces.map((f) => f.c === 'Y'))
  })
  it('dos capas (28) + aristas enteras (8) + amarillo de las esquinas (4) + 6 centros', () => {
    const n = cs.flatMap((c) => c.faces.filter((f) => isColored('two-layers-edges', c, f))).length
    expect(n).toBe(28 + 8 + 4 + 6)
  })
})
