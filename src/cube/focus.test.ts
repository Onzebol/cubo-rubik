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
    for (const f of ['white-edges', 'white-layer', 'top-face', 'top-corners', 'top-layer', 'first-two-layers', 'two-layers-yellow'] as Focus[]) {
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
  it('top-face: solo las 4 aristas y 4 esquinas de la cara de arriba (8) + 6 centros... el de arriba cuenta una vez', () => {
    expect(coloreadas('top-face')).toBe(8 + 6)
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
  it('first-two-layers: toda la primera y segunda capa (20 + 8) + 6 centros', () => {
    expect(coloreadas('first-two-layers')).toBe(20 + 8 + 6)
  })
  it('top-corners: 4 esquinas de arriba con sus 3 pegatinas + 6 centros', () => {
    expect(coloreadas('top-corners')).toBe(12 + 6)
  })
  it('top-layer: toda la capa de arriba (4 aristas x2 + 4 esquinas x3 = 20) + 6 centros... el centro de arriba ya cuenta', () => {
    expect(coloreadas('top-layer')).toBe(20 + 6)
  })
  it('el color blanco se identifica por pieza aunque haya giros (yellowUp y no)', () => {
    expect(coloreadas('white-edges', false)).toBe(14)
  })
})
