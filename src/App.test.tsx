import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ALGORITHMS, ALGORITHM_GROUPS } from './algorithms'
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
  it('cada ejemplo de la lección muestra sus instrucciones', async () => {
    window.location.hash = '#/leccion/cruz-amarilla'
    render(<App instant />)
    const l = LESSONS.find((x) => x.id === 'cruz-amarilla')!
    for (const d of l.demos) expect(await screen.findByText(d.instructions)).toBeInTheDocument()
  })
  it('la variante Kubekings sale aparte y no cuenta para el progreso', () => {
    localStorage.setItem('cubo-progreso', JSON.stringify(['kk-aristas']))
    render(<App instant />)
    expect(screen.getByRole('heading', { level: 2, name: /variante Kubekings/i })).toBeInTheDocument()
    expect(screen.getByText(/0 de \d+ lecciones/)).toBeInTheDocument()
  })
  it('la cruz amarilla enlaza con la variante y esta, con la guía oficial', async () => {
    window.location.hash = '#/leccion/cruz-amarilla'
    const { unmount } = render(<App instant />)
    expect(await screen.findByRole('link', { name: /Probar la variante Kubekings/i })).toHaveAttribute('href', '#/leccion/kk-aristas')
    unmount()
    window.location.hash = '#/leccion/kk-aristas'
    render(<App instant />)
    expect(await screen.findByRole('link', { name: /Volver al método de la guía oficial/i })).toHaveAttribute('href', '#/leccion/orientar-esquinas')
  })
  it('en la variante se avanza por sus pasos: la cruz amarilla, atrás; Kubekings 3, delante', async () => {
    window.location.hash = '#/leccion/kk-aristas'
    render(<App instant />)
    const pager = await screen.findByRole('navigation', { name: 'Lecciones' })
    expect(pager).toHaveTextContent(/la cruz amarilla/)
    expect(pager).toHaveTextContent(/Kubekings 3/)
  })
  it('marca una lección como hecha y guarda el progreso', async () => {
    const u = userEvent.setup()
    render(<App instant />)
    await u.click(screen.getByRole('link', { name: /la margarita/i }))
    await u.click(await screen.findByRole('checkbox', { name: /hecha/i }))
    expect(JSON.parse(localStorage.getItem('cubo-progreso') ?? '[]')).toContain('margarita')
  })
  it('la sección de algoritmos tiene su pestaña y muestra todos con su reproductor', async () => {
    const u = userEvent.setup()
    render(<App instant />)
    await u.click(screen.getByRole('link', { name: 'Algoritmos' }))
    expect(await screen.findByRole('heading', { level: 1, name: /algoritmos de cuberos/i })).toBeInTheDocument()
    for (const g of ALGORITHM_GROUPS) expect(screen.getByRole('heading', { level: 2, name: g.title })).toBeInTheDocument()
    for (const a of ALGORITHMS) expect(screen.getByText(a.name)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Siguiente' })).toHaveLength(ALGORITHMS.length)
    expect(screen.getByRole('link', { name: 'Algoritmos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Lecciones' })).not.toHaveAttribute('aria-current')
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
