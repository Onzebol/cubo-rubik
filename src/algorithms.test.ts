import { ALGORITHMS, ALGORITHM_GROUPS, type Algorithm } from './algorithms'
import { applyAlg, invert, parseAlg, solved, type Cube } from './cube/cube'
import { explainedPieces } from './cube/highlight'

// Cada algoritmo hace lo que dice su texto: las piezas y los casos que cita son los que mueve de verdad.
const ref = solved(true)
const run = (alg: string): Cube => { const c = solved(true); applyAlg(c, alg); return c }
const alg = (id: string): Algorithm => ALGORITHMS.find((a) => a.id === id)!
const group = (g: string) => ALGORITHMS.filter((a) => a.group === g)

const POS: Record<string, number[]> = {
  UF: [0, 1, 1], UR: [1, 1, 0], UB: [0, 1, -1], UL: [-1, 1, 0],
  UFR: [1, 1, 1], UFL: [-1, 1, 1], UBR: [1, 1, -1], UBL: [-1, 1, -1],
}
const colors = (c: Cube, p: number[]) => c.filter((t) => t.p.join() === p.join()).map((t) => t.c).sort().join('')
const same = (a: Cube, b: Cube) => a.every((t) => b.some((r) => r.p.join() === t.p.join() && r.n.join() === t.n.join() && r.c === t.c))
const lowerLayersOk = (c: Cube) => same(c.filter((t) => t.p[1] <= 0), ref)
/** Hacia dónde va cada pieza al aplicar el algoritmo a un cubo resuelto: «UF>UR UR>UL UL>UF». */
const moves = (a: string): string => {
  const c = run(a)
  return Object.keys(POS)
    .map((from) => [from, Object.keys(POS).find((to) => colors(c, POS[to]) === colors(ref, POS[from]))!] as const)
    .filter(([from, to]) => from !== to)
    .map(([from, to]) => `${from}>${to}`)
    .join(' ')
}
/** Piezas de la última capa que cambian de sitio con el algoritmo. */
const movedPieces = (a: string) => {
  const c = run(invert(a))
  const e = run(`${invert(a)} ${a}`)
  return Object.values(POS).filter((p) => colors(c, p) !== colors(e, p)).map((p) => colors(c, p)).sort()
}
/** Hacia dónde mira el amarillo de cada esquina de arriba en la situación de partida (inverso del algoritmo). */
const yellowDirs = (a: string) => {
  const c = run(invert(a))
  const dir = (t: Cube[number]) => (t.n[1] === 1 ? 'U' : t.n[2] === 1 ? 'F' : t.n[2] === -1 ? 'B' : t.n[0] === 1 ? 'R' : 'L')
  return ['UFR', 'UFL', 'UBR', 'UBL'].map((k) => `${k}:${dir(c.find((t) => t.p.join() === POS[k].join() && t.c === 'Y')!)}`).join(' ')
}
const edgesUp = (a: string) => ['UF', 'UR', 'UB', 'UL'].every((k) => run(invert(a)).some((t) => t.p.join() === POS[k].join() && t.n[1] === 1 && t.c === 'Y'))
const cornersUp = (a: string) => ['UFR', 'UFL', 'UBR', 'UBL'].filter((k) => run(invert(a)).some((t) => t.p.join() === POS[k].join() && t.n[1] === 1 && t.c === 'Y'))

describe('sección de algoritmos: datos', () => {
  it('los ids son únicos y cada grupo tiene algoritmos', () => {
    const ids = ALGORITHMS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const g of ALGORITHM_GROUPS) expect(group(g.id).length, g.id).toBeGreaterThan(0)
  })
  it('todos son válidos, se deshacen con su inverso y usan solo giros de cara (sin M, x ni capas dobles)', () => {
    for (const a of ALGORITHMS) {
      expect(parseAlg(a.alg).length, a.id).toBeGreaterThan(0)
      expect(a.alg, a.id).toMatch(/^([UDRLFB]['2]?)( [UDRLFB]['2]?)*$/)
      expect(same(run(`${a.alg} ${invert(a.alg)}`), ref), a.id).toBe(true)
    }
  })
  it('cada uno explica para qué sirve y cómo reconocerlo', () => {
    for (const a of ALGORITHMS) {
      expect(a.purpose.trim().length, a.id).toBeGreaterThan(20)
      expect(a.recognize.trim().length, a.id).toBeGreaterThan(20)
    }
  })
  it('las piezas resaltadas existen y son justo las que mueve el algoritmo', () => {
    for (const a of ALGORITHMS.filter((x) => x.highlight)) expect([...a.highlight!].sort(), a.id).toEqual(movedPieces(a.alg))
  })
  it('los que no tienen resaltado a mano usan el automático (3 piezas o ninguna)', () => {
    for (const a of ALGORITHMS.filter((x) => !x.highlight)) {
      const h = explainedPieces({ alg: a.alg, yellowUp: true, focus: 'all' })
      expect(h.length === 0 || h.length <= 3, a.id).toBe(true)
    }
  })
})

