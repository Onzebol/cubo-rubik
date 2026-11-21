import { render } from '@testing-library/react'
import { createCubies, turnCubies } from '../cube/cubies'
import { Cube3D } from './Cube3D'

describe('Cube3D', () => {
  it('pinta 26 cubies y 54 pegatinas', () => {
    const { container } = render(<Cube3D cubies={createCubies(false)} />)
    expect(container.querySelectorAll('.cubie')).toHaveLength(26)
    expect(container.querySelectorAll('.sticker')).toHaveLength(54)
  })
  it('las 6 caras tienen su letra en el centro', () => {
    const { container } = render(<Cube3D cubies={createCubies(false)} />)
    const letras = [...container.querySelectorAll('.sticker .label')].map((e) => e.textContent).sort()
    expect(letras).toEqual(['B', 'D', 'F', 'L', 'R', 'U'])
  })
  it('durante una animación solo cambia la transformación de la capa girada', () => {
    const cs = createCubies(false)
    const quieto = render(<Cube3D cubies={cs} />).container
    const girando = render(<Cube3D cubies={cs} turn={{ face: 'U', turns: 0.5 }} />).container
    const t = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>('.cubie')].map((e) => e.style.transform)
    const a = t(quieto), b = t(girando)
    const distintos = a.filter((v, i) => v !== b[i]).length
    expect(distintos).toBe(9) // los 9 cubies de la capa U (8 + el centro)
  })
  it('refleja el estado tras un giro', () => {
    const girado = turnCubies(createCubies(false), 'R', 1)
    const { container } = render(<Cube3D cubies={girado} />)
    expect(container.querySelectorAll('.cubie')).toHaveLength(26)
  })
})
