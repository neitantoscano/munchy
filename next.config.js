// next.config.js
// Cabeceras de seguridad: instrucciones que el servidor le manda al navegador
// para que proteja a tus usuarios. Antes no existía este archivo.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Aplica a todas las rutas de Munchy
        source: '/:path*',
        headers: [
          {
            // Nadie puede meter Munchy dentro de un marco en otro sitio.
            // Evita que te copien la pantalla para robar contraseñas.
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // El navegador respeta el tipo de archivo que le decimos
            // y no intenta adivinarlo. Evita que una imagen se ejecute como código.
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Al salir de Munchy, el otro sitio solo ve "vienes de munchy-xi.vercel.app",
            // nunca la ruta completa con datos del usuario.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Munchy no usa cámara, micrófono ni ubicación: se bloquean de raíz.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            // Obliga a usar HTTPS siempre, por 2 años.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Nadie puede incrustar Munchy, ni siquiera con otra técnica.
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
        ],
      },
      {
        // Las rutas de API nunca se guardan en caché de navegadores ni intermediarios.
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
