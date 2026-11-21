import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { LESSONS } from './lessons'

beforeEach(() => {
  window.location.hash = ''
  localStorage.clear()
})

describe('App', () => {
  it('lista todas las lecciones', () => {
    render(<App instant />)
    for (const l of LESSONS) expect(screen.getByRole('link', { name: new RegExp(l.title) })).toBeInTheDocument()
  })
  it('abre una lección con su texto y su reproductor', async () => {
    const u = userEvent.setup()
    render(<App instant />)
    await u.click(screen.getByRole('link', { name: /la margarita/i }))
    expect(await screen.findByRole('heading', { level: 1, name: /la margarita/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Siguiente' }).length).toBeGreaterThan(0)
  })
  it('marca una lección como hecha y guarda el progreso', async () => {
    const u = userEvent.setup()
    render(<App instant />)
    await u.click(screen.getByRole('link', { name: /la margarita/i }))
    await u.click(await screen.findByRole('checkbox', { name: /hecha/i }))
    expect(JSON.parse(localStorage.getItem('cubo-progreso') ?? '[]')).toContain('margarita')
  })
  it('la página de práctica tiene botones de giro y mezclar', async () => {
    window.location.hash = '#/practica'
    render(<App instant />)
    expect(await screen.findByRole('button', { name: "R'" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mezclar' })).toBeInTheDocument()
  })
  it('lista las fuentes', async () => {
    window.location.hash = '#/fuentes'
    render(<App instant />)
    expect(await screen.findByRole('link', { name: /Solution Guide oficial/i })).toBeInTheDocument()
  })
})
