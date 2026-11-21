/**
 * Detección de versiones nuevas de la app (PWA).
 * Una versión nueva del service worker se instala y se queda «esperando»; la app avisa al usuario y,
 * solo cuando pulsa «Actualizar», la activa y recarga.
 */

/** Avisa cuando hay una versión nueva instalada y esperando (ya había otra controlando la app). */
export function watchForUpdates(
  registro: ServiceWorkerRegistration,
  hayControlador: () => boolean,
  alHaberVersionNueva: (worker: ServiceWorker) => void,
): void {
  if (registro.waiting && hayControlador()) alHaberVersionNueva(registro.waiting)
  registro.addEventListener('updatefound', () => {
    const nuevo = registro.installing
    if (!nuevo) return
    nuevo.addEventListener('statechange', () => {
      if (nuevo.state === 'installed' && hayControlador()) alHaberVersionNueva(nuevo)
    })
  })
}

/** Activa la versión nueva y recarga la página (una sola vez) cuando toma el control. */
export function applyUpdate(worker: ServiceWorker, contenedor: ServiceWorkerContainer, recargar: () => void): void {
  let recargado = false
  contenedor.addEventListener('controllerchange', () => {
    if (recargado) return
    recargado = true
    recargar()
  })
  worker.postMessage({ type: 'SKIP_WAITING' })
}

interface Opciones {
  /** URL del service worker (relativa, para funcionar en GitHub Pages). */
  swUrl: string
  /** Se llama con una función que aplica la versión nueva, cuando la hay. */
  alHaberVersionNueva: (aplicar: () => void) => void
  navegador?: Navigator
  recargar?: () => void
  /** Cada cuántos ms se busca una versión nueva (además de al volver a la pestaña). */
  cadaMs?: number
}

const UNA_HORA = 60 * 60 * 1000

/** Registra el service worker y vigila las versiones nuevas. Sin soporte, no hace nada. */
export async function registerServiceWorker({
  swUrl,
  alHaberVersionNueva,
  navegador = navigator,
  recargar = () => window.location.reload(),
  cadaMs = UNA_HORA,
}: Opciones): Promise<ServiceWorkerRegistration | undefined> {
  const contenedor = navegador.serviceWorker
  if (!contenedor) return undefined
  // updateViaCache: 'none' → el navegador no usa su caché HTTP para sw.js y detecta versiones nuevas enseguida
  const registro = await contenedor.register(swUrl, { updateViaCache: 'none' })
  watchForUpdates(registro, () => Boolean(contenedor.controller), (worker) =>
    alHaberVersionNueva(() => applyUpdate(worker, contenedor, recargar)),
  )
  const buscar = () => { void registro.update() }
  setInterval(buscar, cadaMs)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') buscar() })
  return registro
}
