import { LESSONS } from '../lessons'
import { alwaysColored, stickerColored } from './coloring'
import { applyAlgToCubies, createCubies } from './cubies'
import { invert, parseAlg } from './cube'
import { isColored } from './focus'

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

describe('isColored es por pieza y no depende de dónde esté', () => {
  it('two-layers: una esquina de arriba es gris esté donde esté', () => {
    const cs = createCubies(true)
    const esquina = cs.find((c) => c.home[1] === 1 && c.faces.length === 3)!
    expect(esquina.faces.some((f) => isColored('two-layers', esquina, f))).toBe(false)
    const abajo = { ...esquina, p: [1, -1, 1] as [number, number, number] }
    expect(abajo.faces.some((f) => isColored('two-layers', abajo, f))).toBe(false)
  })
})

describe('alwaysColored: piezas de arriba que bajan alguna vez a las dos capas inferiores', () => {
  it('solo aplica al foco two-layers', () => {
    expect(alwaysColored({ alg: "R U R' U'", yellowUp: true, focus: 'top-layer' })).toEqual([])
    expect(alwaysColored({ alg: "R U R' U'", yellowUp: true, focus: 'all' })).toEqual([])
  })
  it('capa del medio: incluye las esquinas de arriba que se cuelan en la primera capa durante la receta', () => {
    const { l, d } = demo('capa-medio', 'izquierda')
    const ids = alwaysColored({ alg: d.alg, setup: d.setup, yellowUp: l.yellowUp, focus: l.focus })
    expect(ids.length).toBeGreaterThan(0)
    const cs = createCubies(l.yellowUp)
    for (const id of ids) expect(cs.find((c) => c.id === id)!.home[1]).toBe(1) // solo piezas que serían grises
  })
})

describe('el color de cada pieza es constante durante todo el ejemplo (sin parpadeos)', () => {
  it.each(['izquierda', 'derecha', 'sacar'])('capa del medio, %s', (id) => {
    const { l, d } = demo('capa-medio', id)
    const extra = new Set(alwaysColored({ alg: d.alg, setup: d.setup, yellowUp: l.yellowUp, focus: l.focus }))
    const firma = (cs: ReturnType<typeof createCubies>) =>
      cs.map((c) => `${c.id}:${c.faces.map((f) => (stickerColored(l.focus, extra, c, f) ? 1 : 0)).join('')}`).join(',')
    const todos = estados(d.alg, d.setup, l.yellowUp)
    for (const e of todos) expect(firma(e)).toBe(firma(todos[0]))
  })
  it('y nada de lo que está en las dos capas de abajo es gris en ningún momento', () => {
    for (const id of ['izquierda', 'derecha', 'sacar']) {
      const { l, d } = demo('capa-medio', id)
      const extra = new Set(alwaysColored({ alg: d.alg, setup: d.setup, yellowUp: l.yellowUp, focus: l.focus }))
      for (const e of estados(d.alg, d.setup, l.yellowUp)) {
        for (const c of e) {
          if (c.p[1] > 0) continue
          for (const f of c.faces) expect(stickerColored(l.focus, extra, c, f), `${id}: pieza ${c.id} en ${c.p}`).toBe(true)
        }
      }
    }
  })
})
