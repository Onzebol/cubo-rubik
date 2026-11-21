// Método por capas de la guía oficial "You Can Do the Rubik's Cube — Solution Guide"
// (Rubik's, v1-EU-M-2020). Copia en docs/Rubiks-3x3-Solve-Guide.pdf.
// Los casos de cada paso salen de la propia guía y se comprueban en src/cases.test.ts.
import type { Focus } from './cube/focus'

export interface Demo {
  /** identificador estable (lo usan los tests) */
  id?: string
  title: string
  /** movimientos que se reproducen; vacío = ejemplo estático (solo se muestra el cubo) */
  alg: string
  /** movimientos desde el cubo resuelto hasta la situación de partida (por defecto, el inverso de `alg`) */
  setup?: string
  note?: string
  focus?: Focus
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
  /** piezas en color en los ejemplos; el resto, gris (como en la guía oficial) */
  focus: Focus
  demos: Demo[]
}

const SUNE = "R U R' U R U2 R'"
const FUR = "F U R U' R' F'"
const POS_CORNERS = "R' F R' B2 R F' R' B2 R2 U'"

export const LESSONS: Lesson[] = [
  {
    id: 'notacion', stage: 'Antes de empezar', title: 'Conoce tu cubo y la notación', yellowUp: false, focus: 'all',
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
    id: 'margarita', stage: 'Primera capa', title: 'Paso 1: la margarita', yellowUp: true, focus: 'white-edges',
    holding: 'Con el centro AMARILLO en la cara de arriba (U).',
    intro: 'Objetivo: las 4 aristas blancas en la capa de arriba, con el **blanco hacia arriba**, rodeando el centro amarillo, como los pétalos de una margarita. El otro color de cada arista no importa todavía. Busca las 4 aristas blancas (una pegatina blanca y otra de color): pueden estar arriba, en el medio o abajo.',
    points: [
      '**Capa de arriba, blanco hacia arriba:** ya está bien colocada, déjala donde está.',
      "**Capa de arriba, blanco en el lateral:** hay que voltearla. Gira el cubo para que esa arista quede en la cara derecha (R) y haz **R' U F'**.",
      "**Capa del medio** (las aristas entre dos caras laterales): ponla en la esquina frontal-derecha. Si el blanco mira a la cara derecha, gira **F'**; si mira a la cara frontal, gira **R**. En los dos casos el blanco acaba arriba.",
      '**Capa de abajo, blanco hacia abajo:** gira D hasta tenerla justo debajo de un hueco libre de la margarita y haz **F2**.',
      '**Capa de abajo, blanco en el lateral:** gira la cara lateral donde está el blanco para subirla al medio (**R**) y luego trátala como una arista del medio (**F\'**).',
      '**No choques con las que ya tienes:** antes de subir una arista, mira si su hueco está ocupado. Si lo está, gira U (aquí **U\'**) para apartar el pétalo y luego sube la otra.',
      'Termina cuando las 4 aristas blancas estén arriba con el blanco mirando hacia arriba. Da igual que no estén junto a su color.',
    ],
    tip: 'Sin apartar el pétalo, subir otra arista al mismo hueco lo tira abajo. Es el error más común.',
    demos: [
      { id: 'final', title: 'Así debe quedar la margarita', alg: '', setup: "F2 R2 B2 L2", note: 'Las 4 aristas blancas arriba, con el blanco hacia arriba.' },
      { id: 'arriba-bien', title: 'Arriba con el blanco hacia arriba: déjala', alg: '', setup: 'F2', note: 'Esta arista ya está bien colocada.' },
      { id: 'arriba-lateral', title: 'Arriba con el blanco en el lateral: voltéala', alg: "R' U F'", setup: "F' R", note: 'Con la arista en la cara derecha. El blanco pasa a mirar hacia arriba.' },
      { id: 'medio-derecha', title: 'Capa del medio, blanco en la cara derecha', alg: "F'", setup: "F'" },
      { id: 'medio-frente', title: 'Capa del medio, blanco en la cara frontal', alg: 'R', setup: 'R' },
      { id: 'abajo-blanco-abajo', title: 'Capa de abajo, blanco hacia abajo', alg: 'F2', setup: '', note: 'La arista está justo debajo del hueco libre.' },
      { id: 'abajo-lateral', title: 'Capa de abajo, blanco en el lateral', alg: "R F'", setup: "F' R'", note: 'R la sube al medio y F\' la sube arriba.' },
      { id: 'chocar', title: 'Hueco ocupado: aparta el pétalo antes', alg: "U' F'", setup: "R2 F' U", note: "U' aparta el pétalo y F' sube la otra arista sin tirarlo." },
    ],
  },
  {
    id: 'cruz-blanca', stage: 'Primera capa', title: 'Paso 2: cruz blanca con aristas emparejadas', yellowUp: true, focus: 'white-edges',
    holding: 'Con la margarita arriba (U), mirando a la cara frontal.',
    intro: 'Baja cada arista blanca para formar la cruz blanca, con el otro color de cada arista igual al centro de su lado.',
    points: [
      '**El color frontal de la arista de arriba coincide con el centro frontal:** gira la cara frontal dos veces (**F2**) y el blanco queda abajo.',
      '**No coincide:** gira U hasta que coincida y entonces haz **F2**.',
      'Repite con cada arista blanca (gira el cubo o la cara U hasta traer la siguiente a la cara frontal).',
      'Al terminar las 4, da la vuelta al cubo y verás la cruz blanca, con los colores de las aristas iguales a los centros rojo, azul, naranja y verde.',
    ],
    demos: [
      { id: 'coincide', title: 'El color frontal coincide', alg: 'F2', setup: 'F2', note: 'Verde con verde: basta F2.' },
      { id: 'no-coincide', title: 'No coincide: gira U primero', alg: "U' F2", setup: 'F2 U', note: 'U\' devuelve la arista a su lado y luego F2.' },
    ],
  },
  {
    id: 'esquinas-blancas', stage: 'Primera capa', title: 'Paso 3: las esquinas blancas', yellowUp: false, focus: 'white-layer',
    holding: 'Con la cruz blanca en la cara de arriba (U).',
    intro: 'La esquina bien colocada queda entre los centros que tienen sus mismos colores (la roja/azul/blanca, entre el rojo, el azul y el blanco).',
    points: [
      "**Esquina en la capa de arriba pero mal colocada:** bájala a la capa de abajo con **R' D' R** y vuelve a empezar.",
      '**Esquina con blanco en la capa de abajo:** gira D hasta que quede entre los dos centros de sus colores. Después, según dónde esté el blanco, sujeta el cubo con la esquina en la cara frontal.',
      "**Blanco mirando hacia abajo:** con la esquina en la cara derecha, **F D' F' D2** cambia el blanco al lateral. Luego sigue con uno de los dos casos siguientes.",
      "**Blanco a la izquierda:** **D L D' L'**.",
      "**Blanco a la derecha:** **D' R' D R**.",
      'Repite hasta tener las 4 esquinas blancas. La primera capa está completa cuando tiene las 9 pegatinas blancas y los lados coinciden con los centros.',
    ],
    demos: [
      { title: 'Bajar una esquina de arriba', alg: "R' D' R" },
      { title: 'Blanco mirando abajo', alg: "F D' F' D2" },
      { title: 'Blanco a la izquierda', alg: "D L D' L'" },
      { title: 'Blanco a la derecha', alg: "D' R' D R" },
      { id: 'final', title: 'Así debe quedar la primera capa', alg: '', setup: '', note: 'Cara blanca completa y los lados de la primera capa iguales a sus centros.' },
    ],
  },
  {
    id: 'capa-medio', stage: 'Capa del medio', title: 'Resolver la capa del medio', yellowUp: true, focus: 'two-layers',
    holding: 'Da la vuelta al cubo: la cara blanca completada abajo (D).',
    intro: 'Coloca las 4 aristas de la capa central, las que no llevan amarillo.',
    points: [
      'Elige una cara frontal y gira U hasta que el color frontal de la arista de arriba coincida con el centro frontal (línea vertical).',
      "**La arista debe ir a la izquierda:** **U' L' U L** (junto a su esquina) y luego **U F U' F'** (a su sitio).",
      "**La arista debe ir a la derecha:** **U R U' R'** (junto a su esquina) y luego **U' F' U F** (a su sitio).",
      '**Arista del medio mal colocada o sin arista de arriba que sirva:** ponla en la cara derecha y haz el algoritmo «a la derecha» completo; así sale a la capa de arriba y puedes volver al paso anterior.',
      'Repite hasta completar la capa del medio.',
    ],
    demos: [
      { title: 'Izquierda, parte 1: junto a su esquina', alg: "U' L' U L" },
      { title: 'Izquierda, parte 2: a su sitio', alg: "U F U' F'" },
      { title: 'Derecha, parte 1: junto a su esquina', alg: "U R U' R'" },
      { title: 'Derecha, parte 2: a su sitio', alg: "U' F' U F" },
      { id: 'sacar', title: 'Sacar una arista mal colocada', alg: "U R U' R' U' F' U F", note: 'Con la arista a sacar en la cara derecha.' },
    ],
  },
  {
    id: 'cruz-amarilla', stage: 'Última capa', title: 'Paso 1: la cruz amarilla', yellowUp: true, focus: 'top-face',
    holding: 'Fíjate solo en las aristas amarillas de la cara de arriba (no en las esquinas).',
    intro: 'Mira qué dibujo forman las aristas amarillas: un **punto**, una **«L»** o una **línea**. El mismo algoritmo las lleva de un caso al siguiente hasta formar la cruz: punto → línea → «L» → cruz.',
    points: [
      "**Punto** (solo el centro): aplica **F U R U' R' F'**. Saldrá una línea.",
      "**Línea:** colócala en horizontal (de izquierda a derecha) y aplica el algoritmo. Saldrá una «L».",
      "**«L»:** colócala con las dos aristas amarillas hacia atrás y hacia la izquierda y aplica el algoritmo. Saldrá la cruz.",
      'Si aún no hay cruz, vuelve a comparar con estos tres dibujos y repite. Puede hacer falta 3 veces.',
    ],
    tip: "Regla para recordarlo: «FUR dice U'R'F'». Los tres primeros giros van a derechas y los otros tres al revés.",
    demos: [
      { id: 'punto', title: 'Punto', alg: FUR, setup: "F R U R' U' F' U2 F U R U' R' F'", note: 'Después de una vez saldrá una línea (en vertical: gira el cubo para ponerla en horizontal).' },
      { id: 'linea', title: 'Línea horizontal', alg: FUR, setup: FUR, note: 'Después de una vez saldrá una «L».' },
      { id: 'ele', title: '«L» hacia atrás y la izquierda', alg: FUR, note: 'Con la «L» colocada así, una vez forma la cruz.' },
    ],
  },
  {
    id: 'orientar-esquinas', stage: 'Última capa', title: 'Paso 2: orientar las esquinas', yellowUp: true, focus: 'top-face',
    holding: 'Sujeta el cubo según cuántas esquinas amarillas haya arriba (la guía usa trucos de memoria).',
    intro: 'Consigue que todo el amarillo quede en la cara de arriba. Cuenta cuántas esquinas tienen el amarillo mirando hacia arriba.',
    points: [
      "**Una esquina amarilla («feed the fish»):** sujeta el cubo para que el pez coma de tu mano izquierda (la esquina amarilla arriba, delante a la izquierda) y haz **R U R' U R U2 R'**. Con una pasada quedan las cuatro.",
      "**Ninguna esquina amarilla («none – left»):** una pegatina amarilla en la cara izquierda. Haz el algoritmo una vez y saldrá un pez: pon la esquina amarilla delante a la izquierda con **U'** y repítelo.",
      "**Dos esquinas amarillas («I see two, my left thumb's on you»):** el pulgar izquierdo sobre la pegatina de la cara frontal. Repite el algoritmo; a veces hace falta tres veces.",
      'Fíjate en que R gira en sentido contrario cada vez y U siempre horario. Si no tienes todo el amarillo arriba, vuelve a comparar y repite.',
    ],
    demos: [
      { id: 'pez', title: 'Una esquina amarilla (pez)', alg: SUNE, note: 'Una pasada y las cuatro esquinas quedan amarillas.' },
      { id: 'ninguna', title: 'Ninguna esquina amarilla', alg: `${SUNE} U' ${SUNE}`, setup: "R U2 R' U' R U' R' U R U2 R' U' R U' R'", note: 'La primera pasada deja un pez; U\' lo coloca y la segunda lo termina.' },
      { id: 'dos', title: 'Dos esquinas amarillas', alg: `${SUNE} ${SUNE} ${SUNE}`, setup: `${SUNE} ${SUNE} ${SUNE}`, note: 'Aquí hacen falta tres pasadas seguidas.' },
    ],
  },
  {
    id: 'posicionar-esquinas', stage: 'Última capa', title: 'Paso 3: colocar las esquinas amarillas', yellowUp: true, focus: 'top-corners',
    holding: 'Con el amarillo arriba (U).',
    intro: 'Gira U hasta que dos esquinas estén bien colocadas (sus colores coinciden con los centros).',
    points: [
      '**Dos esquinas contiguas bien colocadas:** sujeta el cubo con esas «luces traseras» en la cara trasera (B) y haz el algoritmo una vez.',
      '**Dos esquinas en diagonal:** haz el algoritmo una vez desde cualquier posición, vuelve a mirar y repite con las luces traseras.',
      "El algoritmo: **R' F R' B2 R F' R' B2 R2 U'**. Canto para recordarlo: «R'un to me, Fast, R'un to me, Back Back; Run away, F'ast, R'un to me, Back Back; Run Run, U'p».",
      'Si las esquinas no están bien, vuelve a comparar y repite.',
    ],
    demos: [
      { id: 'contiguas', title: 'Dos esquinas contiguas (luces traseras)', alg: POS_CORNERS, setup: "F U F' U' F' L F2 U' F' U' F U F' L'", note: 'Las dos esquinas bien colocadas, atrás. Una vez y las cuatro quedan bien.' },
      { id: 'diagonales', title: 'Dos esquinas en diagonal', alg: POS_CORNERS, setup: "F R U' R' U' R U R' F' R U R' U' R' F R F'", note: 'Una vez y vuelve a mirar: quedarán dos contiguas. Pon las luces atrás y repite.' },
    ],
  },
  {
    id: 'posicionar-aristas', stage: 'Última capa', title: 'Paso 4: colocar las aristas amarillas', yellowUp: true, focus: 'top-layer',
    holding: 'Con la cara de un solo color como cara trasera (B) y el amarillo arriba. Si no hay ninguna, da igual.',
    intro: 'Último paso: las aristas de arriba van a su sitio y el cubo queda resuelto.',
    points: [
      "**La arista sin resolver de la cara frontal es del color del centro izquierdo:** **F2 U L R' F2 L' R U F2**, hasta 3 veces. Mueve las aristas sin resolver hacia la izquierda.",
      "**Es del color del centro derecho:** cambia las dos U por U': **F2 U' L R' F2 L' R U' F2**.",
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
