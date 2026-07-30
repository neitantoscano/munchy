// ⚠️ SÚBELE ESTE NÚMERO EN CADA DEPLOY IMPORTANTE.
// Al cambiar, el navegador detecta versión nueva y avisa al usuario.
const VERSION = 'munchy-v1'
const CACHE = VERSION

// Al instalar: no esperamos, quedamos listos.
self.addEventListener('install', (evento) => {
  // No precargamos nada para no servir pantallas viejas.
  self.skipWaiting = self.skipWaiting
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

// Estrategia: RED PRIMERO.
// Siempre intentamos traer lo nuevo del servidor. El caché es solo
// respaldo por si no hay internet.
self.addEventListener('fetch', (evento) => {
  const peticion = evento.request

  // Solo manejamos GET del mismo sitio. Nada de APIs ni Supabase.
  if (peticion.method !== 'GET') return
  if (!peticion.url.startsWith(self.location.origin)) return
  if (peticion.url.includes('/api/')) return

  evento.respondWith(
    (async () => {
      try {
        const respuesta = await fetch(peticion)
        // Guardamos copia de respaldo para modo sin internet.
        if (respuesta && respuesta.status === 200) {
          const cache = await caches.open(CACHE)
          cache.put(peticion, respuesta.clone())
        }
        return respuesta
      } catch (e) {
        // Sin internet: usamos el respaldo si existe.
        const guardado = await caches.match(peticion)
        if (guardado) return guardado
        throw e
      }
    })()
  )
})
