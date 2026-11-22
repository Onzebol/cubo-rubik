import { fireEvent, render, screen } from '@testing-library/react'
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
  it('con foco, las pegatinas no relevantes se pintan en gris', () => {
    const { container } = render(<Cube3D cubies={createCubies(false)} focus="white-edges" />)
    expect(container.querySelectorAll('.sticker.c-gray')).toHaveLength(54 - 14)
    expect(container.querySelectorAll('.sticker.c-W').length).toBeGreaterThan(0)
  })
  it('las piezas resaltadas llevan halo en todas sus pegatinas', () => {
    const { container } = render(<Cube3D cubies={createCubies(false)} highlight={['GW']} />)
    expect(container.querySelectorAll('.sticker.hl')).toHaveLength(2)
  })
  it('sin resaltado no hay halo', () => {
    const { container } = render(<Cube3D cubies={createCubies(false)} />)
    expect(container.querySelectorAll('.sticker.hl')).toHaveLength(0)
  })
  it('alsoColored: las piezas indicadas por id van en color aunque el foco las pondría en gris', () => {
    const cs = createCubies(true)
    const esquina = cs.find((c) => c.home[1] === 1 && c.faces.length === 3)!
    const gris = render(<Cube3D cubies={cs} focus="white-layer" />).container.querySelectorAll('.sticker.c-gray').length
    const menos = render(<Cube3D cubies={cs} focus="white-layer" alsoColored={[esquina.id]} />).container.querySelectorAll('.sticker.c-gray').length
    expect(menos).toBe(gris - 3)
  })
  it('el halo solo se pinta en las pegatinas con color, nunca en las grises', () => {
    // arista GY de arriba: con el foco two-layers-yellow solo su pegatina amarilla (la de arriba) va en color
    const { container } = render(<Cube3D cubies={createCubies(true)} focus="two-layers-yellow" highlight={['GY']} />)
    expect(container.querySelectorAll('.sticker.c-gray.hl')).toHaveLength(0)
    expect(container.querySelectorAll('.sticker.hl')).toHaveLength(1)
    expect(container.querySelector('.sticker.hl')).toHaveClass('c-Y')
  })
  describe('botón para restablecer la vista', () => {
    const escena = (c: HTMLElement) => c.querySelector<HTMLElement>('.scene')!.style.transform
    const arrastrar = (c: HTMLElement) => {
      fireEvent.click(screen.getByRole('button', { name: 'Desbloquear el giro del cubo' }))
      const el = c.querySelector('.cube3d')!
      fireEvent.pointerDown(el, { clientX: 100, clientY: 100, pointerId: 1 })
      fireEvent.pointerMove(el, { clientX: 160, clientY: 130, pointerId: 1 })
      fireEvent.pointerUp(el, { pointerId: 1 })
    }
    it('empieza desactivado porque la vista es la de por defecto', () => {
      render(<Cube3D cubies={createCubies(false)} />)
      expect(screen.getByRole('button', { name: 'Restablecer la vista del cubo' })).toBeDisabled()
    })
    it('tras arrastrar el cubo se activa y devuelve la vista por defecto', () => {
      const { container } = render(<Cube3D cubies={createCubies(false)} />)
      const inicial = escena(container)
      arrastrar(container)
      expect(escena(container)).not.toBe(inicial)
      const boton = screen.getByRole('button', { name: 'Restablecer la vista del cubo' })
      expect(boton).toBeEnabled()
      fireEvent.click(boton)
      expect(escena(container)).toBe(inicial)
      expect(boton).toBeDisabled()
    })
  })
  describe('candado', () => {
    const escena = (c: HTMLElement) => c.querySelector<HTMLElement>('.scene')!.style.transform
    const arrastrar = (c: HTMLElement) => {
      const el = c.querySelector('.cube3d')!
      fireEvent.pointerDown(el, { clientX: 100, clientY: 100, pointerId: 1 })
      fireEvent.pointerMove(el, { clientX: 160, clientY: 130, pointerId: 1 })
      fireEvent.pointerUp(el, { pointerId: 1 })
    }
    it('empieza bloqueado: arrastrar no gira la vista y deja hacer scroll', () => {
      const { container } = render(<Cube3D cubies={createCubies(false)} />)
      const inicial = escena(container)
      arrastrar(container)
      expect(escena(container)).toBe(inicial)
      expect(container.querySelector('.cube3d')).toHaveClass('locked')
    })
    it('al desbloquear gira, y al volver a bloquear deja de girar', () => {
      const { container } = render(<Cube3D cubies={createCubies(false)} />)
      const inicial = escena(container)
      fireEvent.click(screen.getByRole('button', { name: 'Desbloquear el giro del cubo' }))
      expect(container.querySelector('.cube3d')).not.toHaveClass('locked')
      arrastrar(container)
      const girada = escena(container)
      expect(girada).not.toBe(inicial)
      fireEvent.click(screen.getByRole('button', { name: 'Bloquear el giro del cubo' }))
      arrastrar(container)
      expect(escena(container)).toBe(girada)
    })
  })
  it('sin foco no hay gris', () => {
    const { container } = render(<Cube3D cubies={createCubies(false)} />)
    expect(container.querySelectorAll('.sticker.c-gray')).toHaveLength(0)
  })
  it('refleja el estado tras un giro', () => {
    const girado = turnCubies(createCubies(false), 'R', 1)
    const { container } = render(<Cube3D cubies={girado} />)
    expect(container.querySelectorAll('.cubie')).toHaveLength(26)
  })
})
