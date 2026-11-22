/**
 * Mantiene la pantalla encendida mientras la app está abierta (Screen Wake Lock API).
 * El navegador libera el bloqueo al ocultar la pestaña, así que se vuelve a pedir al regresar.
 * Sin soporte (o si el navegador lo rechaza, p. ej. con poca batería), no hace nada.
 */
export function keepScreenAwake(
  navegador: Navigator = navigator,
  documento: Document = document,
): void {
  const wakeLock = (navegador as Navigator & { wakeLock?: WakeLock }).wakeLock
  if (!wakeLock) return
  let bloqueo: WakeLockSentinel | undefined
  const pedir = async () => {
    if (documento.visibilityState !== 'visible' || (bloqueo && !bloqueo.released)) return
    try {
      bloqueo = await wakeLock.request('screen')
    } catch {
      bloqueo = undefined
    }
  }
  void pedir()
  documento.addEventListener('visibilitychange', () => { void pedir() })
}
