'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function PantallaRecuperar() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const burbujas = [
    { left: '12%', size: 20, dur: 17, delay: 0,  color: '#4ade80' },
    { left: '32%', size: 14, dur: 21, delay: 5,  color: '#a855f7' },
    { left: '52%', size: 26, dur: 15, delay: 9,  color: '#fb923c' },
    { left: '72%', size: 17, dur: 19, delay: 3,  color: '#4ade80' },
    { left: '90%', size: 22, dur: 16, delay: 11, color: '#a855f7' },
  ]

  const puedeEnviar = correo.trim().includes('@')

  const handleEnviar = async () => {
    if (!puedeEnviar || cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 SUPABASE (navegador): manda el correo de recuperación.
      // Se hace desde el navegador para que el code verifier de PKCE
      // quede guardado aquí y el canje del enlace funcione.
      const supabase = createClient()
      const { error: errorEnvio } = await supabase.auth.resetPasswordForEmail(
        correo.trim(),
        { redirectTo: `${window.location.origin}/nueva-contrasena` }
      )

      if (errorEnvio) {
        setError(errorEnvio.message || 'No pudimos enviar el correo. Intenta de nuevo.')
      } else {
        setEnviado(true)
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
    setCargando(false)
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.26 }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.28 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.24 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-lg text-crema">Munchy</span>
        <div className="w-10" />
      </div>

      {enviado ? (
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
          <div className="text-6xl mb-5">📬</div>
          <h1 className="font-serif text-3xl text-crema leading-tight mb-3">
            Revisa tu correo
          </h1>
          <p className="text-sm text-crema opacity-70 max-w-xs leading-relaxed mb-2">
            Si <span className="font-semibold">{correo.trim()}</span> tiene una cuenta, ahí llegará el enlace para crear tu nueva contraseña. Revisa también spam.
          </p>
          <p className="text-xs text-crema opacity-50 max-w-xs leading-relaxed mb-8">
            ⚠️ Ábrelo en este mismo navegador, si no, el enlace no va a funcionar.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-crema opacity-70 underline py-2"
          >
            Volver a iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h1 className="font-serif text-4xl text-crema leading-tight mb-2 text-center">
              ¿Olvidaste tu clave?
            </h1>
            <p className="text-sm text-crema opacity-70 mb-8 text-center leading-relaxed">
              Escribe tu correo y te mandamos un enlace para crear una nueva.
            </p>

            <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoCapitalize="none"
              className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-4 focus:outline-none"
              style={{ border: '1px solid rgba(120,140,190,0.35)' }}
            />

            {error && (
              <p className="text-xs text-salmon font-medium text-center mb-3">{error}</p>
            )}
          </div>

          <div className="relative z-10">
            <div className="borde-vivo" style={{ opacity: puedeEnviar && !cargando ? 1 : 0.45 }}>
              <button
                onClick={handleEnviar}
                disabled={!puedeEnviar || cargando}
                className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
              >
                {cargando ? 'Enviando...' : 'Enviar enlace'}
                {!cargando && <span>→</span>}
              </button>
            </div>
          </div>
        </>
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
