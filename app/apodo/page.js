'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaApodo() {
  const router = useRouter()
  const [apodo, setApodo] = useState('')
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [aceptaSensibles, setAceptaSensibles] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const burbujas = [
    { left: '10%', size: 22, dur: 16, delay: 0,  color: '#4ade80' },
    { left: '30%', size: 14, dur: 20, delay: 5,  color: '#a855f7' },
    { left: '50%', size: 28, dur: 14, delay: 9,  color: '#fb923c' },
    { left: '70%', size: 17, dur: 22, delay: 3,  color: '#4ade80' },
    { left: '88%', size: 22, dur: 18, delay: 11, color: '#a855f7' },
  ]

  // Hay que escribir apodo y aceptar los dos consentimientos
  const puedeSeguir = apodo.trim().length > 0 && aceptaPrivacidad && aceptaSensibles

  const textoBoton = () => {
    if (cargando) return 'Guardando...'
    if (apodo.trim().length === 0) return 'Escribe tu apodo'
    if (!aceptaPrivacidad || !aceptaSensibles) return 'Acepta para continuar'
    return '✨ Entrar a Munchy'
  }

  const handleGuardar = async () => {
    if (!puedeSeguir || cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: guarda el apodo
      const res = await fetch('/api/usuario/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apodo: apodo.trim() }),
      })

      const data = await res.json()

      if (data.ok) {
        // 🔌 BACKEND: deja constancia de la aceptación (si el endpoint existe).
        // Si falla, no bloqueamos al usuario.
        try {
          await fetch('/api/usuario/consentimiento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              acepto_privacidad: true,
              acepto_datos_sensibles: true,
              version_documentos: 'v1-2026-08-28',
            }),
          })
        } catch (e) {
          // silencioso
        }

        router.push('/casa')
      } else {
        setError('Algo salió mal. Intenta de nuevo.')
        setCargando(false)
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
      setCargando(false)
    }
  }

  const casillas = [
    {
      id: 'privacidad',
      valor: aceptaPrivacidad,
      set: setAceptaPrivacidad,
      texto: 'He leído y acepto el Aviso de Privacidad y los Términos y Condiciones.',
    },
    {
      id: 'sensibles',
      valor: aceptaSensibles,
      set: setAceptaSensibles,
      texto: 'Doy mi consentimiento expreso para tratar mis alergias e intolerancias (datos sensibles) con el único fin de personalizar mis recetas.',
    },
  ]

  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.28 }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.3 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.25 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 flex justify-center pt-4 pb-2">
        <span className="font-serif text-2xl text-crema">Munchy</span>
      </div>

      <div className="relative z-10 flex gap-1 mt-6 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        <div className="text-5xl mb-4">👋</div>

        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">Último paso</p>
        <h1 className="font-serif text-4xl text-crema leading-tight mb-3">
          ¿Cómo te llamamos?
        </h1>
        <p className="text-sm text-crema opacity-70 mb-6 max-w-xs leading-relaxed">
          Con este nombre te va a saludar Munchie todos los días.
        </p>

        <input
          type="text"
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
          placeholder="Tu apodo o nombre"
          maxLength={20}
          className="w-full max-w-xs px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-center text-base font-medium mb-2 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />
        <p className="text-xs text-crema opacity-50 mb-6">
          Puedes cambiarlo después
        </p>

        {/* Consentimientos */}
        <div className="w-full flex flex-col gap-2 mb-3">
          {casillas.map(c => (
            <button
              key={c.id}
              onClick={() => c.set(!c.valor)}
              className="flex items-start gap-3 p-4 rounded-2xl text-left active:scale-98 transition-all"
              style={{
                background: c.valor ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${c.valor ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.14)'}`,
              }}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                   style={{
                     background: c.valor ? '#4ade80' : 'transparent',
                     border: `2px solid ${c.valor ? '#4ade80' : 'rgba(255,255,255,0.3)'}`,
                   }}>
                {c.valor && <span className="text-black text-[10px] font-bold">✓</span>}
              </div>
              <span className="flex-1 text-xs leading-relaxed"
                    style={{ color: '#FAF9F5', opacity: c.valor ? 0.9 : 0.6 }}>
                {c.texto}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/legal')}
          className="text-xs text-crema opacity-55 underline mb-3"
        >
          Ver el Aviso de Privacidad y los Términos
        </button>

        {error && (
          <p className="text-xs text-salmon font-medium mb-2">{error}</p>
        )}
      </div>

      <div className="relative z-10">
        <div className="borde-vivo" style={{ opacity: puedeSeguir && !cargando ? 1 : 0.45 }}>
          <button
            onClick={handleGuardar}
            disabled={!puedeSeguir || cargando}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            {textoBoton()}
            {!cargando && <span>→</span>}
          </button>
        </div>
      </div>

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
        .borde-vivo {
          position: relative;
          border-radius: 1rem;
          padding: 2px;
          overflow: hidden;
          transition: opacity 0.2s;
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
