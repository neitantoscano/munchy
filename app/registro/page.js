'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaRegistro() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const burbujas = [
    { left: '8%',  size: 22, dur: 15, delay: 0,  color: '#4ade80' },
    { left: '25%', size: 14, dur: 19, delay: 4,  color: '#a855f7' },
    { left: '42%', size: 28, dur: 13, delay: 8,  color: '#fb923c' },
    { left: '58%', size: 16, dur: 21, delay: 2,  color: '#4ade80' },
    { left: '74%', size: 24, dur: 17, delay: 11, color: '#a855f7' },
    { left: '90%', size: 13, dur: 14, delay: 6,  color: '#fb923c' },
  ]

  const puedeSeguir = correo.trim().includes('@') && contrasena.length >= 8

  const handleRegistro = async () => {
    if (!puedeSeguir || cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: crea la cuenta
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim(), contrasena }),
      })

      const data = await res.json()

      if (data.ok) {
        router.push('/oficio')
      } else {
        setError(data.mensaje || 'No pudimos crear tu cuenta. Intenta de nuevo.')
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

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <h1 className="font-serif text-4xl text-crema leading-tight mb-2 text-center">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-crema opacity-70 mb-8 text-center leading-relaxed">
          Para guardar tus recetas y tu racha.
        </p>

        <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Correo</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          autoCapitalize="none"
          className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-2 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />
        <p className="text-xs text-crema opacity-60 mb-5 leading-relaxed">
          ⚠️ Escribe bien tu correo, lo necesitarás para recuperar tu cuenta.
        </p>

        <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Contraseña</label>
        <input
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-2 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />
        <p className="text-xs mb-6" style={{ color: contrasena.length > 0 && contrasena.length < 8 ? '#E9967A' : 'rgba(250,249,245,0.5)' }}>
          {contrasena.length > 0 && contrasena.length < 8
            ? `Te faltan ${8 - contrasena.length} caracteres`
            : 'Mínimo 8 caracteres'}
        </p>

        {error && (
          <p className="text-xs text-salmon font-medium text-center mb-3">{error}</p>
        )}
      </div>

      <div className="relative z-10">
        <div className="borde-vivo" style={{ opacity: puedeSeguir && !cargando ? 1 : 0.45 }}>
          <button
            onClick={handleRegistro}
            disabled={!puedeSeguir || cargando}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            {cargando ? 'Creando tu cuenta...' : 'Crear cuenta'}
            {!cargando && <span>→</span>}
          </button>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full text-sm text-crema opacity-70 underline py-4 mt-2"
        >
          Ya tengo cuenta, iniciar sesión
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
