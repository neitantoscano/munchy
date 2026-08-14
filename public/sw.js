// ⚠️ SÚBELE ESTE NÚMERO EN CADA DEPLOY IMPORTANTE.
// Al cambiar, el navegador detecta versión nueva y avisa al usuario.
const VERSION = 'munchy-v4'
const CACHE = VERSION

self.addEventListener('install', () => {
  // No precargamos nada.
})

// Al activar: borramos cachés de versiones anteriores.
// OJO: esto solo borra caché de archivos. NO toca cookies (ahí vive la sesión).
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const nombres = await caches.keys()
      await Promise.all(
        nombres.map((nombre) => (nombre !== CACHE ? caches.delete(nombre) : null))
      )
      await self.clients.claim()
    })()
  )
})

// Mensaje desde la app: el usuario tocó "Actualizar".
self.addEventListener('message', (evento) => {
  if (evento.data === 'ACTUALIZAR_YA') {
    self.skipWaiting()
  }
})

// ¿Este archivo lo puede manejar el Service Worker?
// SOLO archivos estáticos. Nada de APIs ni páginas.
function esEstatico(peticion) {
  let url
  try {
    url = new URL(peticion.url)
  } catch (e) {
    return false
  }

  // Solo del mismo sitio
  if (url.origin !== self.location.origin) return false
  // Solo GET
  if (peticion.method !== 'GET') return false
  // NUNCA tocar el backend
  if (url.pathname.startsWith('/api/')) return false
  // Nunca tocar navegaciones (páginas)
  if (peticion.mode === 'navigate') return false

  // Solo estas carpetas y estos tipos de archivo
  const permitido =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/i.test(url.pathname)

  return permitido
}

// Estrategia para estáticos: caché primero, red de respaldo.
self.addEventListener('fetch', (evento) => {
  if (!esEstatico(evento.request)) return // pasa directo, sin tocarlo

  evento.respondWith(
    (async () => {
      const guardado = await caches.match(evento.request)
      if (guardado) return guardado

      try {
        const respuesta = await fetch(evento.request)
        if (respuesta && respuesta.status === 200) {
          const cache = await caches.open(CACHE)
          cache.put(evento.request, respuesta.clone())
        }
        return respuesta
      } catch (e) {
        return fetch(evento.request)
      }
    })()
  )
})
