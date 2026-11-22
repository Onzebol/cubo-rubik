// Genera public/icon.svg: un cubo de Rubik en perspectiva isométrica sobre fondo oscuro.
// Uso: node pwa/icon.mjs   (los PNG se sacan de este SVG; ver README del PR/issue #35)
// El cubo cabe en la «zona segura» de los iconos maskable (círculo central del 80 %).
import { writeFileSync } from 'node:fs'

const TAMANO = 512
const FONDO = '#14161c'
const NEGRO = '#0b0b0d'
// Mismos colores, vista y separación entre pegatinas que el cubo de los ejemplos (src/components/Cube3D.tsx y App.css)
const COLORES = { arriba: '#f4f4f4', izquierda: '#009b48', derecha: '#b71234' } // U blanco, F verde, R rojo
const VISTA = { rx: -28, ry: -38 } // DEFAULT_VIEW de Cube3D (grados)
const RADIO = 165 // lo que mide el cubo desde el centro: cabe en la «zona segura» maskable

// Proyección ortogonal de CSS «rotateX(rx) rotateY(ry)» (x a la derecha, y hacia abajo, z hacia el espectador)
const rad = (g) => (g * Math.PI) / 180
const gira = ([x, y, z]) => {
  const [cy, sy, cx, sx] = [Math.cos(rad(VISTA.ry)), Math.sin(rad(VISTA.ry)), Math.cos(rad(VISTA.rx)), Math.sin(rad(VISTA.rx))]
  const [x1, z1] = [x * cy + z * sy, -x * sy + z * cy]
  return [x1, y * cx - z1 * sx]
}
const radioCubo = Math.max(...[-0.5, 0.5].flatMap((x) => [-0.5, 0.5].flatMap((y) => [-0.5, 0.5].map((z) => Math.hypot(...gira([x, y, z]))))))
const E = RADIO / radioCubo
const eje = (vector) => gira(vector).map((n) => n * E)
// [origen, u, v] de cada cara visible
const O_ARRIBA = eje([-0.5, -0.5, -0.5]), U_ARRIBA = eje([1, 0, 0]), V_ARRIBA = eje([0, 0, 1])
const O_IZQ = eje([-0.5, -0.5, 0.5]), U_IZQ = eje([1, 0, 0]), V_IZQ = eje([0, 1, 0])
const O_DER = eje([0.5, -0.5, 0.5]), U_DER = eje([0, 0, -1]), V_DER = eje([0, 1, 0])

const punto = (o, u, v, a, b) => [256 + o[0] + a * u[0] + b * v[0], 256 + o[1] + a * u[1] + b * v[1]]
const poligono = (puntos) => puntos.map((p) => p.map((n) => +n.toFixed(2)).join(',')).join(' ')

/** Cara de 3×3 pegatinas: una base negra y nueve pegatinas con las esquinas redondeadas. */
function cara(o, u, v, color) {
  const base = [punto(o, u, v, 0, 0), punto(o, u, v, 1, 0), punto(o, u, v, 1, 1), punto(o, u, v, 0, 1)]
  let svg = `<polygon points="${poligono(base)}" fill="${NEGRO}" stroke="${NEGRO}" stroke-width="6" stroke-linejoin="round"/>\n`
  const hueco = 0.125 // margen por lado, fracción de la celda: con el trazo de 6 px deja el hueco de 3 px de 50 que tiene .sticker
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const a0 = (i + hueco) / 3, a1 = (i + 1 - hueco) / 3, b0 = (j + hueco) / 3, b1 = (j + 1 - hueco) / 3
      const celda = [punto(o, u, v, a0, b0), punto(o, u, v, a1, b0), punto(o, u, v, a1, b1), punto(o, u, v, a0, b1)]
      svg += `<polygon points="${poligono(celda)}" fill="${color}" stroke="${color}" stroke-width="6" stroke-linejoin="round"/>\n`
    }
  }
  return svg
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TAMANO} ${TAMANO}" width="${TAMANO}" height="${TAMANO}">
<title>CuboFácil</title>
<rect width="${TAMANO}" height="${TAMANO}" fill="${FONDO}"/>
${cara(O_ARRIBA, U_ARRIBA, V_ARRIBA, COLORES.arriba)}${cara(O_IZQ, U_IZQ, V_IZQ, COLORES.izquierda)}${cara(O_DER, U_DER, V_DER, COLORES.derecha)}</svg>
`

writeFileSync(new URL('../public/icon.svg', import.meta.url), svg)
console.log(`public/icon.svg (${svg.length} bytes)`)
