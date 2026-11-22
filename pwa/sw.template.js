// Service worker de CuboFácil. El build sustituye los dos marcadores de abajo: la versión y la lista de archivos
// (ver pwa/swPlugin.ts).
// - Precarga la app al instalarse: funciona sin conexión.
// - NO se activa solo: espera a que el usuario pulse «Actualizar» en la app (mensaje SKIP_WAITING).
const VERSION = '__VERSION__'
const PREFIJO = 'cubofacil-'
const CACHE = PREFIJO + VERSION
const ARCHIVOS = __ASSETS__.map((a) => new URL(a, self.registration.scope).href)
const PAGINA_PRINCIPAL = new URL('./index.html', self.registration.scope).href

self.addEventListener('install', (event) => {
  // cache: 'reload' salta la caché HTTP del navegador. GitHub Pages sirve todo con max-age=600: sin esto, una versión
  // nueva podría guardar un index.html (o assets) de hace unos minutos y la app «actualizada» seguiría siendo la vieja.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS.map((url) => new Request(url, { cache: 'reload' })))))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n.startsWith(PREFIJO) && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const pedido = event.request
  if (pedido.method !== 'GET') return
  if (new URL(pedido.url).origin !== self.location.origin) return
  // La app es de una sola página (rutas con #): cualquier navegación recibe la página principal.
  const clave = pedido.mode === 'navigate' ? PAGINA_PRINCIPAL : pedido
  event.respondWith(caches.match(clave).then((guardado) => guardado || fetch(pedido)))
})
