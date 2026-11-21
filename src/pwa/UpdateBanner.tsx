import { useEffect, useState } from 'react'
import { registerServiceWorker } from './update'

type Registrar = (alHaberVersionNueva: (aplicar: () => void) => void) => void

/** Registra el service worker (solo en producción: en desarrollo la caché estorbaría). */
const registrarReal: Registrar = (alHaberVersionNueva) => {
  if (!import.meta.env.PROD) return
  void registerServiceWorker({ swUrl: `${import.meta.env.BASE_URL}sw.js`, alHaberVersionNueva })
}

/** Aviso con el botón «Actualizar» cuando se ha desplegado una versión nueva de la app. */
export function UpdateBanner({ register = registrarReal }: { register?: Registrar }) {
  const [aplicar, setAplicar] = useState<(() => void) | null>(null)
  const [actualizando, setActualizando] = useState(false)

  useEffect(() => {
    register((fn) => setAplicar(() => fn))
  }, [register])

  if (!aplicar) return null
  return (
    <div className="update-banner" role="status">
      <span>Hay una nueva versión de CuboFácil.</span>
      <button
        type="button"
        className="primary"
        disabled={actualizando}
        onClick={() => {
          setActualizando(true)
          aplicar()
        }}
      >
        {actualizando ? 'Actualizando…' : 'Actualizar'}
      </button>
    </div>
  )
}
