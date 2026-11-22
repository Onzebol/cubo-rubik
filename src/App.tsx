import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import './App.css'
import { AlgoPlayer } from './components/AlgoPlayer'
import { Cube3D } from './components/Cube3D'
import { isSolved, parseAlg, type Face } from './cube/cube'
import { createCubies, stickersOf } from './cube/cubies'
import { LESSONS, SOURCES, type Lesson } from './lessons'
import { UpdateBanner } from './pwa/UpdateBanner'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useAnimator } from './useAnimator'

const PROGRESS_KEY = 'cubo-progreso'

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

function useProgress() {
  const [done, setDone] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]') } catch { return [] }
  })
  const toggle = (id: string) => setDone((d) => {
    const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id]
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
    return next
  })
  return { done, toggle }
}

/** Texto con **negritas** */
function Rich({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>
}

function Home({ done }: { done: string[] }) {
  const stages = [...new Set(LESSONS.map((l) => l.stage))]
  const pct = Math.round((done.length / LESSONS.length) * 100)
  return (
    <>
      <section className="hero">
        <h1>Aprende a resolver el cubo de Rubik</h1>
        <p>Método por capas de la guía oficial de Rubik&apos;s: lo ves en 3D, animado y paso a paso.</p>
        <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso">
          <span style={{ width: `${pct}%` }} />
        </div>
        <small>{done.length} de {LESSONS.length} lecciones</small>
      </section>
      {stages.map((s) => (
        <section key={s}>
          <h2>{s}</h2>
          <ul className="lessons">
            {LESSONS.filter((l) => l.stage === s).map((l) => (
              <li key={l.id}>
                <a href={`#/leccion/${l.id}`} className={done.includes(l.id) ? 'done' : ''}>
                  <span className="tick" aria-hidden="true">{done.includes(l.id) ? '✓' : '○'}</span>
                  <span>{l.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

function LessonView({ lesson, done, toggle, instant }: { lesson: Lesson; done: boolean; toggle: () => void; instant: boolean }) {
  const i = LESSONS.indexOf(lesson)
  const prev = LESSONS[i - 1]
  const next = LESSONS[i + 1]
  return (
    <article className="lesson">
      <p className="stage">{lesson.stage}</p>
      <h1>{lesson.title}</h1>
      <p className="holding"><strong>Cómo sujetar el cubo:</strong> {lesson.holding}</p>
      <p><Rich text={lesson.intro} /></p>
      <ul className="points">
        {lesson.points.map((p) => <li key={p}><Rich text={p} /></li>)}
      </ul>
      {lesson.tip && <p className="tip">💡 <Rich text={lesson.tip} /></p>}
      <h2>Míralo en el cubo</h2>
      <p className="hint">Desbloquea el cubo con el candado y arrástralo para verlo desde otro lado. Parte de la posición previa al algoritmo. El halo marca la pieza que se explica.</p>
      {lesson.demos.map((d) => (
        <AlgoPlayer key={`${lesson.id}-${d.id ?? d.title}`} alg={d.alg} setup={d.setup} instructions={d.instructions} yellowUp={lesson.yellowUp} title={d.title} focus={d.focus ?? lesson.focus} highlight={d.highlight} instant={instant} />
      ))}
      <label className="check">
        <input type="checkbox" checked={done} onChange={toggle} /> Marcar como hecha
      </label>
      <nav className="pager" aria-label="Lecciones">
        {prev ? <a href={`#/leccion/${prev.id}`}>← {prev.title}</a> : <span />}
        {next ? <a href={`#/leccion/${next.id}`}>{next.title} →</a> : <a href="#/practica">Practicar →</a>}
      </nav>
    </article>
  )
}

const FACES: Face[] = ['U', 'D', 'L', 'R', 'F', 'B']

function Practice({ instant }: { instant: boolean }) {
  const anim = useAnimator(() => createCubies(false), instant)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const [moved, setMoved] = useState(false)

  const run = useCallback((alg: string, ms = 260) => {
    setMoved(true)
    for (const m of parseAlg(alg)) queue.current = queue.current.then(() => anim.move(m, instant ? 0 : ms))
  }, [anim, instant])

  const scramble = () => {
    const out: string[] = []
    let last = ''
    while (out.length < 20) {
      const f = FACES[Math.floor(Math.random() * 6)]
      if (f === last) continue
      last = f
      out.push(f + ['', "'", '2'][Math.floor(Math.random() * 3)])
    }
    run(out.join(' '), 110)
  }
  const reset = () => { queue.current = Promise.resolve(); anim.reset(createCubies(false)); setMoved(false) }
  const solved = moved && isSolved(stickersOf(anim.cubies))

  return (
    <article className="lesson">
      <h1>Practicar</h1>
      <p>Mezcla el cubo y prueba los algoritmos que has aprendido. Desbloquea el cubo con el candado para girar la vista.</p>
      <Cube3D cubies={anim.cubies} turn={anim.turn} />
      {solved && <p className="ok big">¡Cubo resuelto! 🎉</p>}
      <div className="pad" role="group" aria-label="Giros">
        {FACES.map((f) => (
          <span key={f} className="pair">
            <button type="button" onClick={() => run(f)}>{f}</button>
            <button type="button" onClick={() => run(`${f}'`)}>{f}&apos;</button>
            <button type="button" onClick={() => run(`${f}2`)}>{f}2</button>
          </span>
        ))}
      </div>
      <div className="controls">
        <button type="button" className="primary" onClick={scramble}>Mezclar</button>
        <button type="button" onClick={reset}>Reiniciar cubo</button>
      </div>
    </article>
  )
}

function Sources() {
  return (
    <article className="lesson">
      <h1>Fuentes</h1>
      <p>El método y los algoritmos siguen la guía oficial de Rubik&apos;s. Hay una copia en el repositorio (<code>docs/</code>).</p>
      <ul className="points">
        {SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}
      </ul>
    </article>
  )
}

const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App({ instant = reducedMotion() }: { instant?: boolean }) {
  const hash = useHash()
  const { done, toggle } = useProgress()
  useEffect(() => { window.scrollTo?.(0, 0) }, [hash])

  let page: ReactNode
  const m = hash.match(/^#\/leccion\/(.+)$/)
  const lesson = m ? LESSONS.find((l) => l.id === m[1]) : undefined
  if (lesson) page = <LessonView key={lesson.id} lesson={lesson} done={done.includes(lesson.id)} toggle={() => toggle(lesson.id)} instant={instant} />
  else if (hash === '#/practica') page = <Practice instant={instant} />
  else if (hash === '#/fuentes') page = <Sources />
  else page = <Home done={done} />

  const cur = (ok: boolean) => (ok ? 'page' : undefined)

  return (
    <>
      <header className="top">
        <a href="#/" className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="28" height="28" />Cubo<span>Fácil</span></a>
        <nav aria-label="Principal">
          <a href="#/" aria-current={cur(!hash.startsWith('#/practica') && !hash.startsWith('#/fuentes'))}>Lecciones</a>
          <a href="#/practica" aria-current={cur(hash === '#/practica')}>Practicar</a>
          <a href="#/fuentes" aria-current={cur(hash === '#/fuentes')}>Fuentes</a>
        </nav>
      </header>
      <main>{page}</main>
      <footer className="pie"><ThemeSwitcher /></footer>
      <UpdateBanner />
    </>
  )
}
