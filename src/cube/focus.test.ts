import { createCubies } from './cubies'
import { isColored, type Focus } from './focus'

// número de pegatinas coloreadas según el foco, con el cubo resuelto
const coloreadas = (focus: Focus, yellowUp = true) => {
  const cs = createCubies(yellowUp)
  return cs.flatMap((c) => c.faces.filter((f) => isColored(focus, c, f))).length
}

describe('foco de los ejemplos', () => {
  it('all colorea las 54 pegatinas', () => {
    expect(coloreadas('all')).toBe(54)
  })
  it('los centros siempre van en color (6)', () => {
    for (const f of ['white-edges', 'white-layer', 'two-layers-yellow', 'two-layers-yellow-corners', 'two-layers-yellow-edges'] as Focus[]) {
      const cs = createCubies(true)
      const centros = cs.filter((c) => c.faces.length === 1)
      expect(centros.every((c) => isColored(f, c, c.faces[0])), f).toBe(true)
    }
  })
  it('white-edges: 4 aristas blancas (8 pegatinas) + 6 centros', () => {
    expect(coloreadas('white-edges')).toBe(8 + 6)
  })
  it('white-layer: 4 aristas + 4 esquinas con blanco (8 + 12) + 6 centros', () => {
    expect(coloreadas('white-layer')).toBe(8 + 12 + 6)
  })
  it('two-layers-yellow-corners: dos capas (28) + esquinas enteras (12) + amarillo de las aristas (4) + 6 centros', () => {
    expect(coloreadas('two-layers-yellow-corners')).toBe(28 + 12 + 4 + 6)
  })
  it('two-layers-yellow-edges: dos capas (28) + aristas enteras (8) + amarillo de las esquinas (4) + 6 centros', () => {
    expect(coloreadas('two-layers-yellow-edges')).toBe(28 + 8 + 4 + 6)
  })
  it('two-layers-yellow-corners: una esquina de arriba va entera; una arista de arriba, solo su amarillo', () => {
    const cs = createCubies(true)
    const esquina = cs.find((c) => c.home[1] === 1 && c.faces.length === 3)!
    expect(esquina.faces.every((f) => isColored('two-layers-yellow-corners', esquina, f))).toBe(true)
    const arista = cs.find((c) => c.home[1] === 1 && c.faces.length === 2)!
    expect(arista.faces.map((f) => isColored('two-layers-yellow-corners', arista, f))).toEqual(arista.faces.map((f) => f.c === 'Y'))
  })
  it('two-layers-yellow-edges: una arista de arriba va entera; una esquina de arriba, solo su amarillo', () => {
    const cs = createCubies(true)
    const arista = cs.find((c) => c.home[1] === 1 && c.faces.length === 2)!
    expect(arista.faces.every((f) => isColored('two-layers-yellow-edges', arista, f))).toBe(true)
    const esquina = cs.find((c) => c.home[1] === 1 && c.faces.length === 3)!
    expect(esquina.faces.map((f) => isColored('two-layers-yellow-edges', esquina, f))).toEqual(esquina.faces.map((f) => f.c === 'Y'))
  })
  it('two-layers-yellow: dos primeras capas (28) + pegatinas amarillas de arriba (8) + 6 centros', () => {
    expect(coloreadas('two-layers-yellow')).toBe(28 + 8 + 6)
  })
  it('two-layers-yellow: una pieza de arriba solo muestra su pegatina amarilla; las de abajo, enteras', () => {
    const cs = createCubies(true)
    const arriba = cs.find((c) => c.home[1] === 1 && c.faces.length === 2)!
    expect(arriba.faces.map((f) => isColored('two-layers-yellow', arriba, f))).toEqual(arriba.faces.map((f) => f.c === 'Y'))
    const abajo = cs.find((c) => c.home[1] === -1 && c.faces.length === 2)!
    expect(abajo.faces.every((f) => isColored('two-layers-yellow', abajo, f))).toBe(true)
  })
  it('el color blanco se identifica por pieza aunque haya giros (yellowUp y no)', () => {
    expect(coloreadas('white-edges', false)).toBe(14)
  })
})
