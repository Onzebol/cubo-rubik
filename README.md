# CuboFácil — aprende a resolver el cubo de Rubik

Web mobile-first con el **método por capas de la guía oficial de Rubik's** (copia en `docs/Rubiks-3x3-Solve-Guide.pdf`). Cada paso tiene su explicación y un **cubo 3D animado** que reproduce los algoritmos movimiento a movimiento (arrastra el cubo para girar la vista). Incluye modo práctica con mezcla aleatoria. La última capa tiene además una **variante del método de Kubekings** para comparar (otro orden y otros algoritmos). Tiene también una sección de **algoritmos de cuberos** (disparadores, OLL y PLL) con cada uno animado y su caso explicado.

Stack: Vite + React + TypeScript · Vitest (TDD) · GitHub Pages.

```
npm install
npm run dev     # desarrollo
npm test        # tests
npm run build   # producción
```

Flujo: toda mejora parte de una issue y entra por PR (`Closes #n`).

## PWA (instalable y sin conexión)

- `public/manifest.webmanifest` + iconos (`public/icon*.png`, `apple-touch-icon.png`, `icon.svg`): la app se puede instalar en el móvil.
- `pwa/sw.template.js` es el service worker; `pwa/swPlugin.ts` lo genera en cada build como `dist/sw.js`, con la lista de archivos y una versión derivada de ellos.
- Al desplegar una versión nueva, la app lo detecta y muestra un aviso con el botón **Actualizar**; no se actualiza sola a mitad de uso.
- Regenerar el icono: `node pwa/icon.mjs` dibuja `public/icon.svg`; los PNG se sacan de ese SVG (512, 192, 180 y maskable 512).

