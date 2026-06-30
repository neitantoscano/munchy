'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaReceta({ params }) {
  const router = useRouter()
  const [receta, setReceta] = useState(null)
  const [error, setError] = useState('')
  const [guardada, setGuardada] = useState(false)
  const [cocinando, setCocinando] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [rachaNueva, setRachaNueva] = useState(null)

  const cargarReceta = async () => {
    try {
      // 🔌 BACKEND: lee la receta real
      const res = await fetch(`/api/receta/${params.id}`, { cache: 'no-store' })
      const data = await res.json()

      if (data.ok && data.receta) {
        setReceta(data.receta)
        setGuardada(!!data.receta.guardada)
      } else {
        if (data.error === 'sin_sesion' || data.error === 'sesion_no_encontrada') {
          router.push('/bienvenida')
          return
        }
        setError('No pudimos cargar la receta.')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
  }

  useEffect(() => {
    cargarReceta()
  }, [params.id])

  const toggleGuardar = async () => {
    const nuevoEstado = !guardada
    setGuardada(nuevoEstado) // optimista

    try {
      // 🔌 BACKEND: guarda o quita de favoritos
      await fetch('/api/receta/guardar', {
        method: nuevoEstado ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receta_id: params.id }),
      })
    } catch (e) {
      setGuardada(!nuevoEstado) // revierte si falla
    }
  }

  const handleCocine = async () => {
    if (cocinando) return
    setCocinando(true)

    try {
      // 🔌 BACKEND: confirma que cocinó → sube racha + descuenta despensa
      const res = await fetch('/api/receta/confirmar-cocina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receta_id: params.id }),
      })

      const data = await res.json()

      if (data.ok) {
        setRachaNueva(data.racha_nueva)
        setConfetti(true)
      } else {
        setCocinando(false)
      }
    } catch (e) {
      setCocinando(false)
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-crema flex flex-col items-center justify-center px-5">
        <p className="text-sm text-salmon font-medium text-center mb-4">{error}</p>
        <div className="flex gap-2">
          <button onClick={() => { setError(''); cargarReceta() }} className="h-11 px-6 bg-olivo text-white rounded-xl text-sm font-semibold">
            Reintentar
          </button>
          <button onClick={() => router.push('/casa')} className="h-11 px-6 border border-olivoClaro text-olivoOscuro rounded-xl text-sm font-semibold">
            Ir a casa
          </button>
        </div>
      </main>
    )
  }

  if (!receta) {
    return (
      <main className="min-h-screen bg-crema flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-olivo"
                 style={{ animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
          ))}
        </div>
        <style jsx>{`@keyframes pulso { 0%,100% { opacity:0.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.3) } }`}</style>
      </main>
    )
  }

  if (confetti) {
    return (
      <main className="min-h-screen bg-crema flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="absolute text-2xl"
                  style={{
                    left: `${Math.random()*100}%`,
                    top: `-10%`,
                    animation: `caer ${2 + Math.random()*2}s ease-in ${Math.random()*0.5}s infinite`,
                  }}>
              {['🔥','✨','🎉','🥗'][i%4]}
            </span>
          ))}
        </div>

        <div className="text-7xl mb-4">🔥</div>
        <h1 className="font-serif text-3xl text-olivoOscuro text-center mb-2">
          {rachaNueva ? `¡${rachaNueva} días seguidos!` : '¡Receta cocinada!'}
        </h1>
        <p className="text-base text-olivoOscuro opacity-70 text-center max-w-xs mb-8">
          La despensa se actualizó y tu racha sigue viva, <span className="font-semibold">campeón</span>.
        </p>

        <button
          onClick={() => router.push('/casa')}
          className="w-full max-w-xs h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide active:scale-95 transition-all"
          style={{ boxShadow: '0 8px 24px rgba(46,58,35,0.25)' }}
        >
          Volver a casa →
        </button>

        <style jsx>{`
          @keyframes caer {
            0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-crema pb-32">
      <div className="relative w-full aspect-[16/9] overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #2e3a23, #8f4c35, #E9967A)' }}>
        {receta.imagen_url ? (
          <img src={receta.imagen_url} alt={receta.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            {receta.emoji}
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-olivo active:scale-95 transition-transform"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >←</button>

        <div className="absolute top-4 right-4">
          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm"
                style={{ color: receta.estilo === 'moderna' ? '#E9967A' : '#3d7a3d' }}>
            {receta.estilo === 'moderna' ? '✨ Moderna' : '🌿 Clásica'}
          </span>
        </div>
      </div>

      <div className="px-5 pt-6">
        <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">
          {receta.titulo}
        </h1>
        <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed mb-4">
          {receta.descripcion}
        </p>

        <div className="flex gap-4 mb-6 text-sm text-olivoOscuro">
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span className="font-semibold">{receta.tiempo_minutos} min</span>
          </div>
          <div className="w-px bg-olivoClaro" />
          <div className="flex items-center gap-1.5">
            <span>🍽️</span>
            <span className="font-semibold">{receta.porciones} porciones</span>
          </div>
        </div>

        <section className="bg-white rounded-2xl p-4 mb-6 border border-olivoClaro/30"
                 style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-3">
            Información nutricional
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'Calorías', valor: receta.macros.calorias },
              { label: 'Proteína', valor: `${receta.macros.proteina_g}g` },
              { label: 'Carbos',   valor: `${receta.macros.carbos_g}g` },
              { label: 'Grasas',   valor: `${receta.macros.grasas_g}g` },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className="font-serif text-xl text-olivoOscuro">{m.valor}</p>
                <p className="text-[10px] text-olivoOscuro opacity-60 uppercase tracking-wide">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-olivoClaro/30">
            {[
              { label: 'Azúcar', valor: `${receta.macros.azucar_g}g` },
              { label: 'Fibra',  valor: `${receta.macros.fibra_g}g` },
              { label: 'Sodio',  valor: `${receta.macros.sodio_mg}mg` },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className="text-sm font-semibold text-olivoOscuro">{m.valor}</p>
                <p className="text-[10px] text-olivoOscuro opacity-60 uppercase tracking-wide">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-serif text-xl text-olivoOscuro mb-3">Ingredientes</h2>
          <div className="bg-white rounded-2xl p-4 border border-olivoClaro/30"
               style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {receta.ingredientes.map((ing, i) => (
              <div key={i}
                   className={`flex justify-between items-center py-2 ${i < receta.ingredientes.length-1 ? 'border-b border-olivoClaro/20' : ''}`}>
                <span className="text-sm text-olivoOscuro">{ing.nombre}</span>
                <span className="text-sm font-semibold text-cafeTierra">{ing.cantidad}</span>
              </div>
            ))}
          </div>
        </section>

        {receta.ingredientes_pro && receta.ingredientes_pro.length > 0 && (
          <section className="mb-6">
            <div className="bg-salmonLight rounded-2xl p-4 border border-salmon/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cafeTierra">
                  ✨ Nivel Pro
                </span>
                <span className="text-xs text-olivoOscuro opacity-50">(opcional)</span>
              </div>
              <p className="text-xs text-olivoOscuro opacity-70 italic mb-3">
                Si los tienes, llevan tu receta al siguiente nivel.
              </p>
              <div className="space-y-3">
                {receta.ingredientes_pro.map((ing, i) => (
                  <div key={i} className="bg-white rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-olivoOscuro">{ing.nombre}</span>
                      <span className="text-sm font-bold text-salmon">{ing.cantidad}</span>
                    </div>
                    <p className="text-xs text-olivoOscuro opacity-70 leading-relaxed">
                      ↳ {ing.razon}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mb-6">
          <h2 className="font-serif text-xl text-olivoOscuro mb-3">Instrucciones</h2>
          <div className="space-y-3">
            {receta.instrucciones.map((paso, i) => (
              <div key={i} className="flex gap-3 bg-white rounded-2xl p-4 border border-olivoClaro/30"
                   style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-7 h-7 rounded-full bg-olivo text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-olivoOscuro leading-relaxed pt-0.5">{paso}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-4 pt-3 z-50"
           style={{ background: 'linear-gradient(to top, rgba(250,249,245,1) 70%, rgba(250,249,245,0))' }}>
        <div className="flex gap-3">
          <button
            onClick={toggleGuardar}
            className="h-14 w-14 rounded-2xl border-2 flex items-center justify-center text-2xl active:scale-95 transition-all"
            style={{
              borderColor: guardada ? '#E9967A' : '#c5c8bd',
              background: guardada ? '#fdeee8' : '#ffffff',
              color: guardada ? '#E9967A' : '#19240f',
            }}
          >
            {guardada ? '♥' : '♡'}
          </button>

          <button
            onClick={handleCocine}
            disabled={cocinando}
            className="flex-1 h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{
              boxShadow: '0 8px 24px rgba(46,58,35,0.25)',
              opacity: cocinando ? 0.7 : 1,
            }}
          >
            {cocinando ? '🔥 Sumando a tu racha...' : '✓ Ya cociné esto 🔥'}
          </button>
        </div>
      </div>
    </main>
  )
}
