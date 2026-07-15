'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaAlergias() {
  const router = useRouter()
  const [seleccionadas, setSeleccionadas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const alergias = [
    { id: 'lactosa', label: 'Lactosa', sub: 'Leche, queso, yogurt', icono: '🥛' },
    { id: 'gluten', label: 'Gluten', sub: 'Trigo, pan, pastas', icono: '🌾' },
    { id: 'nueces', label: 'Nueces', sub: 'Cacahuates, almendras', icono: '🥜' },
    { id: 'mariscos', label: 'Mariscos', sub: 'Camarón, pescado, atún', icono: '🦐' },
    { id: 'otro', label: 'Otro', sub: 'Te preguntaremos después', icono: '➕' },
  ]

  const toggleAlergia = (id) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(a => a !== id))
    } else {
      setSeleccionadas([...seleccionadas, id])
    }
  }

  const guardarAlergias = async (lista) => {
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: Guarda las alergias en Supabase
      const res = await fetch('/api/usuario/alergias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alergias: lista }),
      })

      const data = await res.json()

      if (data.ok) {
        router.push('/ejercicio')
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
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full"
             style={{ background: '#22d3ee', filter: 'blur(100px)', opacity: 0.3 }} />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full"
             style={{ background: '#ec4899', filter: 'blur(110px)', opacity: 0.32 }} />
        <div className="absolute bottom-16 -right-20 w-64 h-64 rounded-full"
             style={{ background: '#facc15', filter: 'blur(100px)', opacity: 0.25 }} />
      </div>

      <div className="relative z-10 flex items-center justify-between pb-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform">←</button>
        <span className="font-serif text-lg text-crema">Munchy</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex gap-1 mb-8">
        <div className="flex-1 h-1 rounded-full" style={{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }}></div>
        <div className="flex-1 h-1 rounded-full" style={{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }}></div>
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}></div>
      </div>

      <div className="relative z-10 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">Paso 2 de 3</p>
        <h1 className="font-serif text-2xl text-crema leading-tight mb-2">Cosas a las que eres alérgico<br />o tienes prohibido comer</h1>
        <p className="text-sm text-crema opacity-70 leading-relaxed">Selecciona todas las que apliquen. Munchy nunca te dará recetas con esto.</p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 mb-6">
        {alergias.map(a => {
          const activa = seleccionadas.includes(a.id)
          return (
            <button
              key={a.id}
              onClick={() => toggleAlergia(a.id)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
              style={{
                background: activa ? '#fdeee8' : '#ffffff',
                border: `${activa ? 2 : 1}px solid ${activa ? '#E9967A' : '#c5c8bd40'}`,
                boxShadow: activa ? '0 4px 16px rgba(233,150,122,0.2)' : '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all" style={{ background: activa ? '#ffffff' : '#fdeee8' }}>
                <img
                  src={`/icons/icon-alergia-${a.id}.png`}
                  alt={a.label}
                  width={24}
                  height={24}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.innerHTML = `<span style="font-size:24px">${a.icono}</span>`
                  }}
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-base text-olivoOscuro mb-0.5">{a.label}</p>
                <p className="text-xs text-olivoOscuro opacity-60">{a.sub}</p>
              </div>

              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: activa ? '#E9967A' : 'transparent',
                  border: `2px solid ${activa ? '#E9967A' : '#c5c8bd'}`
                }}
              >
                {activa && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      {error && (
        <p className="relative z-10 text-xs text-salmon font-medium text-center mb-2">{error}</p>
      )}

      <div className="relative z-10 flex flex-col gap-3">
        <button
          onClick={() => guardarAlergias(seleccionadas)}
          disabled={cargando}
          className="w-full h-14 text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #ec4899)',
            boxShadow: '0 0 24px rgba(236,72,153,0.4)',
            opacity: cargando ? 0.7 : 1
          }}
        >
          {cargando ? 'Guardando...' : (
            seleccionadas.length > 0
              ? `Continuar (${seleccionadas.length} ${seleccionadas.length === 1 ? 'seleccionada' : 'seleccionadas'})`
              : 'Continuar'
          )}
          {!cargando && <span>→</span>}
        </button>

        <button onClick={() => guardarAlergias([])} disabled={cargando} className="text-sm text-crema opacity-70 underline py-2">
          No tengo alergias ni restricciones
        </button>
      </div>
    </main>
  )
}
