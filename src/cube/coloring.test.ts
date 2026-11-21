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

describe('cruz amarilla: los tres ejemplos con las dos primeras capas en color y, de la última, solo el amarillo', () => {
  it('toda la lección usa el mismo foco, sin que ningún ejemplo lo cambie', () => {
    const l = LESSONS.find((x) => x.id === 'cruz-amarilla')!
    expect(l.focus).toBe('two-layers-yellow')
    for (const d of l.demos) expect(d.focus, d.id).toBeUndefined()
  })
  it.each(['punto', 'linea', 'ele'])('%s: en color centros, dos primeras capas y pegatinas amarillas; el resto, gris; sin cambios durante la animación', (id) => {
    const { l, d } = demo('cruz-amarilla', id)
    const focus = d.focus ?? l.focus
    const extra = new Set(alsoColoredIds(focus, d.highlight ?? [], createCubies(l.yellowUp)))
    const firma = (cs: Cubie[]) => cs.map((c) => `${c.id}:${c.faces.map((f) => (stickerColored(focus, extra, c, f) ? 1 : 0)).join('')}`).join(',')
    const todos = estados(d.alg, d.setup, l.yellowUp)
    for (const estado of todos) {
      expect(firma(estado)).toBe(firma(todos[0]))
      for (const c of estado) {
        for (const f of c.faces) {
          const debe = c.faces.length === 1 || c.home[1] <= 0 || f.c === 'Y'
          expect(stickerColored(focus, extra, c, f), `${id}: ${pieceKey(c)} ${f.c}`).toBe(debe)
        }
      }
    }
  })
  it('las aristas de arriba resaltadas no se pintan enteras: sus colores no amarillos van en gris', () => {
    const { l, d } = demo('cruz-amarilla', 'linea')
    const extra = new Set(alsoColoredIds(d.focus ?? l.focus, d.highlight ?? [], createCubies(l.yellowUp)))
    expect(extra.size).toBe(0)
    const arista = createCubies(l.yellowUp).find((c) => pieceKey(c) === 'GY')!
    const noAmarilla = arista.faces.find((f) => f.c !== 'Y')!
    expect(stickerColored(l.focus, extra, arista, noAmarilla)).toBe(false)
  })
  it('en total: 28 de las dos primeras capas + 8 amarillas de arriba + 6 centros', () => {
    for (const id of ['punto', 'linea', 'ele']) {
      const { l, d } = demo('cruz-amarilla', id)
      const focus = d.focus ?? l.focus
      const extra = new Set(alsoColoredIds(focus, d.highlight ?? [], createCubies(l.yellowUp)))
      const n = estados(d.alg, d.setup, l.yellowUp)[0].flatMap((c) => c.faces.filter((f) => stickerColored(focus, extra, c, f))).length
      expect(n, id).toBe(28 + 8 + 6)
    }
  })
})
