import { COUNTDOWN_SECONDS, DOUBLE_TURN_FACTOR, SPEEDS, gapMs, moveMs, turnMs } from './playerSpeed'

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
  describe('los giros dobles (F2, U2…) giran más despacio', () => {
    it('un giro doble dura el doble que uno simple: misma velocidad angular', () => {
      expect(DOUBLE_TURN_FACTOR).toBe(2)
      expect(turnMs(moveMs(1), 1)).toBe(840)
      expect(turnMs(moveMs(1), 2)).toBe(1680)
    })
    it('a 2× también: 420 ms el simple y 840 ms el doble', () => {
      expect(turnMs(moveMs(2), 1)).toBe(420)
      expect(turnMs(moveMs(2), 2)).toBe(840)
    })
    it('el sentido del giro no cambia la duración', () => {
      expect(turnMs(840, -1)).toBe(840)
      expect(turnMs(840, -2)).toBe(1680)
    })
  })
  it('la cuenta atrás es de 3 segundos', () => {
    expect(COUNTDOWN_SECONDS).toBe(3)
  })
})
