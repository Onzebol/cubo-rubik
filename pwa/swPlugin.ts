import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { renderServiceWorker, versionOf } from '../src/pwa/sw-render.ts'

/**
 * Genera `sw.js` en cada build a partir de pwa/sw.template.js, con la lista de archivos de la app
 * (los del bundle y los de /public) y una versión derivada de ellos: si la app cambia, cambia el
 * service worker y los usuarios ven el botón «Actualizar».
 */
export function swPlugin(): Plugin {
  let publicDir = ''
  return {
    name: 'cubofacil-service-worker',
    apply: 'build',
    configResolved(config) {
      publicDir = config.publicDir
    },
    generateBundle(_opciones, bundle) {
      const delBundle = Object.keys(bundle).map((nombre) => ({ ruta: nombre, huella: nombre }))
      const dePublic = archivos(publicDir).map((ruta) => ({ ruta, huella: `${ruta}:${statSync(join(publicDir, ruta)).size}` }))
      const todos = [...delBundle, ...dePublic].filter((a) => a.ruta !== 'sw.js')
      // Vite añade index.html al bundle después de este hook: se incluye a mano (si no, la app no abriría sin conexión).
      // Su contenido ya cambia con cada versión porque enlaza archivos con hash en el nombre.
      if (!todos.some((a) => a.ruta === 'index.html')) todos.push({ ruta: 'index.html', huella: 'index.html' })
      const plantilla = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf-8')
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: renderServiceWorker(plantilla, versionOf(todos.map((a) => a.huella)), ['./', ...todos.map((a) => `./${a.ruta}`)]),
      })
    },
  }
}

/** Rutas (con /) de todos los archivos de una carpeta, recursivamente. */
function archivos(carpeta: string): string[] {
  if (!carpeta || !existsSync(carpeta)) return []
  return readdirSync(carpeta, { recursive: true, encoding: 'utf-8' })
    .filter((r) => statSync(join(carpeta, r)).isFile())
    .map((r) => r.replaceAll('\\', '/'))
}
