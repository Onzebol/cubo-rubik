import { render, screen } from '@testing-library/react'
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
  it('Reproducir recorre todo el algoritmo', async () => {
    const u = userEvent.setup()
    render(<AlgoPlayer alg="R U R' U'" yellowUp={false} instant />)
    await u.click(screen.getByRole('button', { name: 'Reproducir' }))
    expect(await screen.findByText('4 / 4')).toBeInTheDocument()
  })
})
