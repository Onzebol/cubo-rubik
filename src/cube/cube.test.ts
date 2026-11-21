import { applyAlg, invert, isSolved, netPosition, parseAlg, solved, type Face } from './cube'

describe('parseAlg', () => {
  it('interpreta giros, inversos y dobles', () => {
    expect(parseAlg("R U' F2")).toEqual([
      { face: 'R', k: 1, name: 'R' },
      { face: 'U', k: -1, name: "U'" },
      { face: 'F', k: 2, name: 'F2' },
    ])
  })
  it('ignora espacios sobrantes y rechaza letras desconocidas', () => {
    expect(parseAlg('  R   U ')).toHaveLength(2)
    expect(() => parseAlg('X')).toThrow()
  })
})

describe('invert', () => {
  it('invierte el orden y el sentido', () => {
    expect(invert("R U R' U'")).toBe("U R U' R'")
    expect(invert('F2 D')).toBe("D' F2")
  })
})

describe('cubo', () => {
  it('el cubo nuevo tiene 54 pegatinas y está resuelto', () => {
    const c = solved()
    expect(c).toHaveLength(54)
    expect(isSolved(c)).toBe(true)
  })
  it('cuatro cuartos de vuelta de cualquier cara devuelven el estado', () => {
    for (const f of ['U', 'D', 'R', 'L', 'F', 'B'] as Face[]) {
      const c = solved()
      applyAlg(c, `${f} ${f} ${f} ${f}`)
      expect(isSolved(c)).toBe(true)
    }
  })
  it('un giro cambia el cubo y su inverso lo restaura', () => {
    const c = solved()
    applyAlg(c, 'R')
    expect(isSolved(c)).toBe(false)
    applyAlg(c, "R'")
    expect(isSolved(c)).toBe(true)
  })
  it('un algoritmo seguido de su inverso restaura el cubo', () => {
    const alg = "U R U' L' U R' U' L F2 D B'"
    const c = solved()
    applyAlg(c, alg)
    applyAlg(c, invert(alg))
    expect(isSolved(c)).toBe(true)
  })
  it("R' D' R D tiene orden 6", () => {
    const c = solved()
    for (let i = 0; i < 5; i++) applyAlg(c, "R' D' R D")
    expect(isSolved(c)).toBe(false)
    applyAlg(c, "R' D' R D")
    expect(isSolved(c)).toBe(true)
  })
  it('los algoritmos de última capa conservan las dos primeras capas', () => {
    for (const alg of ["F R U R' U' F'", "R U R' U R U2 R' U", "U R U' L' U R' U' L"]) {
      const c = solved(true)
      applyAlg(c, alg)
      const bajas = c.filter((t) => t.p[1] <= 0)
      const ref = solved(true)
      for (const t of bajas) {
        const original = ref.find((r) => r.p.join() === t.p.join() && r.n.join() === t.n.join())
        expect(t.c).toBe(original?.c)
      }
    }
  })
  it('modo amarillo arriba: U amarillo, F verde', () => {
    const c = solved(true)
    const centroU = c.find((t) => t.p.join() === '0,1,0')
    const centroF = c.find((t) => t.p.join() === '0,0,1')
    expect([centroU?.c, centroF?.c]).toEqual(['Y', 'G'])
  })
})

describe('netPosition', () => {
  it('cada pegatina cae en una celda única del desarrollo', () => {
    const celdas = new Set(solved().map((t) => JSON.stringify(netPosition(t))))
    expect(celdas.size).toBe(54)
  })
})
