import template from '../../pwa/sw.template.js?raw'
import { renderServiceWorker, versionOf } from './sw-render'

const SCOPE = 'https://onzebol.github.io/cubo-rubik/'
const ASSETS = ['./', './index.html', './assets/index-abc.js', './assets/index-abc.css', './icon.svg']

type Escuchador = (e: unknown) => void

/** Ejecuta el service worker generado en un entorno simulado (self, caches, fetch). */
function cargarSW(version = 'v1', assets: string[] = ASSETS, cachesPrevias: Record<string, string[]> = {}) {
  const codigo = renderServiceWorker(template, version, assets)
  const escuchadores: Record<string, Escuchador> = {}
  const almacen = new Map<string, Map<string, string>>(
    Object.entries(cachesPrevias).map(([nombre, urls]) => [nombre, new Map(urls.map((u) => [u, `viejo:${u}`]))]),
  )
  const caches = {
    open: async (nombre: string) => {
      if (!almacen.has(nombre)) almacen.set(nombre, new Map())
      const c = almacen.get(nombre)!
      return { addAll: async (urls: string[]) => { for (const u of urls) c.set(u, `cache:${u}`) } }
    },
    keys: async () => [...almacen.keys()],
    delete: async (nombre: string) => almacen.delete(nombre),
    match: async (pedido: Request | string) => {
      const url = typeof pedido === 'string' ? pedido : pedido.url
      for (const c of almacen.values()) if (c.has(url)) return c.get(url)
      return undefined
    },
  }
  const red = vi.fn(async (pedido: Request | string) => `red:${typeof pedido === 'string' ? pedido : pedido.url}`)
  const self = {
    registration: { scope: SCOPE },
    location: new URL(SCOPE),
    clients: { claim: vi.fn(async () => {}) },
    skipWaiting: vi.fn(),
    addEventListener: (tipo: string, fn: Escuchador) => { escuchadores[tipo] = fn },
  }
  new Function('self', 'caches', 'fetch', codigo)(self, caches, red)

  /** Lanza un evento y espera a las promesas que el worker registre con waitUntil/respondWith. */
  const lanzar = async (tipo: string, datos: Record<string, unknown> = {}) => {
    const pendientes: Promise<unknown>[] = []
    let respuesta: Promise<unknown> | undefined
    const evento = {
      ...datos,
      waitUntil: (p: Promise<unknown>) => { pendientes.push(p) },
      respondWith: (p: Promise<unknown>) => { respuesta = p },
    }
    escuchadores[tipo]?.(evento)
    await Promise.all(pendientes)
    return { respondido: respuesta !== undefined, respuesta: await respuesta }
  }
  const pedir = (url: string, extra: Record<string, unknown> = {}) =>
    lanzar('fetch', { request: { url, method: 'GET', mode: 'cors', ...extra } })

  return { almacen, self, red, lanzar, pedir, escuchadores }
}

describe('service worker: instalación', () => {
  it('precarga todos los archivos de la app, con URLs absolutas dentro del alcance, en la caché de su versión', async () => {
    const sw = cargarSW('v1')
    await sw.lanzar('install')
    const cache = sw.almacen.get('cubofacil-v1')!
    expect([...cache.keys()].sort()).toEqual(
      [SCOPE, `${SCOPE}index.html`, `${SCOPE}assets/index-abc.js`, `${SCOPE}assets/index-abc.css`, `${SCOPE}icon.svg`].sort(),
    )
  })
  it('NO se activa solo: se queda esperando a que el usuario pulse «Actualizar»', async () => {
    const sw = cargarSW()
    await sw.lanzar('install')
    expect(sw.self.skipWaiting).not.toHaveBeenCalled()
  })
})

describe('service worker: activación', () => {
  it('borra las cachés de versiones anteriores, conserva la actual y las ajenas, y toma el control', async () => {
    const sw = cargarSW('v2', ASSETS, { 'cubofacil-v1': ['./x'], 'cubofacil-v2': ['./y'], 'otra-app': ['./z'] })
    await sw.lanzar('activate')
    expect([...sw.almacen.keys()].sort()).toEqual(['cubofacil-v2', 'otra-app'])
    expect(sw.self.clients.claim).toHaveBeenCalled()
  })
})

describe('service worker: mensajes', () => {
  it('SKIP_WAITING activa la versión nueva', async () => {
    const sw = cargarSW()
    await sw.lanzar('message', { data: { type: 'SKIP_WAITING' } })
    expect(sw.self.skipWaiting).toHaveBeenCalledTimes(1)
  })
  it('cualquier otro mensaje se ignora', async () => {
    const sw = cargarSW()
    await sw.lanzar('message', { data: { type: 'OTRA_COSA' } })
    await sw.lanzar('message', { data: undefined })
    expect(sw.self.skipWaiting).not.toHaveBeenCalled()
  })
})

describe('service worker: peticiones (funciona sin conexión)', () => {
  it('sirve de la caché lo que está precargado, sin tocar la red', async () => {
    const sw = cargarSW()
    await sw.lanzar('install')
    const r = await sw.pedir(`${SCOPE}assets/index-abc.js`)
    expect(r.respuesta).toBe(`cache:${SCOPE}assets/index-abc.js`)
    expect(sw.red).not.toHaveBeenCalled()
  })
  it('lo que no está en caché va a la red', async () => {
    const sw = cargarSW()
    await sw.lanzar('install')
    const r = await sw.pedir(`${SCOPE}otro.json`)
    expect(r.respuesta).toBe(`red:${SCOPE}otro.json`)
  })
  it('las navegaciones devuelven siempre la página principal de la caché', async () => {
    const sw = cargarSW()
    await sw.lanzar('install')
    const r = await sw.pedir(`${SCOPE}#/leccion/margarita`, { mode: 'navigate' })
    expect(r.respuesta).toBe(`cache:${SCOPE}index.html`)
  })
  it('no intercepta peticiones que no son GET ni de otro origen', async () => {
    const sw = cargarSW()
    await sw.lanzar('install')
    expect((await sw.pedir(`${SCOPE}api`, { method: 'POST' })).respondido).toBe(false)
    expect((await sw.pedir('https://otro-sitio.test/lib.js')).respondido).toBe(false)
  })
})

describe('generación del service worker', () => {
  it('inserta la versión y la lista de archivos, sin dejar marcadores sin sustituir', () => {
    const codigo = renderServiceWorker(template, 'abc123', ['./', './a.js'])
    expect(codigo).toContain('abc123')
    expect(codigo).toContain('"./a.js"')
    expect(codigo).not.toContain('__VERSION__')
    expect(codigo).not.toContain('__ASSETS__')
  })
  it('la versión es estable, no depende del orden y cambia si cambia algún archivo', () => {
    expect(versionOf(['a.js:1', 'b.css:2'])).toBe(versionOf(['b.css:2', 'a.js:1']))
    expect(versionOf(['a.js:1', 'b.css:2'])).not.toBe(versionOf(['a.js:1', 'b.css:3']))
    expect(versionOf(['a.js:1'])).toMatch(/^[0-9a-f]{8}$/)
  })
})
