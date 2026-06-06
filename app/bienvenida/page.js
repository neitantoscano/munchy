'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaBienvenida() {
  const router = useRouter()
  const [apodo, setApodo] = useState('')

  const handleEmpezar = () => {
    // Guardamos el apodo en localStorage temporal (mock)
    // Más adelante el Chat 1 nos dará el endpoint real
    if (apodo.trim()) {
      localStorage.setItem('munchy_apodo', apodo.trim())
    } else {
      localStorage.setItem('munchy_apodo', 'Munchie Fan')
    }
    router.push('/oficio')
  }

  return (
    <main className="min-h-screen bg-crema flex flex-col px-5 py-8">
      
      {/* Logo arriba */}
      <div className="flex justify-center pt-4 pb-2">
        <span className="font-serif text-2xl text-olivo">Munchy</span>
      </div>

      {/* Hero principal */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-2">
        
        {/* Hero image placeholder */}
        <div className="w-full max-w-xs h-56 mb-8 rounded-3xl overflow-hidden relative" 
             style={{ background: 'linear-gradient(135deg, #3d2b1f, #2d4a2d, #4a2060)' }}>
          <div className="absolute inset-0 flex items-center justify-center text-7xl"
               style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
            🥗
          </div>
          <img 
            src="/icons/bienvenida-hero.png" 
            alt="Bienvenida Munchy" 
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Chip de bienvenida */}
        <div className="inline-block bg-ambarFixed rounded-full px-4 py-1 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-ambar">
            ✨ Bienvenido a Munchy
          </span>
        </div>

        {/* Título */}
        <h1 className="font-serif text-4xl text-olivoOscuro leading-tight mb-3">
          Nutre tu<br />
          <em className="text-cafeTierra">mejor versión.</em>
        </h1>

        <p className="text-base text-olivoOscuro opacity-70 mb-8 max-w-xs leading-relaxed">
          Antojos saludables, hechos para ti. ¿Cómo te llamamos?
        </p>

        {/* Input del apodo */}
        <div className="w-full max-w-xs mb-2">
          <input
            type="text"
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            placeholder="Tu apodo o nombre"
            maxLength={20}
            className="w-full px-5 py-4 rounded-2xl border border-olivoClaro bg-white text-olivoOscuro text-center text-base font-medium focus:outline-none focus:border-olivo transition-colors"
          />
        </div>
        <p className="text-xs text-olivoOscuro opacity-50 mb-6">
          Puedes cambiarlo después
        </p>
      </div>

      {/* Botón empezar */}
      <button
        onClick={handleEmpezar}
        className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform"
        style={{ boxShadow: '0 8px 24px rgba(46,58,35,0.25)' }}
      >
        Empezar
        <span>→</span>
      </button>

    </main>
  )
}
