'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function ContenidoNuevaContrasena() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [estado, setEstado] = useState('canjeando') // canjeando | listo_para_cambiar | enlace_malo | exito
  const [contrasena, setContrasena] = useState('')
  const [contrasena2, setContrasena2] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const burbujas = [
    { left: '12%', size: 20, dur: 17, delay: 0,  color: '#4ade80' },
    { left: '32%', size: 14, dur: 21, delay: 5,  color: '#a855f7' },
    { left: '52%', size: 26, dur: 15, delay: 9,  color: '#fb923c' },
    { left: '72%', size: 17, dur: 19, delay: 3,  color: '#4ade80' },
    { left: '90%', size: 22, dur: 16, delay: 11, color: '#a855f7' },
  ]

  useEffect(() => {
    const canjear = async () => {
      // Busca error o code en la URL normal
      if (searchParams.get('error')) { setEstado('enlace_malo'); return }
      let code = searchParams.get('code')

      // Respaldo: busca en el hash (#)
      if (!code && typeof window !== 'undefined' && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.substring(1))
        if (hash.get('error')) { setEstado('enlace_malo'); return }
        code = hash.get('code')
      }

      if (!code) { setEstado('enlace_malo'); return }

      try {
        // 🔌 SUPABASE (navegador): canjea el código por sesión
        const supabase = createClient()
        const { error: errorCanje } = await supabase.auth.exchangeCodeForSession(code)

        if (errorCanje) {
          setEstado('enlace_malo')
          return
        }

        setEstado('listo_para_cambiar')
      } catch (e) {
        setEstado('enlace_malo')
      }
    }

    canjear()
  }, [searchParams])

  const puedeGuardar = contrasena.length >= 8 && contrasena === contrasena2

  const handleGuardar = async () => {
    if (!puedeGuardar || cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 SUPABASE (navegador): cambia la contraseña con la sesión activa
      const supabase = createClient()
      const { error: errorCambio } = await supabase.auth.updateUser({ password: contrasena })

      if (errorCambio) {
        setError(errorCambio.message || 'No pudimos cambiar tu contraseña.')
      } else {
        setEstado('exito')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
    setCargando(false)
  }

  const fondo = (
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
  )

  const estilos = (
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
      @keyframes pulso {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50%      { opacity: 1;   transform: scale(1.3); }
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
  )

  // Validando el enlace
  if (estado === 'canjeando') {
    return (
      <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-5 overflow-hidden">
        {fondo}
        <div className="relative z-10 text-center">
          <h1 className="font-serif text-3xl text-crema mb-4">Munchy</h1>
          <p className="text-sm text-crema opacity-60 mb-4">Validando tu enlace...</p>
          <div className="flex gap-2 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full"
                   style={{ background: '#4ade80', animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
            ))}
          </div>
        </div>
        {estilos}
      </main>
    )
  }

  // Enlace expirado o inválido
  if (estado === 'enlace_malo') {
    return (
      <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8 overflow-hidden">
        {fondo}
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-5">⌛</div>
          <h1 className="font-serif text-3xl text-crema leading-tight mb-3">
            El enlace expiró
          </h1>
          <p className="text-sm text-crema opacity-70 max-w-xs leading-relaxed mb-2">
            Este enlace ya no sirve o ya se usó. Pide uno nuevo.
          </p>
          <p className="text-xs text-crema opacity-50 max-w-xs leading-relaxed mb-8">
            Ábrelo en el mismo celular o navegador donde pediste la recuperación.
          </p>
          <div className="borde-vivo w-full max-w-xs mx-auto">
            <button
              onClick={() => router.push('/recuperar')}
              className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
            >
              Pedir enlace nuevo
              <span>→</span>
            </button>
          </div>
        </div>
        {estilos}
      </main>
    )
  }

  // Contraseña cambiada
  if (estado === 'exito') {
    return (
      <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8 overflow-hidden">
        {fondo}
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-5">✅</div>
          <h1 className="font-serif text-3xl text-crema leading-tight mb-3">
            Listo, ya quedó
          </h1>
          <p className="text-sm text-crema opacity-70 max-w-xs leading-relaxed mb-8">
            Tu contraseña se cambió y ya estás dentro.
          </p>
          <div className="borde-vivo w-full max-w-xs mx-auto">
            <button
              onClick={() => router.push('/casa')}
              className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
            >
              Entrar a Munchy
              <span>→</span>
            </button>
          </div>
        </div>
        {estilos}
      </main>
    )
  }

  // Formulario
  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-8 overflow-hidden">
      {fondo}

      <div className="relative z-10 flex justify-center pt-4 pb-2">
        <span className="font-serif text-2xl text-crema">Munchy</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <h1 className="font-serif text-4xl text-crema leading-tight mb-2 text-center">
          Nueva contraseña
        </h1>
        <p className="text-sm text-crema opacity-70 mb-8 text-center leading-relaxed">
          Escríbela dos veces para no equivocarte.
        </p>

        <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Nueva contraseña</label>
        <input
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-2 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />
        <p className="text-xs mb-5" style={{ color: contrasena.length > 0 && contrasena.length < 8 ? '#E9967A' : 'rgba(250,249,245,0.5)' }}>
          {contrasena.length > 0 && contrasena.length < 8
            ? `Te faltan ${8 - contrasena.length} caracteres`
            : 'Mínimo 8 caracteres'}
        </p>

        <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">Repítela</label>
        <input
          type="password"
          value={contrasena2}
          onChange={(e) => setContrasena2(e.target.value)}
          placeholder="La misma contraseña"
          className="w-full px-5 py-4 rounded-2xl bg-white text-olivoOscuro text-base font-medium mb-2 focus:outline-none"
          style={{ border: '1px solid rgba(120,140,190,0.35)' }}
        />
        <p className="text-xs mb-6" style={{ color: contrasena2.length > 0 && contrasena !== contrasena2 ? '#E9967A' : 'rgba(250,249,245,0.5)' }}>
          {contrasena2.length > 0 && contrasena !== contrasena2
            ? 'No son iguales'
            : 'Debe ser igual a la de arriba'}
        </p>

        {error && (
          <p className="text-xs text-salmon font-medium text-center mb-3">{error}</p>
        )}
      </div>

      <div className="relative z-10">
        <div className="borde-vivo" style={{ opacity: puedeGuardar && !cargando ? 1 : 0.45 }}>
          <button
            onClick={handleGuardar}
            disabled={!puedeGuardar || cargando}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            {cargando ? 'Guardando...' : 'Guardar contraseña'}
            {!cargando && <span>→</span>}
          </button>
        </div>
      </div>

      {estilos}
    </main>
  )
}

export default function PantallaNuevaContrasena() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex items-center justify-center">
        <span className="font-serif text-2xl text-crema">Munchy</span>
      </main>
    }>
      <ContenidoNuevaContrasena />
    </Suspense>
  )
}
