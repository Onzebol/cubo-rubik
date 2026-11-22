/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(process.cwd(), 'src/App.css'), 'utf-8')
const regla = (selector: string) => {
  const i = css.indexOf(`${selector} {`)
  if (i < 0) throw new Error(`falta la regla ${selector}`)
  return css.slice(i, css.indexOf('}', i))
}

describe('fila de movimientos del reproductor', () => {
  it('los movimientos ya hechos se quedan iluminados con el color de acento', () => {
    const hecho = regla('.moves li.hecho')
    expect(hecho).toContain('var(--accent)') // texto y borde
    expect(hecho).toContain('background: var(--accent-soft)') // fondo suave del color de acento
    expect(regla(':root')).toMatch(/--accent-soft:[^;]*rgba\(255,\s*210,\s*63/) // amarillo suave en oscuro
  })
  it('el movimiento que está girando destaca más: amarillo sólido', () => {
    const activo = regla(".moves li[aria-current='step']")
    expect(activo).toContain('background: var(--accent)')
  })
  it('la regla del movimiento activo va después, para imponerse a la de «hecho»', () => {
    expect(css.indexOf(".moves li[aria-current='step'] {")).toBeGreaterThan(css.indexOf('.moves li.hecho {'))
  })
})
