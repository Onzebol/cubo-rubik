import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlgoPlayer } from './AlgoPlayer'

describe('AlgoPlayer', () => {
  it('muestra los movimientos y empieza en el paso 0', () => {
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('0 / 4')).toBeInTheDocument()
  })
  it('Siguiente avanza un movimiento y lo marca', async () => {
    const u = userEvent.setup()
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    await u.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByText('1 / 4')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')
  })
  it('Anterior retrocede y Reiniciar vuelve al principio', async () => {
    const u = userEvent.setup()
    render(<AlgoPlayer alg="R U" yellowUp={false} instant />)
    await u.click(screen.getByRole('button', { name: 'Siguiente' }))
    await u.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    await u.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(await screen.findByText('1 / 2')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(await screen.findByText('0 / 2')).toBeInTheDocument()
  })
  it('con setup parte de esa situación y no del inverso', () => {
    const t = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>('.cubie')].map((e) => e.style.transform).join('|')
    const resuelto = render(<AlgoPlayer alg="F2" setup="" yellowUp instant />).container
    const porDefecto = render(<AlgoPlayer alg="F2" yellowUp instant />).container
    // por defecto parte del inverso (F2 aplicado); con setup vacío, del cubo resuelto
    expect(t(resuelto)).not.toBe(t(porDefecto))
    expect(screen.getAllByText('0 / 1')).toHaveLength(2)
  })
  it('sin movimientos es un ejemplo estático: solo el cubo y la nota', () => {
    render(<AlgoPlayer alg="" setup="F2" yellowUp instant title="Resultado" instructions="Así debe quedar" />)
    expect(screen.getByText('Resultado')).toBeInTheDocument()
    expect(screen.getByText('Así debe quedar')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
  it('muestra las instrucciones del ejemplo junto al cubo', () => {
    render(<AlgoPlayer alg="F2" yellowUp instructions="Gira la cara frontal dos veces." instant />)
    expect(screen.getByText('Gira la cara frontal dos veces.')).toBeInTheDocument()
  })
  it('también en los ejemplos estáticos', () => {
    render(<AlgoPlayer alg="" setup="F2" yellowUp instructions="Así debe quedar." instant />)
    expect(screen.getByText('Así debe quedar.')).toBeInTheDocument()
  })
  it('resalta la pieza que explica el ejemplo (halo)', () => {
    const { container } = render(<AlgoPlayer alg="F2" setup="" yellowUp focus="white-edges" instant />)
    expect(container.querySelectorAll('.sticker.hl').length).toBeGreaterThan(0)
  })
  describe('con animación real, la ficha se marca cuando EMPIEZA el movimiento', () => {
    it('Siguiente: marcada de inmediato, antes de que acabe el giro', async () => {
      const u = userEvent.setup()
      render(<AlgoPlayer alg="R U" yellowUp={false} />)
      await u.click(screen.getByRole('button', { name: 'Siguiente' }))
      expect(screen.getByText('0 / 2')).toBeInTheDocument() // el giro aún no ha terminado
      expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')
      expect(await screen.findByText('1 / 2', {}, { timeout: 3000 })).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')
    })
    it('Reproducir: cada ficha se marca al empezar su giro', async () => {
      const u = userEvent.setup()
      render(<AlgoPlayer alg="R U" yellowUp={false} />)
      await u.click(screen.getByRole('button', { name: 'Reproducir' }))
      const fichas = screen.getAllByRole('listitem')
      expect(fichas[0]).toHaveAttribute('aria-current', 'step')
      await waitFor(() => expect(fichas[1]).toHaveAttribute('aria-current', 'step'), { timeout: 3000 })
      expect(screen.getByText('1 / 2')).toBeInTheDocument() // el segundo giro aún no ha terminado
      expect(fichas[0]).not.toHaveAttribute('aria-current')
      expect(await screen.findByText('2 / 2', {}, { timeout: 3000 })).toBeInTheDocument()
    })
    it('Anterior: la ficha que se deshace sigue marcada mientras gira y luego se desmarca', async () => {
      const u = userEvent.setup()
      render(<AlgoPlayer alg="R U" yellowUp={false} />)
      await u.click(screen.getByRole('button', { name: 'Siguiente' }))
      await screen.findByText('1 / 2', {}, { timeout: 3000 })
      await u.click(screen.getByRole('button', { name: 'Anterior' }))
      expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')
      await screen.findByText('0 / 2', {}, { timeout: 3000 })
      expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('aria-current')
    })
  })
  it('Reproducir recorre todo el algoritmo', async () => {
    const u = userEvent.setup()
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    await u.click(screen.getByRole('button', { name: 'Reproducir' }))
    expect(await screen.findByText('4 / 4')).toBeInTheDocument()
  })
})
