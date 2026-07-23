'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaLogin() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const burbujas = [
    { left: '10%', size: 20, dur: 16, delay: 0,  color: '#4ade80' },
    { left: '28%', size: 13, dur: 20, delay: 5,  color: '#a855f7' },
    { left: '46%', size: 26, dur: 14, delay: 9,  color: '#fb923c' },
    { left: '64%', size: 17, dur: 22, delay: 3,  color: '#4ade80' },
    { left: '82%', size: 22, dur: 18, delay: 12, color: '#a855f7' },
    { left: '94%', size: 14, dur: 15, delay: 7,  color: '#fb923c' },
  ]

  const puedeEntrar = correo.trim().includes('@') && contrasena.length > 0

  const handleLogin = async () => {
    if (!puedeEntrar || cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: inicia sesión
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim(), contrasena }),
      })

      const data = await res.json()

      if (data.ok) {
        // 🔌 BACKEND: pregunta qué le falta para saber a dónde mandarlo
        try {
          const resEstado = await fetch('/api/usuario/estado', { cache: 'no-store' })
          const estado = await resEstado.json()

          if (!estado.tiene_oficio) { router.push('/oficio'); return }
          if (!estado.tiene_nivel_ejercicio) { router.push('/ejercicio'); return }
          if (!estado.tiene_apodo) { router.push('/apodo'); return }
          router.push('/casa')
        } catch (e) {
          router.push('/casa')
        }
      } else {
        setError(data.mensaje || 'Correo o contraseña incorrectos.')
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
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.28 }} />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.3 }} />
        <div className="absolute bottom-10 -right-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.25 }} />
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

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <h1 className="font-serif text-4xl text-crema leading-tight mb-2 text-center">
          Qué gusto verte
        </h1>
        <p className="text-sm text-crema opacity-70 mb-8 text-center leading-relaxed">
          Entra para seguir tu racha. 🔥
        </p>

        <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Correo</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          autoCapitalize="none"
          className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-5 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />

        <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Contraseña</label>
        <input
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Tu contraseña"
          className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-3 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />

        <button
          onClick={() => router.push('/recuperar')}
          className="text-xs text-crema opacity-60 underline text-right mb-6"
        >
          Olvidé mi contraseña
        </button>

        {error && (
          <p className="text-xs text-salmon font-medium text-center mb-3">{error}</p>
        )}
      </div>

      <div className="relative z-10">
        <div className="borde-vivo" style={{ opacity: puedeEntrar && !cargando ? 1 : 0.45 }}>
          <button
            onClick={handleLogin}
            disabled={!puedeEntrar || cargando}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            {cargando ? 'Entrando...' : 'Entrar'}
            {!cargando && <span>→</span>}
          </button>
        </div>

        <button
          onClick={() => router.push('/registro')}
          className="w-full text-sm text-crema opacity-70 underline py-4 mt-2"
        >
          No tengo cuenta, quiero crear una
        </button>
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
