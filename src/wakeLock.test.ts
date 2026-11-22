import { keepScreenAwake } from './wakeLock'

function escenario(visible = true) {
  const sentinel = { released: false }
  const request = vi.fn(async () => sentinel)
  const navegador = { wakeLock: { request } } as unknown as Navigator
  const documento = document.implementation.createHTMLDocument()
  let estado: DocumentVisibilityState = visible ? 'visible' : 'hidden'
  Object.defineProperty(documento, 'visibilityState', { get: () => estado })
  const cambiar = (v: DocumentVisibilityState) => {
    estado = v
    documento.dispatchEvent(new Event('visibilitychange'))
  }
  return { sentinel, request, navegador, documento, cambiar }
}

describe('keepScreenAwake', () => {
  it('pide mantener la pantalla encendida al abrir la app', () => {
    const { request, navegador, documento } = escenario()
    keepScreenAwake(navegador, documento)
    expect(request).toHaveBeenCalledWith('screen')
  })

  it('no hace nada si el navegador no tiene Wake Lock', () => {
    expect(() => keepScreenAwake({} as Navigator, document)).not.toThrow()
  })

  it('no pide el bloqueo si la pestaña está oculta, y lo pide al volver', () => {
    const { request, navegador, documento, cambiar } = escenario(false)
    keepScreenAwake(navegador, documento)
    expect(request).not.toHaveBeenCalled()
    cambiar('visible')
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('lo vuelve a pedir al regresar si el navegador lo liberó', async () => {
    const { request, sentinel, navegador, documento, cambiar } = escenario()
    keepScreenAwake(navegador, documento)
    await Promise.resolve()
    sentinel.released = true
    cambiar('hidden')
    cambiar('visible')
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('no duplica la petición si el bloqueo sigue activo', async () => {
    const { request, navegador, documento, cambiar } = escenario()
    keepScreenAwake(navegador, documento)
    await Promise.resolve()
    cambiar('visible')
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('ignora el rechazo del navegador', async () => {
    const { navegador, documento, request } = escenario()
    request.mockRejectedValueOnce(new Error('NotAllowedError'))
    keepScreenAwake(navegador, documento)
    await Promise.resolve()
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(1)
  })
})
