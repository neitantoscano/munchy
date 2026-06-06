'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaOficio() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)

  const perfiles = [
    { 
      id: 'estudiante', 
      label: 'Estudiante', 
      sub: 'Comidas rápidas y económicas.',
      color: '#eaf3de',
      borde: '#2e3a23',
      icono: '🎓'
    },
    { 
      id: 'atleta', 
      label: 'Atleta', 
      sub: 'Alta proteína y rendimiento.',
      color: '#fff0e8',
      borde: '#8f4c35',
      icono: '🏋️'
    },
    { 
      id: 'profesional', 
      label: 'Profesional', 
      sub: 'Meal prep y cocina sofisticada.',
      color: '#f6ded1',
      borde: '#a0522d',
      icono: '💼'
    },
    { 
      id: 'cocinero', 
      label: 'Cocinero en Casa', 
      sub: 'Cocina creativa y relajada.',
      color: '#d4edda',
      borde: '#3d7a3d',
      icono: '🍳'
    },
  ]

  const handleContinuar = () => {
    if (seleccionado) {
      localStorage.setItem('munchy_oficio', seleccionado)
      router.push('/alergias')
    }
  }

  const apodo = typeof window !== 'undefined' 
    ? localStorage.getItem('munchy_apodo') || 'Tú'
    : 'Tú'

  return (
    <main className="min-h-screen bg-crema flex flex-col px-5 py-6">

      {/* Header con back */}
      <div className="flex items-center justify-between pb-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >
          ←
        </button>
        <span className="font-serif text-lg text-olivo">Munchy</span>
        <div className="w-10" /> {/* Spacer para centrar */}
      </div>

      {/* Indicador de progreso */}
      <div className="flex gap-1 mb-8">
        <div className="flex-1 h-1 rounded-full bg-olivo"></div>
        <div className="flex-1 h-1 rounded-full bg-olivoClaro opacity-40"></div>
        <div className="flex-1 h-1 rounded-full bg-olivoClaro opacity-40"></div>
      </div>

      {/* Saludo personalizado */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-2">
          Paso 1 de 3
        </p>
        <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">
          ¡Hola, {apodo}!
        </h1>
        <p className="text-base text-olivoOscuro opacity-70 leading-relaxed">
          Cuéntame, ¿cuál de estos eres tú?
        </p>
      </div>

      {/* Lista de perfiles */}
      <div className="flex flex-col gap-3 mb-8">
        {perfiles.map(p => (
          <button
            key={p.id}
            onClick={() => setSeleccionado(p.id)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
            style={{
              background: seleccionado === p.id ? p.color : '#ffffff',
              border: `${seleccionado === p.id ? 2 : 1}px solid ${seleccionado === p.id ? p.borde : '#c5c8bd40'}`,
              boxShadow: seleccionado === p.id 
                ? `0 4px 16px ${p.borde}25` 
                : '0 2px 12px rgba(0,0,0,0.04)'
            }}
          >
            {/* Icono */}
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all"
              style={{
                background: seleccionado === p.id ? '#ffffff' : p.color,
                boxShadow: `0 2px 8px ${p.borde}30`
              }}
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

            {/* Texto */}
            <div className="flex-1">
              <p className="font-semibold text-base text-olivoOscuro mb-0.5">
                {p.label}
              </p>
              <p className="text-sm text-olivoOscuro opacity-60">
                {p.sub}
              </p>
            </div>

            {/* Checkmark */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: seleccionado === p.id ? p.borde : '#e9e8e4'
              }}
            >
              {seleccionado === p.id && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Botón continuar */}
      <button
        onClick={handleContinuar}
        disabled={!seleccionado}
        className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{
          opacity: seleccionado ? 1 : 0.5,
          boxShadow: seleccionado ? '0 8px 24px rgba(46,58,35,0.25)' : 'none'
        }}
      >
        Continuar
        <span>→</span>
      </button>

    </main>
  )
}
