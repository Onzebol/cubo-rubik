import { applyAlg, invert, solved, type Cube } from './cube/cube'
import { LESSONS, type Demo, type Lesson } from './lessons'

const nz = (p: number[]) => p.filter((v) => v !== 0).length
const lesson = (id: string): Lesson => LESSONS.find((l) => l.id === id)!
const demo = (lessonId: string, id: string): [Lesson, Demo] => {
  const l = lesson(lessonId)
  const d = l.demos.find((x) => x.id === id)
  if (!d) throw new Error(`falta la demo ${lessonId}/${id}`)
  return [l, d]
}
const states = (l: Lesson, d: Demo): [Cube, Cube] => {
  const setup = d.setup ?? invert(d.alg)
  const a = solved(l.yellowUp)
  applyAlg(a, setup)
  const b = solved(l.yellowUp)
  applyAlg(b, `${setup} ${d.alg}`)
  return [a, b]
}
const partner = (c: Cube, w: Cube[number]) => c.find((o) => o !== w && o.p.join() === w.p.join())!.c
// aristas blancas en la capa de arriba con el blanco hacia arriba (por color del compañero)
const whiteUp = (c: Cube) =>
  c.filter((t) => t.c === 'W' && nz(t.p) === 2 && t.p[1] === 1 && t.n[1] === 1).map((w) => partner(c, w)).sort()
// aristas blancas en la capa de abajo con el blanco hacia abajo
const whiteDown = (c: Cube) =>
  c.filter((t) => t.c === 'W' && nz(t.p) === 2 && t.p[1] === -1 && t.n[1] === -1).map((w) => partner(c, w)).sort()
const yEdgesUp = (c: Cube) => c.filter((t) => t.c === 'Y' && nz(t.p) === 2 && t.p[1] === 1 && t.n[1] === 1).map((t) => t.p)
const pattern = (c: Cube) => {
  const e = yEdgesUp(c)
  if (e.length === 4) return 'cruz'
  if (e.length === 0) return 'punto'
  if (e.length === 2) return e[0][0] === -e[1][0] && e[0][2] === -e[1][2] ? 'linea' : 'L'
  return 'otro'
}
const yCorners = (c: Cube) => c.filter((t) => t.c === 'Y' && nz(t.p) === 3 && t.p[1] === 1 && t.n[1] === 1).length
const bienResuelto = (c: Cube) => c.every((t) => solved(true).some((r) => r.p.join() === t.p.join() && r.n.join() === t.n.join() && r.c === t.c))
const SLOTS = [[1, 1, 1], [-1, 1, 1], [1, 1, -1], [-1, 1, -1]]
const key = (c: Cube, p: number[]) => c.filter((t) => t.p.join() === p.join()).map((t) => t.c).sort().join('')
const bienColocadas = (c: Cube, yellowUp: boolean) => SLOTS.filter((p) => key(c, p) === key(solved(yellowUp), p))

describe('margarita: cada caso hace lo que dice el texto', () => {
  const sube = (id: string) => {
    const [l, d] = demo('margarita', id)
    const [a, b] = states(l, d)
    return [whiteUp(a).length, whiteUp(b).length]
  }
  it('resultado final: 4 aristas blancas arriba, con el blanco hacia arriba', () => {
    const [l, d] = demo('margarita', 'final')
    expect(d.alg).toBe('')
    expect(whiteUp(states(l, d)[0])).toHaveLength(4)
  })
  it('blanco arriba: ya está bien, no hay que moverla', () => {
    const [l, d] = demo('margarita', 'arriba-bien')
    expect(d.alg).toBe('')
    expect(whiteUp(states(l, d)[0])).toHaveLength(1)
  })
  it.each(['arriba-lateral', 'medio-derecha', 'medio-frente', 'abajo-blanco-abajo', 'abajo-lateral'])(
    '%s: sube una arista más',
    (id) => {
      const [antes, despues] = sube(id)
      expect(despues).toBe(antes + 1)
    },
  )
  it('no chocar: apartar con U antes de subir deja dos arriba', () => {
    expect(sube('chocar')).toEqual([1, 2])
  })
  it('sin apartar, subir la arista desde el medio tira la que ya estaba', () => {
    const [l, d] = demo('margarita', 'chocar')
    const c = solved(l.yellowUp)
    applyAlg(c, `${d.setup} F'`)
    expect(whiteUp(c).length).toBeLessThan(2)
  })
})

