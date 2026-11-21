/** Sustituye los marcadores de la plantilla del service worker. */
export function renderServiceWorker(plantilla: string, version: string, archivos: string[]): string {
  return plantilla.replaceAll('__VERSION__', version).replaceAll('__ASSETS__', JSON.stringify(archivos))
}

/**
 * Identificador de versión: hash (FNV-1a de 32 bits, en hexadecimal) de la lista de archivos de la app,
 * cada uno con algo que cambie si cambia su contenido (su nombre con hash o su tamaño).
 * Es estable y no depende del orden: el service worker solo cambia (y por tanto avisa) si cambia la app.
 */
export function versionOf(entradas: string[]): string {
  let h = 0x811c9dc5
  for (const c of [...entradas].sort().join('\n')) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
