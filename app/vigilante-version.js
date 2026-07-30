'use client'

import { useEffect, useState } from 'react'

export default function VigilanteVersion() {
  const [hayNueva, setHayNueva] = useState(false)
  const [registro, setRegistro] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    let recargando = false

    // Cuando el nuevo Service Worker toma el control, recargamos una sola vez.
    const alCambiar = () => {
      if (recargando) return
      recargando = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', alCambiar)

    const registrar = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistro(reg)

        // ¿Ya hay una versión nueva esperando?
        if (reg.waiting && navigator.serviceWorker.controller) {
          setHayNueva(true)
        }

        // Detecta cuando llega una versión nueva.
        reg.addEventListener('updatefound', () => {
          const nuevo = reg.installing
          if (!nuevo) return
          nuevo.addEventListener('statechange', () => {
            if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
              setHayNueva(true)
            }
          })
        })

        // Revisa si hay versión nueva cada vez que se abre la app.
        reg.update()
      } catch (e) {
        // Si falla el registro, la app sigue funcionando normal.
        console.log('SW no se registró:', e?.message)
      }
    }

    registrar()

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', alCambiar)
    }
  }, [])

  const actualizar = () => {
    if (registro?.waiting) {
      registro.waiting.postMessage('ACTUALIZAR_YA')
    } else {
      window.location.reload()
    }
  }

  if (!hayNueva) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        bottom: '92px',
        maxWidth: 'calc(100% - 32px)',
        background: 'rgba(18,18,20,0.92)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(74,222,128,0.35)',
        boxShadow: '0 0 22px rgba(74,222,128,0.18)',
        animation: 'aparecerAviso 0.35s ease-out',
      }}
    >
      <span className="text-base">✨</span>
      <p className="text-xs text-crema opacity-90 leading-snug flex-1">
        Hay una versión nueva de Munchy
      </p>
      <button
        onClick={actualizar}
        className="text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex-shrink-0"
        style={{ background: '#4ade80', color: '#0a0a0a' }}
      >
        Actualizar
      </button>

      <style jsx>{`
        @keyframes aparecerAviso {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}
