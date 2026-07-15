'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaEjercicio() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const niveles = [
    { id: 'nada', label: 'Cero ejercicio', sub: 'Vida sedentaria, prefiero descansar.', color: '#f5f4f0', borde: '#75786f', icono: '🛋️', intensidad: 1 },
    { id: 'ocasional', label: 'A veces', sub: '1-2 veces por semana, sin presión.', color: '#fff3d6', borde: '#c47c1a', icono: '🚶', intensidad: 2 },
    { id: 'frecuente', label: 'Frecuente', sub: '3-4 veces por semana, en forma.', color: '#eaf3de', borde: '#3d7a3d', icono: '🏃', intensidad: 3 },
    { id: 'gymrat', label: 'Gym Rat', sub: '5+ veces, vivo en el gym.', color: '#d4edda', borde: '#2e3a23', icono: '💪', intensidad: 4 },
  ]

  const handleFinalizar = async () => {
    if (!seleccionado) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: Guarda el nivel de ejercicio en Supabase
      const res = await fetch('/api/usuario/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nivel_ejercicio: seleccionado }),
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
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-6 overflow-hidden">

      {/* 🎨 Fondos neón (colores nuevos, no bloquean toques) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full"
             style={{ background: '#3b82f6', filter: 'blur(100px)', opacity: 0.3 }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full"
             style={{ background: '#f43f5e', filter: 'blur(110px)', opacity: 0.3 }} />
        <div className="absolute bottom-16 -left-20 w-64 h-64 rounded-full"
             style={{ background: '#a3e635', filter: 'blur(100px)', opacity: 0.25 }} />
      </div>

      <div className="relative z-10 flex items-center justify-between pb-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform">←</button>
        <span className="font-serif text-lg text-crema">Munchy</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex gap-1 mb-8">
        <div className="flex-1 h-1 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></div>
        <div className="flex-1 h-1 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></div>
        <div className="flex-1 h-1 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></div>
      </div>

      <div className="relative z-10 mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">Paso 3 de 3 — ¡Último!</p>
        <h1 className="font-serif text-3xl text-crema leading-tight mb-2">¿Te mueves?</h1>
        <p className="text-base text-crema opacity-70 leading-relaxed">Ajustamos las recetas a tu nivel de actividad.</p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 mb-6">
        {niveles.map(n => {
          const activo = seleccionado === n.id
          return (
            <button
              key={n.id}
              onClick={() => setSeleccionado(n.id)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
              style={{
                background: activo ? n.color : '#ffffff',
                border: `${activo ? 2 : 1}px solid ${activo ? n.borde : '#c5c8bd40'}`,
                boxShadow: activo ? `0 4px 16px ${n.borde}25` : '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all" style={{ background: activo ? '#ffffff' : n.color, boxShadow: `0 2px 8px ${n.borde}30` }}>
                <img
                  src={`/icons/icon-ejercicio-${n.id}.png`}
                  alt={n.label}
                  width={28}
                  height={28}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.innerHTML = `<span style="font-size:28px">${n.icono}</span>`
                  }}
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-base text-olivoOscuro mb-1">{n.label}</p>
                <p className="text-sm text-olivoOscuro opacity-60 mb-2">{n.sub}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-1 w-6 rounded-full transition-all" style={{ background: i <= n.intensidad ? n.borde : '#e9e8e4' }} />
                  ))}
                </div>
              </div>

              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: activo ? n.borde : '#e9e8e4' }}>
                {activo && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      {error && (
        <p className="relative z-10 text-xs text-salmon font-medium text-center mb-2">{error}</p>
      )}

      <button
        onClick={handleFinalizar}
        disabled={!seleccionado || cargando}
        className="relative z-10 w-full h-14 text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #f43f5e)',
          opacity: (seleccionado && !cargando) ? 1 : 0.5,
          boxShadow: seleccionado ? '0 0 24px rgba(244,63,94,0.4)' : 'none'
        }}
      >
        {cargando ? 'Guardando...' : (seleccionado ? '✨ Entrar a Munchy' : 'Selecciona tu nivel')}
        {!cargando && <span>→</span>}
      </button>
    </main>
  )
}
