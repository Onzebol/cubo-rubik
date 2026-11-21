import { applyUpdate, registerServiceWorker, watchForUpdates } from './update'

class FakeWorker extends EventTarget {
  state = 'installing'
  postMessage = vi.fn()
  cambiarA(estado: string) { this.state = estado; this.dispatchEvent(new Event('statechange')) }
}
class FakeRegistration extends EventTarget {
  waiting: FakeWorker | null = null
  installing: FakeWorker | null = null
  update = vi.fn(async () => {})
}
class FakeContainer extends EventTarget {
  controller: object | null = {}
  registration = new FakeRegistration()
  register = vi.fn(async () => this.registration)
}
const comoRegistro = (r: FakeRegistration) => r as unknown as ServiceWorkerRegistration
const comoWorker = (w: FakeWorker) => w as unknown as ServiceWorker
const comoContenedor = (c: FakeContainer) => c as unknown as ServiceWorkerContainer

describe('watchForUpdates', () => {
  it('avisa si ya hay una versión esperando y la app estaba controlada por otra', () => {
    const reg = new FakeRegistration()
    reg.waiting = new FakeWorker()
    const aviso = vi.fn()
    watchForUpdates(comoRegistro(reg), () => true, aviso)
    expect(aviso).toHaveBeenCalledWith(reg.waiting)
  })
  it('no avisa en la primera instalación (no había versión anterior)', () => {
    const reg = new FakeRegistration()
    reg.waiting = new FakeWorker()
    const aviso = vi.fn()
    watchForUpdates(comoRegistro(reg), () => false, aviso)
    expect(aviso).not.toHaveBeenCalled()
  })
  it('avisa cuando una versión nueva termina de instalarse', () => {
    const reg = new FakeRegistration()
    const aviso = vi.fn()
    watchForUpdates(comoRegistro(reg), () => true, aviso)
    const nuevo = new FakeWorker()
    reg.installing = nuevo
    reg.dispatchEvent(new Event('updatefound'))
    nuevo.cambiarA('installing')
    expect(aviso).not.toHaveBeenCalled() // aún se está instalando
    nuevo.cambiarA('installed')
    expect(aviso).toHaveBeenCalledTimes(1)
    expect(aviso).toHaveBeenCalledWith(nuevo)
  })
  it('una instalación nueva sin versión anterior no se anuncia como actualización', () => {
    const reg = new FakeRegistration()
    const aviso = vi.fn()
    watchForUpdates(comoRegistro(reg), () => false, aviso)
    const nuevo = new FakeWorker()
    reg.installing = nuevo
    reg.dispatchEvent(new Event('updatefound'))
    nuevo.cambiarA('installed')
    expect(aviso).not.toHaveBeenCalled()
  })
})

describe('applyUpdate', () => {
  it('le pide a la versión nueva que se active', () => {
    const w = new FakeWorker()
    applyUpdate(comoWorker(w), comoContenedor(new FakeContainer()), () => {})
    expect(w.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
  })
  it('recarga la página una sola vez cuando la versión nueva toma el control', () => {
    const contenedor = new FakeContainer()
    const recargar = vi.fn()
    applyUpdate(comoWorker(new FakeWorker()), comoContenedor(contenedor), recargar)
    expect(recargar).not.toHaveBeenCalled() // no antes de que la nueva versión tome el control
    contenedor.dispatchEvent(new Event('controllerchange'))
    contenedor.dispatchEvent(new Event('controllerchange'))
    expect(recargar).toHaveBeenCalledTimes(1)
  })
})

describe('registerServiceWorker', () => {
  afterEach(() => { vi.useRealTimers() })

  it('sin soporte de service workers no hace nada ni falla', async () => {
    const aviso = vi.fn()
    await expect(registerServiceWorker({ swUrl: './sw.js', alHaberVersionNueva: aviso, navegador: {} as Navigator })).resolves.toBeUndefined()
    expect(aviso).not.toHaveBeenCalled()
  })
  it('registra el service worker sin usar la caché HTTP (para detectar versiones nuevas enseguida)', async () => {
    const contenedor = new FakeContainer()
    await registerServiceWorker({ swUrl: './sw.js', alHaberVersionNueva: vi.fn(), navegador: { serviceWorker: comoContenedor(contenedor) } as Navigator })
    expect(contenedor.register).toHaveBeenCalledWith('./sw.js', { updateViaCache: 'none' })
  })
  it('cuando hay versión nueva entrega una función que la aplica', async () => {
    const contenedor = new FakeContainer()
    contenedor.registration.waiting = new FakeWorker()
    const aviso = vi.fn()
    await registerServiceWorker({ swUrl: './sw.js', alHaberVersionNueva: aviso, navegador: { serviceWorker: comoContenedor(contenedor) } as Navigator, recargar: vi.fn() })
    expect(aviso).toHaveBeenCalledTimes(1)
    const aplicar = aviso.mock.calls[0][0] as () => void
    aplicar()
    expect(contenedor.registration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
  })
  it('busca versiones nuevas cada cierto tiempo', async () => {
    vi.useFakeTimers()
    const contenedor = new FakeContainer()
    await registerServiceWorker({ swUrl: './sw.js', alHaberVersionNueva: vi.fn(), navegador: { serviceWorker: comoContenedor(contenedor) } as Navigator, cadaMs: 1000 })
    expect(contenedor.registration.update).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(contenedor.registration.update).toHaveBeenCalledTimes(1)
  })
  it('y también al volver a la pestaña', async () => {
    const contenedor = new FakeContainer()
    await registerServiceWorker({ swUrl: './sw.js', alHaberVersionNueva: vi.fn(), navegador: { serviceWorker: comoContenedor(contenedor) } as Navigator, cadaMs: 10_000_000 })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(contenedor.registration.update).toHaveBeenCalledTimes(1)
  })
})
