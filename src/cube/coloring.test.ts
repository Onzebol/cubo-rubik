import { LESSONS } from '../lessons'
import { alsoColoredIds, explainedIds, stickerColored } from './coloring'
import { applyAlgToCubies, createCubies, type Cubie } from './cubies'
import { invert, parseAlg } from './cube'
import { pieceKey } from './highlight'

const demo = (lessonId: string, id: string) => {
  const l = LESSONS.find((x) => x.id === lessonId)!
  return { l, d: l.demos.find((x) => x.id === id)! }
}
/** Estados por los que pasa el ejemplo: el inicial y uno tras cada movimiento. */
const estados = (alg: string, setup: string | undefined, yellowUp: boolean) => {
  let cs = applyAlgToCubies(createCubies(yellowUp), setup ?? invert(alg))
  const out = [cs]
  for (const m of parseAlg(alg)) { cs = applyAlgToCubies(cs, m.name); out.push(cs) }
  return out
}

describe('explainedIds', () => {
  it('traduce las piezas explicadas (por colores) a los ids de sus cubies', () => {
    const cs = createCubies(true)
    const ids = explainedIds(['GR'], cs)
    expect(ids).toHaveLength(1)
    expect(pieceKey(cs.find((c) => c.id === ids[0])!)).toBe('GR')
  })
  it('sin piezas, no hay ids', () => {
    expect(explainedIds([], createCubies(true))).toEqual([])
  })
})

describe('capa del medio: color solo para la primera capa, los centros y la pieza que se coloca', () => {
  it.each(['izquierda', 'derecha', 'sacar'])('%s', (id) => {
    const { l, d } = demo('capa-medio', id)
    const extra = new Set(explainedIds(d.highlight ?? [], createCubies(l.yellowUp)))
    const colored = (c: Cubie) => c.faces.map((f) => stickerColored(l.focus, extra, c, f))
    for (const estado of estados(d.alg, d.setup, l.yellowUp)) {
      for (const c of estado) {
        const esCentro = c.faces.length === 1
        const primeraCapa = c.faces.some((f) => f.c === 'W')
        const laQueSeColoca = (d.highlight ?? []).includes(pieceKey(c))
        const debeIrEnColor = esCentro || primeraCapa || laQueSeColoca
        expect(colored(c).every(Boolean), `${id}: ${pieceKey(c)} debería ir ${debeIrEnColor ? 'en color' : 'en gris'}`).toBe(debeIrEnColor)
      }
    }
  })
  it('el color de cada pieza no cambia durante la animación', () => {
    const { l, d } = demo('capa-medio', 'izquierda')
    const extra = new Set(explainedIds(d.highlight ?? [], createCubies(l.yellowUp)))
    const firma = (cs: Cubie[]) => cs.map((c) => `${c.id}:${c.faces.map((f) => (stickerColored(l.focus, extra, c, f) ? 1 : 0)).join('')}`).join(',')
    const todos = estados(d.alg, d.setup, l.yellowUp)
    for (const e of todos) expect(firma(e)).toBe(firma(todos[0]))
  })
  it('en total: 20 pegatinas de la primera capa + 6 centros + 2 de la arista que se coloca', () => {
    const { l, d } = demo('capa-medio', 'izquierda')
    const extra = new Set(explainedIds(d.highlight ?? [], createCubies(l.yellowUp)))
    const n = estados(d.alg, d.setup, l.yellowUp)[0].flatMap((c) => c.faces.filter((f) => stickerColored(l.focus, extra, c, f))).length
    expect(n).toBe(20 + 6 + 2)
  })
})

