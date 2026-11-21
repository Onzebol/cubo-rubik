// Genera public/icon.svg: un cubo de Rubik en perspectiva isométrica sobre fondo oscuro.
// Uso: node pwa/icon.mjs   (los PNG se sacan de este SVG; ver README del PR/issue #35)
// El cubo cabe en la «zona segura» de los iconos maskable (círculo central del 80 %).
import { writeFileSync } from 'node:fs'

const TAMANO = 512
const FONDO = '#14161c'
const NEGRO = '#0b0b0d'
const COLORES = { arriba: '#ffd500', izquierda: '#009b48', derecha: '#ff5800' }

// Hexágono del cubo (centro 256,256)
const O_ARRIBA = [256, 96], U_ARRIBA = [138, 80], V_ARRIBA = [-138, 80]
const O_IZQ = [118, 176], U_IZQ = [138, 80], V_IZQ = [0, 160]
const O_DER = [256, 256], U_DER = [138, -80], V_DER = [0, 160]

const punto = (o, u, v, a, b) => [o[0] + a * u[0] + b * v[0], o[1] + a * u[1] + b * v[1]]
const poligono = (puntos) => puntos.map((p) => p.map((n) => +n.toFixed(2)).join(',')).join(' ')

/** Cara de 3×3 pegatinas: una base negra y nueve pegatinas con las esquinas redondeadas. */
function cara(o, u, v, color) {
  const base = [punto(o, u, v, 0, 0), punto(o, u, v, 1, 0), punto(o, u, v, 1, 1), punto(o, u, v, 0, 1)]
  let svg = `<polygon points="${poligono(base)}" fill="${NEGRO}" stroke="${NEGRO}" stroke-width="6" stroke-linejoin="round"/>\n`
  const hueco = 0.09 // separación entre pegatinas, como fracción de la celda
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const a0 = (i + hueco) / 3, a1 = (i + 1 - hueco) / 3, b0 = (j + hueco) / 3, b1 = (j + 1 - hueco) / 3
      const celda = [punto(o, u, v, a0, b0), punto(o, u, v, a1, b0), punto(o, u, v, a1, b1), punto(o, u, v, a0, b1)]
      svg += `<polygon points="${poligono(celda)}" fill="${color}" stroke="${color}" stroke-width="7" stroke-linejoin="round"/>\n`
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
