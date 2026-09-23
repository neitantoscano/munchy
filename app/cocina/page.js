'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaCocina() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // ⚠️ Los logos van en public/icons/ como icon-cocina-{id}.png
  const niveles = [
    {
      id: 'basico',
      label: 'Lo básico',
      sub: 'Estufa, sartén y microondas',
      detalle: 'Estufa · Sartén · Olla · Microondas',
      icono: '🍳',
      neon: '#fb923c',
    },
    {
      id: 'completo',
      label: 'Lo normal',
      sub: 'También tengo horno y licuadora',
      detalle: 'Todo lo básico · Horno · Licuadora',
      icono: '🔥',
      neon: '#4ade80',
    },
    {
      id: 'equipado',
      label: 'Tengo de todo',
      sub: 'Freidora de aire, batidora y más',
      detalle: 'Todo lo anterior · Freidora de aire · Batidora · Picadora eléctrica',
      icono: '⚡',
      neon: '#a855f7',
    },
  ]

  const handleContinuar = async () => {
    if (!seleccionado || cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: guarda el nivel de cocina
      const res = await fetch('/api/usuario/cocina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nivel_cocina: seleccionado }),
      })

      const data = await res.json()

      if (data.ok) {
        router.push('/apodo')
      } else {
        if (data.error === 'sin_sesion') { router.push('/login'); return }
        // No avanzamos si no se guardó: quedaría en "completo" sin que él lo sepa
        setError(data.mensaje || 'No pudimos guardarlo. Intenta de nuevo.')
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
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full"
             style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.28 }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full"
             style={{ background: '#4ade80', filter: 'blur(110px)', opacity: 0.3 }} />
        <div className="absolute bottom-16 -left-20 w-64 h-64 rounded-full"
             style={{ background: '#a855f7', filter: 'blur(100px)', opacity: 0.26 }} />
      </div>

      <div className="relative z-10 flex items-center justify-between pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-lg text-crema">Munchy</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex gap-1 mb-8">
        {[true, true, true, true, false].map((lleno, i) => (
          <div key={i} className="flex-1 h-1 rounded-full"
               style={lleno
                 ? { background: '#4ade80', boxShadow: '0 0 8px #4ade80' }
                 : { background: 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>

      <div className="relative z-10 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">Paso 4 de 5</p>
        <h1 className="font-serif text-3xl text-crema leading-tight mb-2">¿Qué tienes en tu cocina?</h1>
        <p className="text-sm text-crema opacity-70 leading-relaxed">
          Solo te daremos recetas que puedas hacer de verdad con lo que tienes.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 mb-6">
        {niveles.map(n => {
          const activo = seleccionado === n.id
          return (
            <button
              key={n.id}
              onClick={() => setSeleccionado(n.id)}
              className="flex items-start gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
              style={{
                background: activo
                  ? 'rgba(74,222,128,0.12)'
                  : 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                border: `1px solid ${activo ? 'rgba(74,222,128,0.55)' : 'rgba(120,140,190,0.28)'}`,
                boxShadow: activo ? '0 0 22px rgba(74,222,128,0.25)' : '0 4px 18px rgba(0,0,0,0.5)',
              }}
            >
              {/* 📌 ESPACIO PARA EL LOGO DE POLO: public/icons/icon-cocina-{id}.png */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                   style={{
                     background: activo ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                     border: `1px solid ${activo ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.14)'}`,
                   }}>
                <img
                  src={`/icons/icon-cocina-${n.id}.png`}
                  alt={n.label}
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.innerHTML = `<span style="font-size:28px">${n.icono}</span>`
                  }}
                />
              </div>

              <div className="flex-1 pt-0.5">
                <p className="font-semibold text-base mb-0.5"
                   style={{ color: activo ? '#4ade80' : '#FAF9F5' }}>
                  {n.label}
                </p>
                <p className="text-sm text-crema opacity-70 mb-1.5">{n.sub}</p>
                <p className="text-[11px] text-crema opacity-45 leading-snug">{n.detalle}</p>
              </div>

              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                   style={{
                     background: activo ? '#4ade80' : 'transparent',
                     border: `2px solid ${activo ? '#4ade80' : 'rgba(255,255,255,0.25)'}`,
                   }}>
                {activo && <span className="text-black text-xs font-bold">✓</span>}
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
        onClick={handleContinuar}
        disabled={!seleccionado || cargando}
        className="relative z-10 w-full h-14 text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(135deg, #3d7a3d, #4ade80)',
          opacity: (seleccionado && !cargando) ? 1 : 0.5,
          boxShadow: seleccionado ? '0 0 24px rgba(74,222,128,0.4)' : 'none',
        }}
      >
        {cargando ? 'Guardando...' : (seleccionado ? 'Continuar' : 'Elige una opción')}
        {!cargando && <span>→</span>}
      </button>
    </main>
  )
}
