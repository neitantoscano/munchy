'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaApodo() {
  const router = useRouter()
  const [apodo, setApodo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const burbujas = [
    { left: '10%', size: 22, dur: 16, delay: 0,  color: '#4ade80' },
    { left: '30%', size: 14, dur: 20, delay: 5,  color: '#a855f7' },
    { left: '50%', size: 28, dur: 14, delay: 9,  color: '#fb923c' },
    { left: '70%', size: 17, dur: 22, delay: 3,  color: '#4ade80' },
    { left: '88%', size: 22, dur: 18, delay: 11, color: '#a855f7' },
  ]

  const puedeSeguir = apodo.trim().length > 0

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

  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
        <div className="text-6xl mb-5">👋</div>

        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">Último paso</p>
        <h1 className="font-serif text-4xl text-crema leading-tight mb-3">
          ¿Cómo te llamamos?
        </h1>
        <p className="text-sm text-crema opacity-70 mb-8 max-w-xs leading-relaxed">
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
        <p className="text-xs text-crema opacity-50 mb-2">
          Puedes cambiarlo después
        </p>

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
            {cargando ? 'Guardando...' : '✨ Entrar a Munchy'}
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