describe('disparadores: repetidos 6 veces vuelven al inicio, y no antes', () => {
  it.each(['sexy', 'sledgehammer', 'esquina'])('%s', (id) => {
    const a = alg(id).alg
    expect(same(run(Array(6).fill(a).join(' ')), ref)).toBe(true)
    for (const n of [1, 2, 3, 4, 5]) expect(same(run(Array(n).fill(a).join(' ')), ref), `x${n}`).toBe(false)
  })
})

describe('OLL: conservan las dos primeras capas y parten de la cruz', () => {
  it.each(['cruz', 'sune', 'antisune', 'h', 'pi'])('%s conserva las dos primeras capas', (id) => {
    expect(lowerLayersOk(run(alg(id).alg))).toBe(true)
  })
  it('cruz: parte con dos aristas amarillas arriba y las cuatro al terminar de repetirlo (punto → línea → L → cruz)', () => {
    const s = run(invert(alg('cruz').alg))
    const arriba = (c: Cube) => c.filter((t) => t.c === 'Y' && t.n[1] === 1 && t.p.filter((v) => v !== 0).length === 2).length
    expect(arriba(s)).toBe(2)
    expect(arriba(run(`${invert(alg('cruz').alg)} ${alg('cruz').alg}`))).toBe(4)
  })
  it('sune: cruz hecha y una sola esquina con el amarillo arriba, delante a la izquierda; acaba con las cuatro', () => {
    expect(edgesUp(alg('sune').alg)).toBe(true)
    expect(cornersUp(alg('sune').alg)).toEqual(['UFL'])
    const fin = run(`${invert(alg('sune').alg)} ${alg('sune').alg}`)
    expect(fin.filter((t) => t.c === 'Y' && t.n[1] === 1 && t.p.every((v) => v !== 0))).toHaveLength(4)
  })
  it('anti-sune: cruz hecha y una sola esquina con el amarillo arriba, detrás a la izquierda', () => {
    expect(edgesUp(alg('antisune').alg)).toBe(true)
    expect(cornersUp(alg('antisune').alg)).toEqual(['UBL'])
  })
  it('H: cruz hecha, ninguna esquina arriba; las de la izquierda miran a la izquierda y las de la derecha, a la derecha', () => {
    expect(edgesUp(alg('h').alg)).toBe(true)
    expect(cornersUp(alg('h').alg)).toEqual([])
    expect(yellowDirs(alg('h').alg)).toBe('UFR:R UFL:L UBR:R UBL:L')
  })
  it('Pi: cruz hecha, ninguna esquina arriba; izquierda a la izquierda, delante-derecha al frente, atrás-derecha hacia atrás', () => {
    expect(edgesUp(alg('pi').alg)).toBe(true)
    expect(cornersUp(alg('pi').alg)).toEqual([])
    expect(yellowDirs(alg('pi').alg)).toBe('UFR:F UFL:L UBR:B UBL:L')
  })
  it.each(['h', 'pi'])('%s: acaba con las cuatro esquinas con el amarillo arriba', (id) => {
    const fin = run(`${invert(alg(id).alg)} ${alg(id).alg}`)
    expect(fin.filter((t) => t.c === 'Y' && t.n[1] === 1 && t.p.every((v) => v !== 0))).toHaveLength(4)
  })
})

describe('PLL: mueven piezas sin girarlas y conservan las dos primeras capas', () => {
  it.each(['ua', 'ub', 'aa', 'ab', 't', 'y', 'jb', 'ja'])('%s conserva las dos primeras capas y el amarillo de arriba', (id) => {
    const c = run(alg(id).alg)
    expect(lowerLayersOk(c)).toBe(true)
    expect(c.filter((t) => t.c === 'Y' && t.n[1] === 1)).toHaveLength(9)
  })
  it.each([
    ['ua', 'UF>UR UR>UL UL>UF'],
    ['ub', 'UF>UL UR>UF UL>UR'],
    ['aa', 'UFR>UBL UBR>UFR UBL>UBR'],
    ['ab', 'UFR>UBR UBR>UBL UBL>UFR'],
    ['t', 'UR>UL UL>UR UFR>UBR UBR>UFR'],
    ['y', 'UB>UL UL>UB UFR>UBL UBL>UFR'],
    ['jb', 'UF>UR UR>UF UFR>UBR UBR>UFR'],
    ['ja', 'UF>UL UL>UF UFL>UBL UBL>UFL'],
  ])('%s mueve las piezas que dice el texto', (id, esperado) => {
    expect(moves(alg(id).alg)).toBe(esperado)
  })
  it('Ab deshace a Aa (y Ub a Ua): son una el reverso de la otra', () => {
    expect(same(run(`${alg('aa').alg} ${alg('ab').alg}`), ref)).toBe(true)
    expect(same(run(`${alg('ua').alg} ${alg('ub').alg}`), ref)).toBe(true)
  })
  it('Aa es el algoritmo de colocar esquinas de la guía oficial sin la U final', () => {
    expect(alg('aa').alg).toBe("R' F R' B2 R F' R' B2 R2")
  })
})
