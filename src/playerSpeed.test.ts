import { COUNTDOWN_SECONDS, SPEEDS, gapMs, moveMs } from './playerSpeed'

describe('velocidades del reproductor', () => {
  it('solo hay dos: 1× y 2×', () => {
    expect([...SPEEDS]).toEqual([1, 2])
  })
  it('1× es la velocidad que antes era 0,5× (840 ms por movimiento)', () => {
    expect(moveMs(1)).toBe(840)
  })
  it('2× es la velocidad que antes era 1× (420 ms por movimiento)', () => {
    expect(moveMs(2)).toBe(420)
  })
  it('la pausa entre movimientos también se acorta a 2×', () => {
    expect(gapMs(1)).toBe(320)
    expect(gapMs(2)).toBe(160)
  })
  it('la cuenta atrás es de 3 segundos', () => {
    expect(COUNTDOWN_SECONDS).toBe(3)
  })
})
