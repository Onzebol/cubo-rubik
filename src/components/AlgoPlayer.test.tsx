import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlgoPlayer } from './AlgoPlayer'

describe('AlgoPlayer', () => {
  it('muestra los movimientos y empieza en el paso 0', () => {
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('0 / 4')).toBeInTheDocument()
  })
  it('Siguiente avanza un movimiento y lo deja como hecho (sin marcarlo)', async () => {
    const u = userEvent.setup()
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    await u.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByText('1 / 4')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('hecho')
    expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('aria-current')
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
      // al terminar el giro ya no está en amarillo: queda como hecho
      expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('aria-current')
      expect(screen.getAllByRole('listitem')[0]).toHaveClass('hecho')
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
      // al acabar, el último movimiento no se queda en amarillo
      for (const ficha of fichas) {
        expect(ficha).not.toHaveAttribute('aria-current')
        expect(ficha).toHaveClass('hecho')
      }
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
  it('el selector de velocidad solo tiene 1× y 2×, y empieza en 1×', () => {
    render(<AlgoPlayer alg="R U" yellowUp={false} instant />)
    const selector = screen.getByRole('combobox')
    expect([...selector.querySelectorAll('option')].map((o) => o.textContent)).toEqual(['1×', '2×'])
    expect(selector).toHaveValue('1')
  })
  describe('botón de play con cuenta atrás', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })
    const clic = (nombre: string) => act(() => { fireEvent.click(screen.getByRole('button', { name: nombre })) })
    const avanzar = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

    it('muestra 3, 2, 1 y solo entonces empieza', async () => {
      render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
      await clic('Reproducir con cuenta atrás')
      expect(screen.getByRole('timer')).toHaveTextContent('3')
      expect(screen.getByText('0 / 4')).toBeInTheDocument()
      await avanzar(1000)
      expect(screen.getByRole('timer')).toHaveTextContent('2')
      await avanzar(1000)
      expect(screen.getByRole('timer')).toHaveTextContent('1')
      expect(screen.getByText('0 / 4')).toBeInTheDocument() // aún sin empezar
      await avanzar(1000)
      expect(screen.queryByRole('timer')).not.toBeInTheDocument()
      expect(screen.getByText('4 / 4')).toBeInTheDocument()
    })
    it('se puede cancelar: no llega a empezar', async () => {
      render(<AlgoPlayer alg="R U" yellowUp={false} instant />)
      await clic('Reproducir con cuenta atrás')
      await avanzar(1000)
      await clic('Cancelar cuenta atrás')
      expect(screen.queryByRole('timer')).not.toBeInTheDocument()
      await avanzar(5000)
      expect(screen.getByText('0 / 2')).toBeInTheDocument()
    })
    it('durante la cuenta atrás no se puede usar Siguiente ni Reproducir', async () => {
      render(<AlgoPlayer alg="R U" yellowUp={false} instant />)
      await clic('Reproducir con cuenta atrás')
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Reproducir' })).toBeDisabled()
    })
    it('Reiniciar también la cancela', async () => {
      render(<AlgoPlayer alg="R U" yellowUp={false} instant />)
      await clic('Reproducir con cuenta atrás')
      await clic('Reiniciar')
      expect(screen.queryByRole('timer')).not.toBeInTheDocument()
      await avanzar(5000)
      expect(screen.getByText('0 / 2')).toBeInTheDocument()
    })
  })
  it('Reproducir recorre todo el algoritmo', async () => {
    const u = userEvent.setup()
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    await u.click(screen.getByRole('button', { name: 'Reproducir' }))
    expect(await screen.findByText('4 / 4')).toBeInTheDocument()
  })
})
