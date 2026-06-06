'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaEjercicio() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)

  const niveles = [
    { 
      id: 'nada', 
      label: 'Cero ejercicio', 
      sub: 'Vida sedentaria, prefiero descansar.',
      color: '#f5f4f0',
      borde: '#75786f',
      icono: '🛋️',
      intensidad: 1
    },
    { 
      id: 'ocasional', 
      label: 'A veces', 
      sub: '1-2 veces por semana, sin presión.',
      color: '#fff3d6',
      borde: '#c47c1a',
      icono: '🚶',
      intensidad: 2
    },
    { 
      id: 'frecuente', 
      label: 'Frecuente', 
      sub: '3-4 veces por semana, en forma.',
      color: '#eaf3de',
      borde: '#3d7a3d',
      icono: '🏃',
      intensidad: 3
    },
    { 
      id: 'gymrat', 
      label: 'Gym Rat', 
      sub: '5+ veces, vivo en el gym.',
      color: '#d4edda',
      borde: '#2e3a23',
      icono: '💪',
      intensidad: 4
    },
  ]

  const handleFinalizar = () => {
    if (seleccionado) {
      localStorage.setItem('munchy_ejercicio', seleccionado)
      localStorage.setItem('munchy_onboarding_completo', 'true')
      router.push('/casa')
    }
  }

  return (
    <main className="min-h-screen bg-crema flex flex-col px-5 py-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >
          ←
        </button>
        <span className="font-serif text-lg text-olivo">Munchy</span>
        <div className="w-10" />
      </div>

      {/* Progreso COMPLETO */}
      <div className="flex gap-1 mb-8">
        <div className="flex-1 h-1 rounded-full bg-olivo"></div>
        <div className="flex-1 h-1 rounded-full bg-olivo"></div>
        <div className="flex-1 h-1 rounded-full bg-olivo"></div>
      </div>

      {/* Título */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-2">
          Paso 3 de 3 — ¡Último!
        </p>
        <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">
          ¿Te mueves?
        </h1>
        <p className="text-base text-olivoOscuro opacity-70 leading-relaxed">
          Ajustamos las recetas a tu nivel de actividad.
        </p>
      </div>

      {/* Lista de niveles */}
      <div className="flex flex-col gap-3 mb-6">
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
                boxShadow: activo 
                  ? `0 4px 16px ${n.borde}25` 
                  : '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              {/* Icono */}
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all"
                style={{
                  background: activo ? '#ffffff' : n.color,
                  boxShadow: `0 2px 8px ${n.borde}30`
                }}
              >
                <img 
                  src={`/icons/icon-ejercicio-${n.id}.png`}
                  alt={n.label}
                  width={28}
                  height={28}
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.innerHTML
