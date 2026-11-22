// Algoritmos que usan los cuberos más allá del método por capas. Todos van con giros de cara (sin M, x ni giros de capas dobles).
// Cada uno se comprueba con el modelo del cubo en src/algorithms.test.ts: las piezas y casos que cita el texto son los que mueve de verdad.

export type AlgorithmGroup = 'disparadores' | 'oll' | 'pll'

export interface Algorithm {
  id: string
  group: AlgorithmGroup
  name: string
  alg: string
  /** para qué sirve */
  purpose: string
  /** cómo reconocer el caso o qué hace con las piezas */
  recognize: string
  /** piezas a resaltar indicadas a mano (por colores, p. ej. 'GOY'); por defecto, las que mueve el algoritmo si son pocas */
  highlight?: string[]
}

export const ALGORITHM_GROUPS: { id: AlgorithmGroup; title: string; intro: string }[] = [
  {
    id: 'disparadores',
    title: 'Disparadores',
    intro: 'Secuencias cortas que se repiten dentro de otros algoritmos. Conviene hacerlas sin pensar: así reconocerás los algoritmos largos como combinaciones de ellas.',
  },
  {
    id: 'oll',
    title: 'Orientar la última capa (OLL)',
    intro: 'Dejan todo el amarillo arriba. Parten de la cruz amarilla ya hecha y respetan las dos primeras capas. De momento no importa si las piezas están en su sitio.',
  },
  {
    id: 'pll',
    title: 'Colocar la última capa (PLL)',
    intro: 'Con todo el amarillo ya arriba, cambian piezas de sitio sin girarlas y respetan las dos primeras capas. Se miran desde arriba, con la cara frontal delante.',
  },
]

