import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import './App.css'
import { AlgoPlayer } from './components/AlgoPlayer'
import { AlgorithmsPage } from './components/AlgorithmsPage'
import { Cube3D } from './components/Cube3D'
import { isSolved, parseAlg, type Face } from './cube/cube'
import { createCubies, stickersOf } from './cube/cubies'
import { LESSONS, SOURCES, pathOf, type Lesson } from './lessons'
import { UpdateBanner } from './pwa/UpdateBanner'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useAnimator } from './useAnimator'

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

/** Texto con **negritas** */
function Rich({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>
}

function Home() {
  const stages = [...new Set(LESSONS.map((l) => l.stage))]
  return (
    <>
      <section className="hero">
        <h1>Aprende a resolver el cubo de Rubik</h1>
        <p>Método por capas de la guía oficial de Rubik&apos;s: lo ves en 3D, animado y paso a paso.</p>
      </section>
      {stages.map((s) => (
        <section key={s}>
          <h2>{s}</h2>
          {LESSONS.find((l) => l.stage === s)?.variant && (
            <p className="hint">Alternativa para comparar: comparte la cruz amarilla con la guía oficial, pero ordena la última capa en otro orden y con otros algoritmos.</p>
          )}
          <ul className="lessons">
            {LESSONS.filter((l) => l.stage === s).map((l) => (
              <li key={l.id}>
                <a href={`#/leccion/${l.id}`}>{l.title}</a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

/** Botón de la barra fija de abajo: título grande y, debajo, una descripción corta */
function StepLink({ href, dir, title, summary }: { href: string; dir: 'prev' | 'next'; title: string; summary: string }) {
  return (
    <a href={href} className={`step ${dir}`}>
      <span className="dir" aria-hidden="true">{dir === 'prev' ? '← Anterior' : 'Siguiente →'}</span>
      <span className="step-title">{title}</span>
      <span className="step-desc">{summary}</span>
    </a>
  )
}

function LessonView({ lesson, instant }: { lesson: Lesson; instant: boolean }) {
  const path = pathOf(lesson)
  const i = path.indexOf(lesson)
  const prev = path[i - 1]
  const next = path[i + 1]
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
      {lesson.altRoute && (
        <p className="tip">🔀 <Rich text={lesson.altRoute.text} /> <a href={`#/leccion/${lesson.altRoute.id}`}>{lesson.altRoute.label}</a></p>
      )}
      <h2>Míralo en el cubo</h2>
      <p className="hint">Desbloquea el cubo con el candado y arrástralo para verlo desde otro lado. Parte de la posición previa al algoritmo. El halo marca la pieza que se explica.</p>
      {lesson.demos.map((d) => (
        <AlgoPlayer key={`${lesson.id}-${d.id ?? d.title}`} alg={d.alg} setup={d.setup} instructions={d.instructions} yellowUp={lesson.yellowUp} title={d.title} focus={d.focus ?? lesson.focus} highlight={d.highlight} instant={instant} />
      ))}
      <nav className="pager" aria-label="Lecciones">
        {prev ? <StepLink href={`#/leccion/${prev.id}`} dir="prev" title={prev.title} summary={prev.summary} /> : <span />}
        {next
          ? <StepLink href={`#/leccion/${next.id}`} dir="next" title={next.title} summary={next.summary} />
          : <StepLink href="#/practica" dir="next" title="Practicar" summary="Mezcla el cubo y prueba lo que has aprendido." />}
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
      <p>El método y los algoritmos siguen la guía oficial de Rubik&apos;s. Hay una copia en el repositorio (<code>docs/</code>). La variante de la última capa sigue el tutorial de Kubekings.</p>
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
  useEffect(() => { window.scrollTo?.(0, 0) }, [hash])

  let page: ReactNode
  const m = hash.match(/^#\/leccion\/(.+)$/)
  const lesson = m ? LESSONS.find((l) => l.id === m[1]) : undefined
  if (lesson) page = <LessonView key={lesson.id} lesson={lesson} instant={instant} />
  else if (hash === '#/practica') page = <Practice instant={instant} />
  else if (hash === '#/algoritmos') page = <AlgorithmsPage instant={instant} />
  else if (hash === '#/fuentes') page = <Sources />
  else page = <Home />

  const cur = (ok: boolean) => (ok ? 'page' : undefined)

  return (
    <>
      <header className="top">
        <a href="#/" className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="28" height="28" />Cubo<span>Fácil</span></a>
        <nav aria-label="Principal">
          <a href="#/" aria-current={cur(!hash.startsWith('#/practica') && !hash.startsWith('#/fuentes') && !hash.startsWith('#/algoritmos'))}>Lecciones</a>
          <a href="#/algoritmos" aria-current={cur(hash === '#/algoritmos')}>Algoritmos</a>
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
