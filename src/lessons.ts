// Método por capas de la guía oficial "You Can Do the Rubik's Cube — Solution Guide"
// (Rubik's, v1-EU-M-2020). Copia en docs/Rubiks-3x3-Solve-Guide.pdf.
// Los casos de cada paso salen de la propia guía y se comprueban en src/cases.test.ts.
import { invert } from './cube/cube'
import type { Focus } from './cube/focus'

export interface Demo {
  /** identificador estable (lo usan los tests) */
  id?: string
  title: string
  /** qué se ve y qué hay que hacer en este caso (se muestra junto al cubo) */
  instructions: string
  /** movimientos que se reproducen; vacío = ejemplo estático (solo se muestra el cubo) */
  alg: string
  /** movimientos desde el cubo resuelto hasta la situación de partida (por defecto, el inverso de `alg`) */
  setup?: string
  /** piezas a resaltar indicadas a mano (por colores, p. ej. 'GW'); por defecto, las que mueve el algoritmo */
  highlight?: string[]
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
// Capa del medio: cada ejemplo parte de las dos capas de abajo resueltas y una arista de arriba por colocar
const LEFT_1 = "U' L' U L"
const LEFT_2 = "U F U' F'"
const RIGHT_1 = "U R U' R'"
const RIGHT_2 = "U' F' U F"
const LEFT_SETUP = invert(`${LEFT_1} ${LEFT_2}`)
// Las 4 aristas de arriba (con amarillo): las que forman la cruz
const CROSS_EDGES = ['BY', 'GY', 'OY', 'RY']
// Las 4 esquinas de arriba (con amarillo)
const CORNER_PIECES = ['BOY', 'BRY', 'GOY', 'GRY']
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
      { title: 'Giro horario de R', instructions: "Gira la cara derecha (R) un cuarto de vuelta en sentido horario, mirándola de frente.", alg: 'R' },
      { title: 'Giro inverso de R', instructions: "El apóstrofo indica el sentido contrario: la cara derecha gira un cuarto de vuelta en sentido antihorario.", alg: "R'" },
      { title: 'Media vuelta de D', instructions: "El 2 indica media vuelta: la cara de abajo (D) gira dos cuartos de vuelta, da igual el sentido.", alg: 'D2' },
    ],
  },
  {
    id: 'margarita', stage: 'Primera capa', title: 'Paso 1: la margarita', yellowUp: true, focus: 'white-edges',
    holding: 'Con el centro AMARILLO en la cara de arriba (U).',
    intro: 'Objetivo: las 4 aristas blancas en la capa de arriba, con el **blanco hacia arriba**, rodeando el centro amarillo, como los pétalos de una margarita. El otro color de cada arista no importa todavía. Busca las 4 aristas blancas (una pegatina blanca y otra de color): pueden estar arriba, en el medio o abajo.',
    points: [
      "Recorre las aristas blancas por orden: primero las que ya están arriba, luego las del medio y al final las de abajo.",
      "Cada caso tiene su ejemplo con instrucciones: busca el que se parezca a tu cubo.",
    ],
    demos: [
      { id: 'final', title: 'Así debe quedar la margarita', instructions: "Mira cómo debe acabar este paso: las 4 aristas blancas arriba, alrededor del centro amarillo, con el blanco hacia arriba. El otro color de cada arista no importa.", alg: '', setup: "F2 R2 B2 L2" },
      { id: 'arriba-bien', title: 'Arriba con el blanco hacia arriba: déjala', instructions: "Esta arista blanca está en la capa de arriba y su pegatina blanca mira hacia arriba: ya está bien. No la muevas y trabaja con las demás.", alg: '', setup: 'F2', highlight: ['GW'] },
      { id: 'arriba-lateral', title: 'Arriba con el blanco en el lateral: voltéala', instructions: "La arista está en la capa de arriba, pero su blanco mira al lateral. Gira el cubo para que quede en la cara derecha y haz R' U F': R' la baja, U aparta lo que estorba y F' la sube con el blanco hacia arriba.", alg: "R' U F'", setup: "F' R" },
      { id: 'medio-derecha', title: 'Capa del medio, blanco en la cara derecha', instructions: "La arista está en la capa del medio, en la esquina frontal-derecha, y su blanco mira a la derecha. Gira F' y el blanco sube a la cara de arriba.", alg: "F'", setup: "F'" },
      { id: 'medio-frente', title: 'Capa del medio, blanco en la cara frontal', instructions: "La arista está en la capa del medio, en la esquina frontal-derecha, y su blanco mira al frente. Gira R y el blanco sube a la cara de arriba.", alg: 'R', setup: 'R' },
      { id: 'abajo-blanco-abajo', title: 'Capa de abajo, blanco hacia abajo', instructions: "La arista está abajo con el blanco hacia abajo, justo debajo de un hueco libre de la margarita. Gira la cara frontal media vuelta (F2). Si no estuviera bajo un hueco libre, gira D antes hasta ponerla.", alg: 'F2', setup: '' },
      { id: 'abajo-lateral', title: 'Capa de abajo, blanco en el lateral', instructions: "La arista está abajo y su blanco mira a un lado (aquí, a la derecha). Gira R para subirla al medio y luego F' para subirla a la capa de arriba.", alg: "R F'", setup: "F' R'" },
      { id: 'chocar', title: 'Hueco ocupado: aparta el pétalo antes', instructions: "El hueco al que va a subir la arista ya tiene un pétalo. Primero U' para apartarlo y después F' para subir la otra sin tirar el pétalo que ya tenías. Es el error más común.", alg: "U' F'", setup: "R2 F' U" },
    ],
  },
  {
    id: 'cruz-blanca', stage: 'Primera capa', title: 'Paso 2: cruz blanca con aristas emparejadas', yellowUp: true, focus: 'white-edges',
    holding: 'Con la margarita arriba (U), mirando a la cara frontal.',
    intro: 'Baja cada arista blanca para formar la cruz blanca, con el otro color de cada arista igual al centro de su lado.',
    points: [
      "Repite con cada arista blanca (gira el cubo o la cara U hasta traer la siguiente a la cara frontal).",
      "Al terminar las 4, da la vuelta al cubo y verás la cruz blanca, con los colores de las aristas iguales a los centros rojo, azul, naranja y verde.",
    ],
    demos: [
      { id: 'coincide', title: 'El color frontal coincide', instructions: "El color frontal de la arista de arriba (verde) coincide con el centro frontal (verde). Gira la cara frontal media vuelta (F2) y el blanco baja a la cara de abajo.", alg: 'F2', setup: 'F2' },
      { id: 'no-coincide', title: 'No coincide: gira U primero', instructions: "El color frontal de la arista no coincide con el centro frontal. Gira U hasta que coincida (aquí U') y después F2 para bajar el blanco.", alg: "U' F2", setup: 'F2 U' },
    ],
  },
  {
    id: 'esquinas-blancas', stage: 'Primera capa', title: 'Paso 3: las esquinas blancas', yellowUp: false, focus: 'white-layer',
    holding: 'Con la cruz blanca en la cara de arriba (U).',
    intro: 'La esquina bien colocada queda entre los centros que tienen sus mismos colores (la roja/azul/blanca, entre el rojo, el azul y el blanco).',
    points: [
      "Para cada esquina blanca, mira si está arriba y mal colocada o abajo, bajo su hueco (con el blanco hacia abajo o al frente, a la izquierda o a la derecha), y busca ese caso.",
      "Repite hasta tener las 4 esquinas blancas.",
    ],
    demos: [
      { id: 'arriba-mal', title: 'Esquina blanca arriba pero mal colocada', instructions: "Hay una esquina con blanco en la capa de arriba, pero no es la que va en ese hueco (aquí, arriba delante a la derecha). R' D' R la baja a la capa de abajo; después colócala como en los casos siguientes.", alg: "R' D' R", setup: "L D L' D' R' D R D'" },
      { id: 'blanco-abajo', title: 'Blanco mirando hacia abajo', instructions: "La esquina está abajo, delante a la derecha (justo bajo su hueco), con el blanco hacia abajo (desde aquí no se ve: arrastra el cubo para mirar por debajo). Con la esquina en la cara derecha, F D' F' D2 pasa el blanco al frente; después sigue con «Esquina a la derecha, blanco al frente».", alg: "F D' F' D2", setup: "D' R' D R D2 R' D' R" },
      { id: 'izquierda', title: 'Esquina a la izquierda, blanco al frente', instructions: "La esquina está abajo, delante a la izquierda, justo bajo su hueco (entre los centros de sus dos colores), con el blanco mirando al frente. D L D' L' la sube a su sitio con el blanco arriba.", alg: "D L D' L'" },
      { id: 'derecha', title: 'Esquina a la derecha, blanco al frente', instructions: "La esquina está abajo, delante a la derecha, justo bajo su hueco (entre los centros de sus dos colores), con el blanco mirando al frente. D' R' D R la sube a su sitio con el blanco arriba.", alg: "D' R' D R" },
      { id: 'final', title: 'Así debe quedar la primera capa', instructions: "Mira cómo debe acabar este paso: la cara blanca completa y los laterales de la primera capa del mismo color que sus centros.", alg: '', setup: '' },
    ],
  },
  {
    id: 'capa-medio', stage: 'Capa del medio', title: 'Resolver la capa del medio', yellowUp: true, focus: 'white-layer',
    holding: 'Da la vuelta al cubo: la cara blanca completada abajo (D).',
    intro: 'Coloca las 4 aristas de la capa central, las que no llevan amarillo.',
    points: [
      "Elige una cara frontal y gira U hasta que el color frontal de la arista de arriba coincida con el centro frontal (línea vertical).",
      "Según la arista deba ir a la izquierda o a la derecha, usa el ejemplo correspondiente.",
      "Repite hasta completar la capa del medio.",
    ],
    demos: [
      { id: 'izquierda', title: 'La arista va a la izquierda', instructions: "La arista verde-roja está arriba, delante: su verde (frontal) coincide con el centro frontal y su rojo (arriba) es el color del centro izquierdo, así que va a la izquierda. Primero U' L' U L la deja junto a su esquina (la esquina blanca sube un momento) y después U F U' F' la mete en su sitio de la capa del medio. Las dos capas de abajo acaban resueltas. El halo marca esa arista.", alg: `${LEFT_1} ${LEFT_2}`, setup: LEFT_SETUP, highlight: ['GR'] },
      { id: 'derecha', title: 'La arista va a la derecha', instructions: "La arista verde-naranja está arriba, delante: su verde (frontal) coincide con el centro frontal y su naranja (arriba) es el color del centro derecho, así que va a la derecha. Primero U R U' R' la deja junto a su esquina (la esquina blanca sube un momento) y después U' F' U F la mete en su sitio de la capa del medio. Las dos capas de abajo acaban resueltas. El halo marca esa arista.", alg: `${RIGHT_1} ${RIGHT_2}`, setup: invert(`${RIGHT_1} ${RIGHT_2}`), highlight: ['GO'] },
      { id: 'sacar', title: 'Sacar una arista mal colocada', instructions: "En la capa del medio, a la derecha, hay una arista que no es la suya: es la verde-roja (sin amarillo) y le toca a la izquierda. Con ella en la cara derecha haz U R U' R' U' F' U F: sale a la capa de arriba y podrás colocarla bien. El halo marca esa arista.", alg: `${RIGHT_1} ${RIGHT_2}`, setup: `${LEFT_SETUP} ${RIGHT_1} ${RIGHT_2}`, highlight: ['GR'] },
    ],
  },
  {
    id: 'cruz-amarilla', stage: 'Última capa', title: 'Paso 1: la cruz amarilla', yellowUp: true, focus: 'two-layers-yellow',
    holding: 'Fíjate solo en las aristas amarillas de la cara de arriba (no en las esquinas). Las dos primeras capas, en color, ya están terminadas. De la última capa solo importa el amarillo, así que el resto de sus colores va en gris. El resplandor marca las aristas de arriba que se explican.',
    intro: 'Mira qué dibujo forman las aristas amarillas: un **punto**, una **«L»** o una **línea**. El mismo algoritmo las lleva de un caso al siguiente hasta formar la cruz: punto → línea → «L» → cruz.',
    points: [
      "Si aún no hay cruz, vuelve a comparar con estos tres casos y repite. Puede hacer falta 3 veces.",
    ],
    tip: "Regla para recordarlo: «FUR dice U'R'F'». Los tres primeros giros van a derechas y los otros tres al revés.",
    demos: [
      { id: 'punto', title: 'Punto', instructions: "Solo se ve el centro amarillo arriba. Aplica F U R U' R' F': saldrá una línea, en vertical (gira el cubo para ponerla en horizontal). El resplandor marca las dos aristas que acabarán arriba.", alg: FUR, setup: "F R U R' U' F' U2 F U R U' R' F'", highlight: ['BY', 'RY'] },
      { id: 'linea', title: 'Línea horizontal', instructions: "Hay dos aristas amarillas en línea. Colócala en horizontal (de izquierda a derecha) y aplica F U R U' R' F': saldrá una «L».", alg: FUR, setup: FUR, highlight: CROSS_EDGES },
      { id: 'ele', title: '«L» hacia atrás y la izquierda', instructions: "Hay dos aristas amarillas en «L». Colócalas hacia atrás y hacia la izquierda y aplica F U R U' R' F': saldrá la cruz.", alg: FUR, highlight: CROSS_EDGES },
    ],
  },
  {
    id: 'orientar-esquinas', stage: 'Última capa', title: 'Paso 2: orientar las esquinas', yellowUp: true, focus: 'two-layers-yellow',
    holding: 'Sujeta el cubo según cuántas esquinas amarillas haya arriba (la guía usa trucos de memoria). Las dos primeras capas, en color, ya están terminadas. De la última solo importa el amarillo, así que lo demás va en gris. El resplandor marca las 4 esquinas.',
    intro: 'Consigue que todo el amarillo quede en la cara de arriba. Cuenta cuántas esquinas tienen el amarillo mirando hacia arriba.',
    points: [
      "Fíjate en que R gira en sentido contrario cada vez y U siempre horario.",
      "Si no tienes todo el amarillo arriba, vuelve a comparar y repite.",
    ],
    demos: [
      { id: 'pez', title: 'Una esquina amarilla (pez)', instructions: "Solo hay una esquina con el amarillo hacia arriba. Ponla arriba, delante a la izquierda (el pez come de tu mano izquierda) y haz R U R' U R U2 R': las cuatro esquinas quedan amarillas.", alg: SUNE, highlight: CORNER_PIECES },
      { id: 'ninguna', title: 'Ninguna esquina amarilla', instructions: "Ninguna esquina tiene el amarillo hacia arriba. Es el caso «none – left» (una pegatina amarilla en la cara izquierda). Haz R U R' U R U2 R', aparecerá un pez; ponlo delante a la izquierda con U' y repite el algoritmo.", alg: `${SUNE} U' ${SUNE}`, setup: "R U2 R' U' R U' R' U R U2 R' U' R U' R'", highlight: CORNER_PIECES },
      { id: 'dos', title: 'Dos esquinas amarillas', instructions: "Es el caso «I see two, my left thumb's on you» (el pulgar izquierdo sobre la pegatina de la cara frontal). Hay dos esquinas con el amarillo hacia arriba. Repite R U R' U R U2 R' sin girar el cubo hasta que las cuatro esquinas queden amarillas (aquí, tres veces seguidas).", alg: `${SUNE} ${SUNE} ${SUNE}`, setup: `${SUNE} ${SUNE} ${SUNE}`, highlight: CORNER_PIECES },
    ],
  },
  {
    id: 'posicionar-esquinas', stage: 'Última capa', title: 'Paso 3: colocar las esquinas amarillas', yellowUp: true, focus: 'two-layers-yellow-corners',
    holding: 'Con el amarillo arriba (U). Las dos primeras capas, en color, ya están terminadas. De la última capa van en color las esquinas (importan sus colores laterales) y el amarillo; lo demás, en gris. El resplandor marca las 4 esquinas.',
    intro: 'Gira U hasta que dos esquinas estén bien colocadas (sus colores coinciden con los centros). Si están en diagonal, empieza por el primer ejemplo: te lleva al segundo, el de dos esquinas contiguas.',
    points: [
      "Si las esquinas no están bien, vuelve a comparar y repite.",
    ],
    tip: "Canto para recordar el algoritmo: «R'un to me, Fast, R'un to me, Back Back; Run away, F'ast, R'un to me, Back Back; Run Run, U'p».",
    demos: [
      { id: 'diagonales', title: 'Dos esquinas en diagonal', instructions: "Hay dos esquinas bien colocadas, pero en diagonal. Haz R' F R' B2 R F' R' B2 R2 U' una vez desde cualquier posición y gira U hasta que dos esquinas contiguas estén bien colocadas. Ponlas atrás (luces traseras) y pasa al ejemplo siguiente: repite el algoritmo.", alg: POS_CORNERS, setup: "F R U' R' U' R U R' F' R U R' U' R' F R F'", highlight: CORNER_PIECES },
      { id: 'contiguas', title: 'Dos esquinas contiguas (luces traseras)', instructions: "Hay dos esquinas contiguas bien colocadas (también es lo que te queda tras resolver el caso de las diagonales). Sujeta el cubo con esas «luces traseras» en la cara de atrás y haz R' F R' B2 R F' R' B2 R2 U' una sola vez: las cuatro quedan bien.", alg: POS_CORNERS, setup: "F U F' U' F' L F2 U' F' U' F U F' L'", highlight: CORNER_PIECES },
    ],
  },
  {
    id: 'posicionar-aristas', stage: 'Última capa', title: 'Paso 4: colocar las aristas amarillas', yellowUp: true, focus: 'two-layers-yellow-edges',
    holding: 'Con la cara de un solo color como cara trasera (B) y el amarillo arriba. Si no hay ninguna, da igual. Las dos primeras capas, en color, ya están terminadas. De la última capa van en color las aristas (importan sus colores laterales) y el amarillo; lo demás, en gris. El resplandor marca las aristas que se mueven.',
    intro: 'Último paso: las aristas de arriba van a su sitio y el cubo queda resuelto.',
    points: [
      "Elige el ejemplo según el color de la arista sin resolver de la cara frontal.",
      "Si reinicias el algoritmo, recuerda que una cara resuelta debe quedar de nuevo detrás.",
    ],
    demos: [
      { title: 'Aristas hacia la izquierda', instructions: "La arista sin resolver de la cara frontal es del color del centro izquierdo. Con una cara resuelta detrás, haz F2 U L R' F2 L' R U F2 (hasta 3 veces): las aristas se mueven hacia la izquierda.", alg: "F2 U L R' F2 L' R U F2" },
      { title: 'Aristas hacia la derecha', instructions: "La arista sin resolver de la cara frontal es del color del centro derecho. Con una cara resuelta detrás, haz F2 U' L R' F2 L' R U' F2 (las dos U pasan a U'): las aristas se mueven hacia la derecha.", alg: "F2 U' L R' F2 L' R U' F2" },
    ],
  },
]

export const SOURCES = [
  { title: "Rubik's: Solution Guide oficial (PDF; copia en docs/ del repo)", url: 'https://cdn.shopify.com/s/files/1/0881/0899/0813/files/Rubiks-3x3-Solve-Guide.pdf' },
  { title: "Rubik's: vídeos de cada etapa", url: 'https://www.rubiks.com/solve-it' },
  { title: 'Speedsolving wiki: Layer by Layer', url: 'https://www.speedsolving.com/wiki/index.php/LBL' },
  { title: 'Ruwix: método de principiantes', url: 'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/' },
]
