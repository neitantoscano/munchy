'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaOficio() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const perfiles = [
    { id: 'estudiante', label: 'Estudiante', sub: 'Comidas rápidas y económicas.', tip: 'Para ti que vives entre clases y tareas.', color: '#eaf3de', borde: '#2e3a23', icono: '🎓' },
    { id: 'trabajo8h', label: 'Trabajo 8 horas', sub: 'Oficinista o turnos fijos.', tip: 'Recetas para llevar al trabajo y batch cooking.', color: '#f6ded1', borde: '#a0522d', icono: '🕐' },
    { id: 'atleta', label: 'Atleta', sub: 'Alta proteína y rendimiento.', tip: 'Si compites, entrenas duro o haces deporte intenso.', color: '#fff0e8', borde: '#8f4c35', icono: '🏋️' },
    { id: 'profesional', label: 'Profesional', sub: 'Meal prep y cocina sofisticada.', tip: 'Para ejecutivos, freelancers o emprendedores.', color: '#ede0f7', borde: '#5c3d6e', icono: '💼' },
    { id: 'cocinero', label: 'Cocinero en Casa', sub: 'Cocina creativa y relajada.', tip: 'Te gusta experimentar y tienes tiempo en la cocina.', color: '#d4edda', borde: '#3d7a3d', icono: '🍳' },
    { id: 'libre', label: 'Horario libre', sub: 'Sin rutina fija.', tip: 'Trabajas desde casa, estudias o estás entre proyectos.', color: '#fff3d6', borde: '#c47c1a', icono: '🌿' },
  ]

  const handleContinuar = async () => {
    if (!seleccionado) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: Guarda el oficio en Supabase
      const res = await fetch('/api/usuario/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oficio: seleccionado }),
      })

      const data = await res.json()

      if (data.ok) {
        router.push('/alergias')
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

      {/* 🎨 Fondos neón (decorativos, no bloquean toques) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full"
             style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.3 }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full"
             style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.35 }} />
        <div className="absolute bottom-24 -left-20 w-64 h-64 rounded-full"
             style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.28 }} />
      </div>

      <div className="relative z-10 flex items-center justify-between pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-lg text-crema">Munchy</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex gap-1 mb-6">
        <div className="flex-1 h-1 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></div>
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}></div>
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}></div>
      </div>

      <div className="relative z-10 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">Paso 1 de 3</p>
        <h1 className="font-serif text-3xl text-crema leading-tight mb-2">¿Cuál de estos eres tú?</h1>
        <p className="text-base text-crema opacity-70 leading-relaxed">Esto nos ayuda a personalizar tus recetas.</p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 mb-6">
        {perfiles.map(p => {
          const activo = seleccionado === p.id
          return (
            <button
              key={p.id}
              onClick={() => setSeleccionado(p.id)}
              className="flex items-start gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
              style={{
                background: activo ? p.color : '#ffffff',
                border: `${activo ? 2 : 1}px solid ${activo ? p.borde : '#c5c8bd40'}`,
                boxShadow: activo ? `0 4px 16px ${p.borde}25` : '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all"
                style={{ background: activo ? '#ffffff' : p.color, boxShadow: `0 2px 8px ${p.borde}30` }}
              >
                <img
                  src={`/icons/icon-oficio-${p.id}.png`}
                  alt={p.label}
                  width={28}
                  height={28}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.innerHTML = `<span style="font-size:28px">${p.icono}</span>`
                  }}
                />
              </div>

              <div className="flex-1 pt-0.5">
                <p className="font-semibold text-base text-olivoOscuro mb-0.5">{p.label}</p>
                <p className="text-sm text-olivoOscuro opacity-70 mb-1.5">{p.sub}</p>
                <p className="text-xs italic" style={{ color: p.borde, opacity: 0.85 }}>💡 {p.tip}</p>
              </div>

              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                style={{ background: activo ? p.borde : '#e9e8e4' }}
              >
                {activo && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="relative z-10 text-xs text-salmon font-medium text-center mb-2">{error}</p>
      )}

      <button
        onClick={handleContinuar}
        disabled={!seleccionado || cargando}
        className="relative z-10 w-full h-14 text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all sticky bottom-4"
        style={{
          background: 'linear-gradient(135deg, #3d7a3d, #4ade80)',
          opacity: (seleccionado && !cargando) ? 1 : 0.5,
          boxShadow: seleccionado ? '0 0 24px rgba(74,222,128,0.4)' : 'none'
        }}
      >
        {cargando ? 'Guardando...' : 'Continuar'}
        {!cargando && <span>→</span>}
      </button>
    </main>
  )
}
