import { useEffect, useState } from 'react'
import { aplicarTema, guardarTema, leerTema, type Tema } from './theme'

const ETIQUETAS: { tema: Tema; texto: string }[] = [
  { tema: 'auto', texto: 'Automático' },
  { tema: 'claro', texto: 'Claro' },
  { tema: 'oscuro', texto: 'Oscuro' },
]

export function ThemeSwitcher() {
  const [tema, setTema] = useState<Tema>(leerTema)

  useEffect(() => {
    aplicarTema(tema)
    if (tema !== 'auto' || typeof matchMedia !== 'function') return
    // en automático, la barra del navegador sigue al sistema si este cambia
    const mq = matchMedia('(prefers-color-scheme: light)')
    const on = () => aplicarTema('auto')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [tema])

  const elegir = (t: Tema) => { guardarTema(t); setTema(t) }

  return (
    <div className="tema" role="group" aria-label="Tema de la web">
      {ETIQUETAS.map(({ tema: t, texto }) => (
        <button key={t} type="button" aria-pressed={tema === t} onClick={() => elegir(t)}>{texto}</button>
      ))}
    </div>
  )
}