/** Qué piezas de la última capa van enteras en color en cada paso (además de sus pegatinas amarillas). */
const PASOS_ULTIMA_CAPA: { id: string; focus: string; enteras: (c: Cubie) => boolean; total: number }[] = [
  { id: 'cruz-amarilla', focus: 'two-layers-yellow', enteras: () => false, total: 28 + 8 + 6 },
  { id: 'orientar-esquinas', focus: 'two-layers-yellow', enteras: () => false, total: 28 + 8 + 6 },
  // esquinas enteras (12) + amarillo de las aristas (4)
  { id: 'posicionar-esquinas', focus: 'two-layers-yellow-corners', enteras: (c: Cubie) => c.home[1] === 1 && c.faces.length === 3, total: 28 + 12 + 4 + 6 },
  // aristas enteras (8) + amarillo de las esquinas (4)
  { id: 'posicionar-aristas', focus: 'two-layers-yellow-edges', enteras: (c: Cubie) => c.home[1] === 1 && c.faces.length === 2, total: 28 + 8 + 4 + 6 },
]
const RESALTADAS: Record<string, string[] | undefined> = {
  'orientar-esquinas': ['BOY', 'BRY', 'GOY', 'GRY'],
  'posicionar-esquinas': ['BOY', 'BRY', 'GOY', 'GRY'],
}

describe.each(PASOS_ULTIMA_CAPA)('última capa · $id: dos primeras capas en color y, de la última, solo lo que importa', ({ id, focus, enteras, total }) => {
  const l = LESSONS.find((x) => x.id === id)!
  it('toda la lección usa el mismo foco, sin que ningún ejemplo lo cambie', () => {
    expect(l.focus).toBe(focus)
    for (const d of l.demos) expect(d.focus, d.id ?? d.title).toBeUndefined()
  })
  it('en cada estado: color en centros, dos primeras capas, amarillo y lo que importa en este paso; el resto, gris; sin cambios durante la animación', () => {
    for (const d of l.demos) {
      const extra = new Set(alsoColoredIds(l.focus, d.highlight ?? [], createCubies(l.yellowUp)))
      const firma = (cs: Cubie[]) => cs.map((c) => `${c.id}:${c.faces.map((f) => (stickerColored(l.focus, extra, c, f) ? 1 : 0)).join('')}`).join(',')
      const todos = estados(d.alg, d.setup, l.yellowUp)
      for (const estado of todos) {
        expect(firma(estado), d.title).toBe(firma(todos[0]))
        for (const c of estado) {
          for (const f of c.faces) {
            const debe = c.faces.length === 1 || c.home[1] <= 0 || f.c === 'Y' || enteras(c)
            expect(stickerColored(l.focus, extra, c, f), `${d.title}: ${pieceKey(c)} ${f.c}`).toBe(debe)
          }
        }
      }
    }
  })
  it(`en total ${total} pegatinas en color`, () => {
    for (const d of l.demos) {
      const extra = new Set(alsoColoredIds(l.focus, d.highlight ?? [], createCubies(l.yellowUp)))
      const n = estados(d.alg, d.setup, l.yellowUp)[0].flatMap((c) => c.faces.filter((f) => stickerColored(l.focus, extra, c, f))).length
      expect(n, d.title).toBe(total)
    }
  })
  it('las piezas resaltadas existen y no se pintan enteras si el foco decide por pegatina', () => {
    for (const d of l.demos) {
      const extra = alsoColoredIds(l.focus, d.highlight ?? [], createCubies(l.yellowUp))
      expect(extra, d.title).toEqual([])
    }
  })
})

describe('última capa: qué se resalta en cada paso', () => {
  it.each(Object.entries(RESALTADAS))('%s: las 4 esquinas, en todos sus ejemplos', (id, claves) => {
    for (const d of LESSONS.find((x) => x.id === id)!.demos) expect(d.highlight, d.title).toEqual(claves)
  })
  it('colocar aristas: se resaltan solo las 3 aristas que se mueven', async () => {
    const { explainedPieces } = await import('./highlight')
    const l = LESSONS.find((x) => x.id === 'posicionar-aristas')!
    for (const d of l.demos) {
      const ps = explainedPieces({ alg: d.alg, setup: d.setup, yellowUp: l.yellowUp, focus: l.focus, highlight: d.highlight })
      expect(ps, d.title).toHaveLength(3)
      for (const k of ps) expect(k, d.title).toMatch(/^[A-Z]Y$/) // arista con amarillo
    }
  })
})
