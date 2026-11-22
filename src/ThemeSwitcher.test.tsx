import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSwitcher } from './ThemeSwitcher'
import { TEMA_KEY } from './theme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-tema')
  document.head.innerHTML = '<meta name="theme-color" content="#14161c" />'
})

const raiz = () => document.documentElement.getAttribute('data-tema')
const barra = () => document.querySelector('meta[name="theme-color"]')!.getAttribute('content')

describe('selector de tema', () => {
  it('por defecto es automático: sin data-tema y con el botón «Automático» pulsado', () => {
    render(<ThemeSwitcher />)
    expect(screen.getByRole('button', { name: 'Automático' })).toHaveAttribute('aria-pressed', 'true')
    expect(raiz()).toBeNull()
  })
  it('claro y oscuro se aplican a <html>, se guardan y cambian el color de la barra', async () => {
    const u = userEvent.setup()
    render(<ThemeSwitcher />)
    await u.click(screen.getByRole('button', { name: 'Claro' }))
    expect(raiz()).toBe('claro')
    expect(localStorage.getItem(TEMA_KEY)).toBe('claro')
    expect(barra()).toBe('#f4f5f9')
    expect(screen.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'true')
    await u.click(screen.getByRole('button', { name: 'Oscuro' }))
    expect(raiz()).toBe('oscuro')
    expect(barra()).toBe('#14161c')
  })
  it('volver a automático quita data-tema', async () => {
    const u = userEvent.setup()
    render(<ThemeSwitcher />)
    await u.click(screen.getByRole('button', { name: 'Claro' }))
    await u.click(screen.getByRole('button', { name: 'Automático' }))
    expect(raiz()).toBeNull()
    expect(localStorage.getItem(TEMA_KEY)).toBe('auto')
  })
  it('recuerda la elección guardada', () => {
    localStorage.setItem(TEMA_KEY, 'claro')
    render(<ThemeSwitcher />)
    expect(screen.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'true')
    expect(raiz()).toBe('claro')
  })
  it('ignora un valor guardado que no es un tema', () => {
    localStorage.setItem(TEMA_KEY, 'rosa')
    render(<ThemeSwitcher />)
    expect(screen.getByRole('button', { name: 'Automático' })).toHaveAttribute('aria-pressed', 'true')
  })
})