describe('cruz blanca (paso 2)', () => {
  it.each(['coincide', 'no-coincide'])('%s: la arista baja con el blanco hacia abajo', (id) => {
    const [l, d] = demo('cruz-blanca', id)
    const [a, b] = states(l, d)
    expect(whiteUp(a)).toHaveLength(1)
    expect(whiteDown(b)).toHaveLength(whiteDown(a).length + 1)
  })
})

describe('esquinas blancas: la situación de partida coincide con la instrucción', () => {
  const at = (c: Cube, set: string) => {
    const ps = new Map<string, number[]>()
    for (const t of c) if (nz(t.p) === 3) ps.set(t.p.join(), t.p)
    const p = [...ps.values()].find((q) => key(c, q) === set)!
    const w = c.find((t) => t.c === 'W' && t.p.join() === p.join())!
    return { p: p.join(','), w: w.n.join(','), y: p[1] }
  }
  const GRW = ['G', 'R', 'W'].sort().join('')
  const GOW = ['G', 'O', 'W'].sort().join('')
  const ref = solved(false)
  const crossOk = (c: Cube) =>
    c.filter((t) => t.c === 'W' && nz(t.p) === 2).every((t) => t.p[1] === 1 && t.n[1] === 1 && key(c, t.p) === key(ref, t.p))
  const ejemplo = (id: string) => {
    const [l, d] = demo('esquinas-blancas', id)
    return states(l, d)
  }

  it('arriba mal colocada: una esquina con blanco, ajena, en el hueco de arriba-delante-derecha', () => {
    const [a, b] = ejemplo('arriba-mal')
    const aqui = key(a, [1, 1, 1])
    expect(aqui).toContain('W')
    expect(aqui).not.toBe(GRW)
    expect(at(b, aqui).y).toBe(-1) // R' D' R la baja a la capa de abajo
    expect(crossOk(a)).toBe(true)
  })
  it('blanco abajo: esquina bajo su hueco (delante a la derecha), blanco hacia abajo; el algoritmo lo pasa al frente', () => {
    const [a, b] = ejemplo('blanco-abajo')
    expect(at(a, GRW)).toMatchObject({ p: '1,-1,1', w: '0,-1,0' })
    expect(at(b, GRW)).toMatchObject({ p: '1,-1,1', w: '0,0,1' })
    expect(crossOk(a) && crossOk(b)).toBe(true)
  })
  it('izquierda: esquina delante a la izquierda, bajo su hueco, blanco al frente; sube con el blanco arriba', () => {
    const [a, b] = ejemplo('izquierda')
    expect(at(a, GOW)).toMatchObject({ p: '-1,-1,1', w: '0,0,1' })
    expect(at(b, GOW)).toMatchObject({ p: '-1,1,1', w: '0,1,0' })
    expect(crossOk(a) && crossOk(b)).toBe(true)
  })
  it('derecha: esquina delante a la derecha, bajo su hueco, blanco al frente; sube con el blanco arriba', () => {
    const [a, b] = ejemplo('derecha')
    expect(at(a, GRW)).toMatchObject({ p: '1,-1,1', w: '0,0,1' })
    expect(at(b, GRW)).toMatchObject({ p: '1,1,1', w: '0,1,0' })
    expect(crossOk(a) && crossOk(b)).toBe(true)
  })
})

describe('esquinas blancas', () => {
  it('primera capa terminada (estático): las 9 pegatinas blancas arriba', () => {
    const [l, d] = demo('esquinas-blancas', 'final')
    expect(d.alg).toBe('')
    expect(states(l, d)[0].filter((t) => t.c === 'W' && t.n[1] === 1)).toHaveLength(9)
  })
})

