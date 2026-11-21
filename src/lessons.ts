// Método por capas de la guía oficial "You Can Do the Rubik's Cube — Solution Guide"
// (Rubik's, v1-EU-M-2020). Copia en docs/Rubiks-3x3-Solve-Guide.pdf.
export interface Demo {
  title: string
  alg: string
  note?: string
}
export interface Lesson {
  id: string
  stage: 'Antes de empezar' | 'Primera capa' | 'Capa del medio' | 'Última capa'
  title: string
  holding: string
  intro: string
  points: string[]
  tip?: string
  /** true: el cubo se muestra con amarillo arriba (blanco abajo); false: blanco arriba */
  yellowUp: boolean
  demos: Demo[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'notacion', stage: 'Antes de empezar', title: 'Conoce tu cubo y la notación', yellowUp: false,
    holding: 'Deja el cubo sobre la mesa y no cambies la cara frontal durante un algoritmo.',
    intro: 'Resolverás el cubo capa a capa. Cada letra es una cara y un giro horario mirándola de frente.',
    points: [
      '**Centros** (1 color, fijos): marcan el color de cada cara. Blanco opuesto a amarillo, azul a verde, naranja a rojo.',
      '**Aristas** (2 colores, 12) y **esquinas** (3 colores, 8).',
      '**U** arriba, **D** abajo, **L** izquierda, **R** derecha, **F** frente, **B** detrás: un cuarto de vuelta en sentido horario.',
      "Con apóstrofo (**R'**): giro inverso, antihorario. Con un 2 (**D2**): dos veces.",
    ],
    tip: 'Mantén la cara frontal durante todo el algoritmo. Piensa en un algoritmo como sacar una pieza, preparar su hueco y meterla.',
    demos: [
      { title: 'Giro horario de R', alg: 'R' },
      { title: 'Giro inverso de R', alg: "R'" },
      { title: 'Media vuelta de D', alg: 'D2' },
    ],
  },
  {
    id: 'margarita', stage: 'Primera capa', title: 'Paso 1: la margarita', yellowUp: true,
    holding: 'Con el centro AMARILLO en la cara de arriba (U).',
    intro: 'Sube las 4 aristas blancas alrededor del centro amarillo. Da igual que el blanco no toque el amarillo en este paso.',
    points: [
      'Acción 1: en la capa de arriba, deja donde están las aristas con blanco.',
      'Acción 2: las aristas con blanco de la capa del medio, súbelas a la capa de arriba.',
      'Acción 3: las de la capa de abajo, súbelas también (por ejemplo con F2).',
      "Si el blanco no queda en la cara de arriba, hay que «voltear» la arista: ponla en la cara derecha y haz **R' U F'**.",
    ],
    tip: 'Cuidado con sacar las aristas blancas que ya están en la margarita: gira U para apartar una antes de subir otra.',
    demos: [
      { title: 'Subir una arista desde abajo', alg: 'F2' },
      { title: 'Voltear una arista', alg: "R' U F'" },
    ],
  },
  {
    id: 'cruz-blanca', stage: 'Primera capa', title: 'Paso 2: cruz blanca con aristas emparejadas', yellowUp: true,
    holding: 'Con la margarita arriba (U), mirando a la cara frontal.',
    intro: 'Baja cada arista blanca para formar la cruz blanca, con el otro color de cada arista igual al centro de su lado.',
    points: [
      'Acción 1: si el color frontal de la arista de arriba coincide con el centro frontal, pasa a la acción 2. Si no, gira U hasta que coincida.',
      'Acción 2: gira la cara frontal dos veces (**F2**) y el blanco queda abajo.',
      'Acción 3: repite con cada arista blanca.',
      'Acción 4: con las 4 aristas colocadas, da la vuelta al cubo y verás la cruz blanca.',
    ],
    demos: [{ title: 'Bajar la arista', alg: 'F2' }],
  },
  {
    id: 'esquinas-blancas', stage: 'Primera capa', title: 'Paso 3: las esquinas blancas', yellowUp: false,
    holding: 'Con la cruz blanca en la cara de arriba (U).',
    intro: 'La esquina bien colocada queda entre los centros que tienen sus mismos colores (la roja/azul/blanca, entre el rojo, el azul y el blanco).',
    points: [
      "Acción 1: localiza una esquina con blanco en la capa de abajo. Si está arriba y mal colocada, bájala con **R' D' R**.",
      'Acción 2: gira D hasta que la esquina quede entre los dos centros de sus colores.',
      "Acción 3: pon el blanco en la cara frontal. Si el blanco mira abajo, con la esquina en la cara derecha: **F D' F' D2**.",
      "Acción 4: blanco a la izquierda: **D L D' L'**. Blanco a la derecha: **D' R' D R**.",
      'Acción 5: repite hasta tener las 4 esquinas blancas.',
    ],
    demos: [
      { title: 'Bajar una esquina de arriba', alg: "R' D' R" },
      { title: 'Blanco mirando abajo', alg: "F D' F' D2" },
      { title: 'Blanco a la izquierda', alg: "D L D' L'" },
      { title: 'Blanco a la derecha', alg: "D' R' D R" },
    ],
  },
  {
    id: 'capa-medio', stage: 'Capa del medio', title: 'Resolver la capa del medio', yellowUp: true,
    holding: 'Da la vuelta al cubo: la cara blanca completada abajo (D).',
    intro: 'Coloca las 4 aristas de la capa central, las que no llevan amarillo.',
    points: [
      'Acción 1: elige una cara frontal y gira U hasta formar una línea vertical que coincida con una de las imágenes de la guía (color frontal de la arista de arriba = centro frontal).',
      'Si no puedes, saca una arista mal colocada de la capa del medio (con el algoritmo «Moviendo a la derecha» con esa arista en la cara derecha) y vuelve a la acción 1.',
      "Acción 2: hacia la izquierda: **U' L' U L** y luego **U F U' F'**. Hacia la derecha: **U R U' R'** y luego **U' F' U F**.",
      'Acción 3: repite hasta completar la capa del medio.',
    ],
    demos: [
      { title: 'Izquierda, parte 1: junto a su esquina', alg: "U' L' U L" },
      { title: 'Izquierda, parte 2: a su sitio', alg: "U F U' F'" },
      { title: 'Derecha, parte 1: junto a su esquina', alg: "U R U' R'" },
      { title: 'Derecha, parte 2: a su sitio', alg: "U' F' U F" },
    ],
  },
  {
    id: 'cruz-amarilla', stage: 'Última capa', title: 'Paso 1: la cruz amarilla', yellowUp: true,
    holding: 'Fíjate solo en las aristas amarillas de la cara de arriba (no en las esquinas).',
    intro: 'Mira si tienes un punto, una «L» o una línea y aplica el algoritmo. Se repite hasta formar la cruz.',
    points: [
      "Acción 1: **F U R U' R' F'**.",
      'Acción 2: si aún no hay cruz, vuelve a comparar con las imágenes de la guía y repite el algoritmo.',
    ],
    tip: "Regla para recordarlo: «FUR dice U'R'F'». Los tres primeros giros van a derechas y los otros tres al revés.",
    demos: [{ title: 'Hacer la cruz amarilla', alg: "F U R U' R' F'" }],
  },
  {
    id: 'orientar-esquinas', stage: 'Última capa', title: 'Paso 2: orientar las esquinas', yellowUp: true,
    holding: 'Sujeta el cubo según cuántas esquinas amarillas haya arriba (la guía usa trucos de memoria).',
    intro: 'Consigue que todo el amarillo quede en la cara de arriba.',
    points: [
      'Una esquina amarilla: «feed the fish» (el pez come de tu mano izquierda).',
      'Ninguna esquina amarilla: «none – left» (una pegatina amarilla en la cara izquierda).',
      "Dos esquinas amarillas: «I see two, my left thumb's on you» (el pulgar izquierdo sobre la pegatina de la cara frontal).",
      "Acción 1: **R U R' U R U2 R'**. Con R girando en sentido contrario cada vez y U siempre horario.",
      'Acción 2: si no tienes todo el amarillo arriba, repite (puede hacer falta varias veces).',
    ],
    demos: [{ title: 'Orientar esquinas', alg: "R U R' U R U2 R'" }],
  },
  {
    id: 'posicionar-esquinas', stage: 'Última capa', title: 'Paso 3: colocar las esquinas amarillas', yellowUp: true,
    holding: 'Con el amarillo arriba (U).',
    intro: 'Gira U hasta que dos esquinas estén bien colocadas (sus colores coinciden con los centros).',
    points: [
      'Acción 2: compara con las imágenes de la guía (esquinas contiguas o diagonales). Sujeta el cubo con las «luces traseras» (las esquinas bien colocadas) en la cara trasera (B).',
      "Acción 3: **R' F R' B2 R F' R' B2 R2 U'**. Canto para recordarlo: «R'un to me, Fast, R'un to me, Back Back; Run away, F'ast, R'un to me, Back Back; Run Run, U'p».",
      'Acción 4: si las esquinas no están bien, vuelve a comparar y repite.',
    ],
    demos: [{ title: 'Colocar las esquinas', alg: "R' F R' B2 R F' R' B2 R2 U'" }],
  },
  {
    id: 'posicionar-aristas', stage: 'Última capa', title: 'Paso 4: colocar las aristas amarillas', yellowUp: true,
    holding: 'Con la cara de un solo color como cara trasera (B) y el amarillo arriba. Si no hay ninguna, da igual.',
    intro: 'Último paso: las aristas de arriba van a su sitio y el cubo queda resuelto.',
    points: [
      "Acción 1: **F2 U L R' F2 L' R U F2**, hasta 3 veces. Mueve las aristas sin resolver hacia la izquierda.",
      "Antes de empezar, mira la arista sin resolver de la cara frontal: si su color es el del centro izquierdo, usa el algoritmo así; si es el del derecho, cambia las dos U por U'.",
      'Si reinicias el algoritmo, recuerda que una cara resuelta debe quedar de nuevo detrás.',
    ],
    demos: [
      { title: 'Aristas hacia la izquierda', alg: "F2 U L R' F2 L' R U F2" },
      { title: 'Aristas hacia la derecha', alg: "F2 U' L R' F2 L' R U' F2" },
    ],
  },
]

export const SOURCES = [
  { title: "Rubik's: Solution Guide oficial (PDF; copia en docs/ del repo)", url: 'https://cdn.shopify.com/s/files/1/0881/0899/0813/files/Rubiks-3x3-Solve-Guide.pdf' },
  { title: "Rubik's: vídeos de cada etapa", url: 'https://www.rubiks.com/solve-it' },
  { title: 'Speedsolving wiki: Layer by Layer', url: 'https://www.speedsolving.com/wiki/index.php/LBL' },
  { title: 'Ruwix: método de principiantes', url: 'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/' },
]
