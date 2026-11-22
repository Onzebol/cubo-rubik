export type Tema = 'auto' | 'claro' | 'oscuro'
export const TEMA_KEY = 'cubo-tema'
export const TEMAS: readonly Tema[] = ['auto', 'claro', 'oscuro']
/** Color de la barra del navegador en cada tema (igual que --bg en App.css) */
export const COLOR_BARRA = { claro: '#f4f5f9', oscuro: '#14161c' } as const

export function leerTema(): Tema {
  try {
    const t = localStorage.getItem(TEMA_KEY)
    return TEMAS.includes(t as Tema) ? (t as Tema) : 'auto'
  } catch {
    return 'auto'
  }
}

const sistemaClaro = () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches

/** Pone el tema en <html data-tema> (sin atributo = automático) y el color de la barra del navegador. */
export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement
  if (tema === 'auto') raiz.removeAttribute('data-tema')
  else raiz.setAttribute('data-tema', tema)
  const claro = tema === 'claro' || (tema === 'auto' && sistemaClaro())
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', claro ? COLOR_BARRA.claro : COLOR_BARRA.oscuro)
}

export function guardarTema(tema: Tema): void {
  try { localStorage.setItem(TEMA_KEY, tema) } catch { /* sin almacenamiento: vale solo para esta visita */ }
}
