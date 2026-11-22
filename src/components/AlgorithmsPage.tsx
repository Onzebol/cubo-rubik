import { ALGORITHMS, ALGORITHM_GROUPS } from '../algorithms'
import { AlgoPlayer } from './AlgoPlayer'

/** Sección para aprender los algoritmos que usan los cuberos, agrupados por para qué sirven. */
export function AlgorithmsPage({ instant }: { instant: boolean }) {
  return (
    <article className="lesson">
      <h1>Algoritmos de cuberos</h1>
      <p>
        Más allá del método por capas, los cuberos aprenden algoritmos que ya conocen de memoria. Aquí tienes los más usados, con el
        cubo 3D que los reproduce paso a paso. Cada ejemplo parte de la situación que ese algoritmo resuelve. Prueba después los
        que quieras en <a href="#/practica">Practicar</a>.
      </p>
      <p className="hint">Con el amarillo arriba (U) y la cara frontal (F) delante. Arrastra el cubo para verlo desde otro lado.</p>
      {ALGORITHM_GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
          <h2 id={`grupo-${g.id}`}>{g.title}</h2>
          <p className="hint">{g.intro}</p>
          {ALGORITHMS.filter((a) => a.group === g.id).map((a) => (
            <AlgoPlayer
              key={a.id}
              alg={a.alg}
              yellowUp
              title={a.name}
              instructions={`${a.purpose} ${a.recognize}`}
              highlight={a.highlight}
              instant={instant}
            />
          ))}
        </section>
      ))}
    </article>
  )
}
