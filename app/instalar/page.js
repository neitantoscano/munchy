'use client'

import { useState, useEffect } from 'react'

export default function PantallaInstalar() {
  const [sistema, setSistema] = useState(null) // null | 'android' | 'iphone'
  const [eventoInstalar, setEventoInstalar] = useState(null)
  const [yaInstalada, setYaInstalada] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const burbujas = [
    { left: '8%',  size: 22, dur: 15, delay: 0,  color: '#4ade80' },
    { left: '25%', size: 14, dur: 19, delay: 4,  color: '#a855f7' },
    { left: '42%', size: 28, dur: 13, delay: 8,  color: '#fb923c' },
    { left: '58%', size: 16, dur: 21, delay: 2,  color: '#4ade80' },
    { left: '74%', size: 24, dur: 17, delay: 11, color: '#a855f7' },
    { left: '90%', size: 13, dur: 14, delay: 6,  color: '#fb923c' },
  ]

  useEffect(() => {
    if (typeof window === 'undefined') return

    // ¿Ya está instalada y abierta como app?
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setYaInstalada(true)
    }

    // Android/Chrome avisa cuando la app se puede instalar.
    // Guardamos el evento para usarlo cuando el usuario toque el botón.
    const capturar = (e) => {
      e.preventDefault()
      setEventoInstalar(e)
    }
    window.addEventListener('beforeinstallprompt', capturar)

    const instalada = () => {
      setYaInstalada(true)
      setEventoInstalar(null)
    }
    window.addEventListener('appinstalled', instalada)

    return () => {
      window.removeEventListener('beforeinstallprompt', capturar)
      window.removeEventListener('appinstalled', instalada)
    }
  }, [])

  const instalarAndroid = async () => {
    if (!eventoInstalar) {
      setMensaje('Tu navegador no muestra el instalador aquí. Abre este enlace en Chrome, o usa el menú ⋮ → "Instalar app".')
      return
    }
    setMensaje('')
    eventoInstalar.prompt()
    const { outcome } = await eventoInstalar.userChoice
    if (outcome !== 'accepted') {
      setMensaje('No pasa nada, puedes instalarla cuando quieras.')
    }
    setEventoInstalar(null)
  }

  const pasosIphone = [
    { emoji: '⬆️', texto: 'Toca el botón Compartir, abajo en el centro de Safari.' },
    { emoji: '➕', texto: 'Baja en el menú hasta "Agregar a pantalla de inicio".' },
    { emoji: '✅', texto: 'Toca "Agregar" arriba a la derecha. ¡Listo!' },
  ]

  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.32 }} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.34 }} />
        <div className="absolute bottom-1/4 -left-16 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.28 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      {/* Encabezado */}
      <div className="relative z-10 flex flex-col items-center text-center pt-6 pb-8">
        {/* Logo con borde neón que gira */}
        <div className="marco-logo mb-5" style={{ animation: 'flotar 3s ease-in-out infinite' }}>
          <div className="w-24 h-24 rounded-[22px] flex items-center justify-center relative z-10 overflow-hidden"
               style={{ background: 'linear-gradient(160deg, #1c2a1c 0%, #0f1410 100%)' }}>
            <img src="/icons/munchy-192.png" alt="Munchy" width={72} height={72}
                 onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-size:44px">🥗</span>' }} />
          </div>
        </div>

        <h1 className="font-serif text-4xl text-crema leading-tight mb-3">
          Instala Munchy
        </h1>
        <p className="text-sm text-crema opacity-70 max-w-xs leading-relaxed">
          Recetas saludables hechas con lo que ya tienes en casa. Se instala como app, sin ocupar espacio.
        </p>
      </div>

      {/* Ya instalada */}
      {yaInstalada ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="font-serif text-2xl text-crema mb-2">Ya la tienes instalada</h2>
          <p className="text-sm text-crema opacity-60 max-w-xs">
            Búscala en tu pantalla de inicio como cualquier otra app.
          </p>
        </div>
      ) : !sistema ? (
        /* Elegir sistema */
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-4 text-center">
            ¿Qué celular tienes?
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSistema('android')}
              className="flex items-center gap-4 p-5 rounded-2xl text-left active:scale-98 transition-transform"
              style={{
                background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                border: '1px solid rgba(74,222,128,0.35)',
                boxShadow: '0 0 20px rgba(74,222,128,0.15)',
              }}
            >
              <span className="text-4xl">🤖</span>
              <div className="flex-1">
                <p className="font-semibold text-lg text-crema">Android</p>
                <p className="text-xs text-crema opacity-60">Samsung, Xiaomi, Motorola...</p>
              </div>
              <span className="text-crema opacity-50 text-xl">→</span>
            </button>

            <button
              onClick={() => setSistema('iphone')}
              className="flex items-center gap-4 p-5 rounded-2xl text-left active:scale-98 transition-transform"
              style={{
                background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                border: '1px solid rgba(168,85,247,0.35)',
                boxShadow: '0 0 20px rgba(168,85,247,0.15)',
              }}
            >
              <span className="text-4xl">🍎</span>
              <div className="flex-1">
                <p className="font-semibold text-lg text-crema">iPhone</p>
                <p className="text-xs text-crema opacity-60">iOS · Safari</p>
              </div>
              <span className="text-crema opacity-50 text-xl">→</span>
            </button>
          </div>
        </div>
      ) : sistema === 'android' ? (
        /* Android */
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <button
            onClick={() => { setSistema(null); setMensaje('') }}
            className="text-xs text-crema opacity-50 underline mb-6 self-start"
          >
            ← Cambiar de celular
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="font-serif text-2xl text-crema mb-2">Un solo toque</h2>
            <p className="text-sm text-crema opacity-70 max-w-xs mx-auto leading-relaxed">
              Toca el botón y confirma en el aviso que te aparezca.
            </p>
          </div>

          {mensaje && (
            <p className="text-xs text-salmon text-center mb-4 leading-relaxed px-2">{mensaje}</p>
          )}

          <div className="borde-vivo">
            <button
              onClick={instalarAndroid}
              className="w-full h-16 bg-olivo text-white rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
            >
              📲 Instalar Munchy
            </button>
          </div>

          <p className="text-center text-xs text-crema opacity-40 mt-4 leading-relaxed">
            Si no aparece el aviso, usa el menú ⋮ de Chrome → "Instalar app"
          </p>
        </div>
      ) : (
        /* iPhone */
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <button
            onClick={() => { setSistema(null); setMensaje('') }}
            className="text-xs text-crema opacity-50 underline mb-6 self-start"
          >
            ← Cambiar de celular
          </button>

          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🍎</div>
            <h2 className="font-serif text-2xl text-crema mb-2">Tres pasitos</h2>
            <p className="text-sm text-crema opacity-70 max-w-xs mx-auto leading-relaxed">
              Apple no deja instalar de un toque, pero es rápido. Hazlo desde <span className="font-semibold">Safari</span>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {pasosIphone.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl"
                   style={{
                     background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                     border: '1px solid rgba(120,140,190,0.28)',
                   }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                     style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)' }}>
                  {p.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-salmon mb-1">Paso {i + 1}</p>
                  <p className="text-sm text-crema opacity-85 leading-snug">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-crema opacity-40 mt-5 leading-relaxed">
            Si estás en Chrome o Instagram, abre esta página en Safari primero.
          </p>
        </div>
      )}

      <style jsx>{`
        .burbuja {
          position: absolute;
          bottom: -40px;
          border-radius: 9999px;
          opacity: 0;
          animation-name: subir;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes subir {
          0%   { transform: translateY(0);      opacity: 0; }
          15%  { opacity: 0.55; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes flotar {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }

        /* Marco del logo con línea neón girando */
        .marco-logo {
          position: relative;
          border-radius: 26px;
          padding: 3px;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 34px rgba(74,222,128,0.22);
        }
        .marco-logo::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 320%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #4ade80 60deg,
            #22d3ee 130deg,
            #a855f7 200deg,
            #fb923c 270deg,
            transparent 340deg
          );
          animation: girarLogo 3.5s linear infinite;
        }
        @keyframes girarLogo {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .borde-vivo {
          position: relative;
          border-radius: 1rem;
          padding: 2px;
          overflow: hidden;
        }
        .borde-vivo::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 250%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          background: conic-gradient(from 0deg, transparent 0deg, transparent 250deg, #4ade80 300deg, #a855f7 340deg, transparent 360deg);
          animation: girar 3s linear infinite;
        }
        @keyframes girar {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