describe('capa del medio: las dos capas de abajo resueltas y una arista de arriba por colocar', () => {
  const bottomOk = (c: Cube) => {
    const ref = solved(true)
    return c.filter((t) => t.p[1] === -1).every((t) => ref.some((r) => r.p.join() === t.p.join() && r.n.join() === t.n.join() && r.c === t.c))
  }
  const sticker = (c: Cube, p: number[], n: number[]) => c.find((t) => t.p.join() === p.join() && t.n.join() === n.join())!.c
  const ejemplo = (id: string) => {
    const [l, d] = demo('capa-medio', id)
    return { l, d, st: states(l, d) }
  }
  it('hay un solo ejemplo por caso (la receta completa), no media receta', () => {
    expect(lesson('capa-medio').demos.map((d) => d.id)).toEqual(['izquierda', 'derecha', 'sacar'])
  })
  it.each([
    ['izquierda', 'GR', 'R'], // la arista verde-roja va a la izquierda (centro izquierdo rojo)
    ['derecha', 'GO', 'O'], // la verde-naranja va a la derecha (centro derecho naranja)
  ])('%s: la arista %s está arriba-delante, su color frontal coincide con el centro frontal', (id, par, arriba) => {
    const { st: [a] } = ejemplo(id)
    expect(key(a, [0, 1, 1])).toBe(par)
    expect(sticker(a, [0, 1, 1], [0, 0, 1])).toBe('G') // color frontal = centro frontal
    expect(sticker(a, [0, 1, 1], [0, 1, 0])).toBe(arriba)
    expect(bottomOk(a)).toBe(true)
  })
  it.each(['izquierda', 'derecha'])('%s: la receta completa resuelve el cubo', (id) => {
    const { st: [, b] } = ejemplo(id)
    expect(bienResuelto(b)).toBe(true)
  })
  it('sacar: una arista sin amarillo en el hueco equivocado de la derecha sale a la capa de arriba', () => {
    const { d, st: [a, b] } = ejemplo('sacar')
    expect(d.alg).toBe("U R U' R' U' F' U F")
    expect(key(a, [1, 0, 1])).toBe('GR') // sin amarillo, y no es su sitio (le toca a la izquierda)
    expect(bottomOk(a) && bottomOk(b)).toBe(true)
    const donde = b.find((t) => key(b, t.p) === 'GR' && t.p.filter((v) => v !== 0).length === 2)!
    expect(donde.p[1]).toBe(1)
  })
  it('cada ejemplo marca la arista que se coloca', () => {
    const l = lesson('capa-medio')
    const marca = Object.fromEntries(l.demos.map((d) => [d.id, d.highlight]))
    expect(marca).toEqual({ izquierda: ['GR'], derecha: ['GO'], sacar: ['GR'] })
  })
})

describe('cruz amarilla: punto → línea → «L» → cruz con el mismo algoritmo', () => {
  const caso = (id: string) => {
    const [l, d] = demo('cruz-amarilla', id)
    const [a, b] = states(l, d)
    return [pattern(a), pattern(b)]
  }
  it('punto', () => expect(caso('punto')).toEqual(['punto', 'linea']))
  it('línea horizontal', () => expect(caso('linea')).toEqual(['linea', 'L']))
  it('«L» atrás-izquierda', () => expect(caso('ele')).toEqual(['L', 'cruz']))
  it('no toca las dos primeras capas', () => {
    for (const id of ['punto', 'linea', 'ele']) {
      const [l, d] = demo('cruz-amarilla', id)
      const [, b] = states(l, d)
      expect(b.filter((t) => t.p[1] <= 0).every((t) => solved(true).some((r) => r.p.join() === t.p.join() && r.n.join() === t.n.join() && r.c === t.c))).toBe(true)
    }
  })
})

describe('orientar esquinas: una, ninguna o dos esquinas amarillas', () => {
  const caso = (id: string) => {
    const [l, d] = demo('orientar-esquinas', id)
    const [a, b] = states(l, d)
    return [yCorners(a), yCorners(b)]
  }
  it('pez (una)', () => expect(caso('pez')).toEqual([1, 4]))
  it('ninguna', () => expect(caso('ninguna')).toEqual([0, 4]))
  it('dos', () => expect(caso('dos')).toEqual([2, 4]))
})

describe('colocar esquinas', () => {
  it('contiguas: dos bien colocadas atrás y una pasada resuelve las cuatro', () => {
    const [l, d] = demo('posicionar-esquinas', 'contiguas')
    const [a, b] = states(l, d)
    const bien = bienColocadas(a, l.yellowUp)
    expect(bien).toHaveLength(2)
    expect(bien.every((p) => p[2] === -1)).toBe(true) // las «luces traseras» atrás
    expect(bienColocadas(b, l.yellowUp)).toHaveLength(4)
  })
  it('diagonales: dos bien colocadas en diagonal', () => {
    const [l, d] = demo('posicionar-esquinas', 'diagonales')
    const [a] = states(l, d)
    const bien = bienColocadas(a, l.yellowUp)
    expect(bien).toHaveLength(2)
    expect(bien[0][0]).toBe(-bien[1][0])
    expect(bien[0][2]).toBe(-bien[1][2])
  })
})

describe('todas las demos', () => {
  it('los setups son válidos y los ids son únicos por lección', () => {
    for (const l of LESSONS) {
      const ids = l.demos.map((d) => d.id).filter(Boolean)
      expect(new Set(ids).size).toBe(ids.length)
      for (const d of l.demos) if (d.setup) applyAlg(solved(l.yellowUp), d.setup)
    }
  })
})
