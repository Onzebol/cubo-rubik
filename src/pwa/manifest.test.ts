/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raiz = process.cwd()
const publico = (f: string) => resolve(raiz, 'public', f)
const manifiesto = JSON.parse(readFileSync(publico('manifest.webmanifest'), 'utf-8')) as {
  name: string; short_name: string; lang: string; start_url: string; scope: string; display: string
  background_color: string; theme_color: string
  icons: { src: string; sizes: string; type: string; purpose?: string }[]
}
const html = readFileSync(resolve(raiz, 'index.html'), 'utf-8')

/** Ancho y alto de un PNG, leídos de su cabecera IHDR. */
const dimensionesPng = (ruta: string) => {
  const b = readFileSync(ruta)
  expect(b.subarray(1, 4).toString()).toBe('PNG')
  return [b.readUInt32BE(16), b.readUInt32BE(20)]
}

describe('manifiesto de la PWA', () => {
  it('es instalable: nombre, colores y modo de aplicación', () => {
    expect(manifiesto.name).toContain('CuboFácil')
    expect(manifiesto.short_name).toBe('CuboFácil')
    expect(manifiesto.lang).toBe('es')
    expect(manifiesto.display).toBe('standalone')
    expect(manifiesto.background_color).toBe('#14161c')
    expect(manifiesto.theme_color).toBe('#14161c')
  })
  it('usa rutas relativas para funcionar en GitHub Pages (/cubo-rubik/)', () => {
    expect(manifiesto.start_url).toBe('./')
    expect(manifiesto.scope).toBe('./')
    for (const i of manifiesto.icons) expect(i.src.startsWith('/'), i.src).toBe(false)
  })
  it('tiene iconos de 192 y 512 px y uno «maskable», y todos existen con el tamaño que dicen', () => {
    const png = manifiesto.icons.filter((i) => i.type === 'image/png')
    expect(png.some((i) => i.sizes === '192x192' && (i.purpose ?? 'any') === 'any')).toBe(true)
    expect(png.some((i) => i.sizes === '512x512' && (i.purpose ?? 'any') === 'any')).toBe(true)
    expect(png.some((i) => i.purpose === 'maskable')).toBe(true)
    for (const i of png) {
      expect(existsSync(publico(i.src)), i.src).toBe(true)
      const [ancho, alto] = i.sizes.split('x').map(Number)
      expect(dimensionesPng(publico(i.src)), i.src).toEqual([ancho, alto])
    }
  })
  it('el icono vectorial existe', () => {
    expect(existsSync(publico('icon.svg'))).toBe(true)
    expect(readFileSync(publico('icon.svg'), 'utf-8')).toContain('<svg')
  })
})

describe('index.html', () => {
  it('enlaza el manifiesto, el favicon y el icono de iOS con rutas que respetan la base', () => {
    expect(html).toContain('rel="manifest" href="%BASE_URL%manifest.webmanifest"')
    expect(html).toContain('rel="icon" type="image/svg+xml" href="%BASE_URL%icon.svg"')
    expect(html).toContain('rel="apple-touch-icon" href="%BASE_URL%apple-touch-icon.png"')
  })
  it('el icono de iOS es de 180 px', () => {
    expect(dimensionesPng(publico('apple-touch-icon.png'))).toEqual([180, 180])
  })
  it('declara el color del tema', () => {
    expect(html).toContain('name="theme-color" content="#14161c"')
  })
})
