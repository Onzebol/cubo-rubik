// @vitest-environment node
/// <reference types="node" />
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'

/** Build real de la app en una carpeta temporal: lo que se despliega en GitHub Pages. */
const carpeta = mkdtempSync(join(tmpdir(), 'cubofacil-dist-'))
const archivos = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter((r) => statSync(join(dir, r)).isFile())
    .map((r) => r.replaceAll('\\', '/'))

beforeAll(async () => {
  await build({ logLevel: 'silent', build: { outDir: carpeta, emptyOutDir: true } })
}, 60_000)
afterAll(() => rmSync(carpeta, { recursive: true, force: true }))

describe('build de la PWA (lo que se despliega)', () => {
  it('genera el service worker, el manifiesto y los iconos', () => {
    const f = archivos(carpeta)
    for (const esperado of ['sw.js', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']) {
      expect(f, esperado).toContain(esperado)
    }
  })
  it('el service worker precarga TODOS los archivos de la app, incluida la página principal (si no, no abriría sin conexión)', () => {
    const sw = readFileSync(join(carpeta, 'sw.js'), 'utf-8')
    const lista = JSON.parse(/const ARCHIVOS = (\[.*?\])\.map/s.exec(sw)![1]) as string[]
    expect(lista).toContain('./index.html')
    for (const f of archivos(carpeta).filter((x) => x !== 'sw.js')) expect(lista, f).toContain(`./${f}`)
    expect(lista).not.toContain('./sw.js') // no se precarga a sí mismo
  })
  it('no quedan marcadores sin sustituir y la versión es un hash', () => {
    const sw = readFileSync(join(carpeta, 'sw.js'), 'utf-8')
    expect(sw).not.toContain('__VERSION__')
    expect(sw).not.toContain('__ASSETS__')
    expect(sw).toMatch(/const VERSION = '[0-9a-f]{8}'/)
  })
  it('index.html enlaza el manifiesto y los iconos con rutas relativas (funciona en /cubo-rubik/)', () => {
    const html = readFileSync(join(carpeta, 'index.html'), 'utf-8')
    expect(html).toContain('href="./manifest.webmanifest"')
    expect(html).toContain('href="./icon.svg"')
    expect(html).toContain('href="./apple-touch-icon.png"')
    expect(html).not.toMatch(/(?:href|src)="\/(?!\/)/) // ninguna ruta absoluta que se rompa en un subdirectorio
  })
})