export const ALGORITHMS: Algorithm[] = [
  // Disparadores
  {
    id: 'sexy', group: 'disparadores', name: 'Disparador «sexy move»', alg: "R U R' U'",
    purpose: 'Es la secuencia más repetida del cubo: está dentro del Sune, de la cruz amarilla y de muchos más. No resuelve nada por sí sola.',
    recognize: 'Repetida 6 veces seguidas, el cubo vuelve a quedar como estaba: úsala para entrenar la mano sin descolocar nada.',
  },
  {
    id: 'sledgehammer', group: 'disparadores', name: 'Disparador «sledgehammer»', alg: "R' F R F'",
    purpose: 'El mismo juego que el anterior con las caras R y F. Aparece dentro de muchos algoritmos más largos.',
    recognize: 'Repetido 6 veces seguidas, el cubo vuelve a quedar como estaba.',
  },
  {
    id: 'esquina', group: 'disparadores', name: 'Disparador de esquina', alg: "R' D' R D",
    purpose: 'El que orienta esquinas en la variante de Kubekings: se repite 2 o 4 veces por esquina.',
    recognize: 'Repetido 6 veces seguidas, el cubo vuelve a quedar como estaba. Con 1 o 3 repeticiones no orienta la esquina.',
  },

  // OLL
  {
    id: 'cruz', group: 'oll', name: 'Cruz amarilla', alg: "F U R U' R' F'",
    purpose: 'Forma la cruz amarilla desde el punto, la línea o la «L» de aristas amarillas; se repite hasta que la cruz esté hecha.',
    recognize: 'Hay dos aristas amarillas arriba (aquí, una «L»). Colócalas hacia atrás y hacia la izquierda, o en línea horizontal, y aplica el algoritmo.',
  },
  {
    id: 'sune', group: 'oll', name: 'Sune', alg: "R U R' U R U2 R'",
    purpose: 'El algoritmo más famoso de la última capa: gira esquinas hasta dejarlas todas con el amarillo arriba.',
    recognize: 'Cruz hecha y una sola esquina con el amarillo arriba. Ponla delante a la izquierda y aplica el algoritmo: las cuatro esquinas quedan amarillas.',
  },
  {
    id: 'antisune', group: 'oll', name: 'Anti-Sune', alg: "R' U' R U' R' U2 R",
    purpose: 'El espejo del Sune: hace lo mismo cuando la esquina amarilla está al otro lado.',
    recognize: 'Cruz hecha y una sola esquina con el amarillo arriba. Ponla detrás a la izquierda y aplica el algoritmo: las cuatro esquinas quedan amarillas.',
  },
  {
    id: 'h', group: 'oll', name: 'Caso H', alg: "R U R' U R U' R' U R U2 R'",
    purpose: 'Orienta las esquinas cuando ninguna tiene el amarillo arriba y el amarillo de sus lados forma una «H».',
    recognize: 'Cruz hecha y ninguna esquina con el amarillo arriba: las dos esquinas de la izquierda lo tienen mirando a la izquierda y las dos de la derecha, a la derecha.',
  },
  {
    id: 'pi', group: 'oll', name: 'Caso Pi', alg: "R U2 R2 U' R2 U' R2 U2 R",
    purpose: 'Orienta las esquinas cuando ninguna tiene el amarillo arriba y el amarillo de sus lados forma una «π».',
    recognize: 'Cruz hecha y ninguna esquina con el amarillo arriba: las dos de la izquierda lo tienen mirando a la izquierda, la de delante a la derecha mirando al frente y la de atrás a la derecha mirando hacia atrás.',
  },

  // PLL
  {
    id: 'ua', group: 'pll', name: 'Ua: aristas en círculo', alg: "R U' R U R U R U' R' U' R2",
    purpose: 'Coloca tres aristas de la última capa; la cuarta ya está bien.',
    recognize: 'Tres aristas giran en círculo (delante, derecha e izquierda) y la de atrás está bien. La de delante pasa a la derecha, la derecha a la izquierda y la izquierda a delante.',
  },
  {
    id: 'ub', group: 'pll', name: 'Ub: aristas en círculo al revés', alg: "R2 U R U R' U' R' U' R' U R'",
    purpose: 'Lo mismo que Ua pero en sentido contrario.',
    recognize: 'Tres aristas giran en círculo (delante, derecha e izquierda) y la de atrás está bien. La de delante pasa a la izquierda, la izquierda a la derecha y la derecha a delante.',
  },
  {
    id: 'aa', group: 'pll', name: 'Aa: esquinas en círculo', alg: "R' F R' B2 R F' R' B2 R2",
    purpose: 'Coloca tres esquinas de la última capa; la cuarta ya está bien. Es el algoritmo de la guía oficial para colocar esquinas, sin la U final.',
    recognize: 'Tres esquinas giran en círculo y la de delante a la izquierda está bien. La de delante a la derecha pasa a atrás a la izquierda, la de atrás a la izquierda a atrás a la derecha y la de atrás a la derecha a delante a la derecha.',
  },
  {
    id: 'ab', group: 'pll', name: 'Ab: esquinas en círculo al revés', alg: "R2 B2 R F R' B2 R F' R",
    purpose: 'Lo mismo que Aa pero en sentido contrario.',
    recognize: 'Tres esquinas giran en círculo y la de delante a la izquierda está bien. La de delante a la derecha pasa a atrás a la derecha, la de atrás a la derecha a atrás a la izquierda y la de atrás a la izquierda a delante a la derecha.',
  },
  {
    id: 't', group: 'pll', name: 'T: dos aristas y dos esquinas', alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
    purpose: 'Cambia dos esquinas contiguas y las dos aristas de los lados.',
    recognize: 'Se cambian entre sí la arista de la izquierda y la de la derecha, y las dos esquinas de la derecha (delante y atrás).',
    highlight: ['BOY', 'GOY', 'OY', 'RY'],
  },
  {
    id: 'y', group: 'pll', name: 'Y: dos aristas y dos esquinas en diagonal', alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    purpose: 'Cambia dos esquinas en diagonal y dos aristas.',
    recognize: 'Se cambian entre sí la arista de atrás y la de la izquierda, y dos esquinas en diagonal (delante a la derecha y atrás a la izquierda).',
    highlight: ['BRY', 'BY', 'GOY', 'RY'],
  },
  {
    id: 'jb', group: 'pll', name: 'Jb: dos aristas y dos esquinas', alg: "R U R' F' R U R' U' R' F R2 U' R' U'",
    purpose: 'Cambia dos esquinas contiguas y dos aristas contiguas.',
    recognize: 'Se cambian entre sí la arista de delante y la de la derecha, y las dos esquinas de la derecha (delante y atrás).',
    highlight: ['BOY', 'GOY', 'GY', 'OY'],
  },
  {
    id: 'ja', group: 'pll', name: 'Ja: dos aristas y dos esquinas', alg: "L' U' L F L' U' L U L F' L2 U L U",
    purpose: 'El espejo del Jb: hace lo mismo en el lado izquierdo.',
    recognize: 'Se cambian entre sí la arista de delante y la de la izquierda, y las dos esquinas de la izquierda (delante y atrás).',
    highlight: ['BRY', 'GRY', 'GY', 'RY'],
  },
]
