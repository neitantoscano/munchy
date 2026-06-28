'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaGuardados() {
  const router = useRouter()
  const [recetas, setRecetas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarGuardados = async () => {
    try {
      // 🔌 BACKEND: lee la lista real de recetas guardadas
      const res = await fetch('/api/recetas/guardadas', { cache: 'no-store' })
      const data = await res.json()

      if (data.ok) {
        setRecetas(data.recetas || [])
      } else {
        if (data.error === 'sin_sesion' || data.error === 'sesion_no_encontrada') {
          router.push('/bienvenida')
          return
        }
        setError('No pudimos cargar tus guardados.')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarGuardados()
  }, [])

  return (
    <main className="min-h-screen bg-crema pb-28">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-10"
           style={{ background: 'rgba(250,249,245,0.9)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-olivo">Guardados</span>
        <div className="w-10" />
      </div>

      <div className="px-5">
        <div className="pt-4 pb-5">
          <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">Tus Favoritos 🔖</h1>
          <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed">
            {recetas.length > 0
              ? `${recetas.length} ${recetas.length === 1 ? 'receta guardada' : 'recetas guardadas'}, listas para repetir.`
              : 'Aquí guardas las recetas que más te gusten.'}
          </p>
        </div>

        {error && (
          <div className="bg-white rounded-2xl p-4 mb-4 border border-salmon/50 text-center">
            <p className="text-sm text-salmon font-medium mb-3">{error}</p>
            <button onClick={() => { setError(''); setCargando(true); cargarGuardados() }} className="h-10 px-5 bg-olivo text-white rounded-xl text-sm font-semibold">
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-olivo"
                     style={{ animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
              ))}
            </div>
          </div>
        ) : recetas.length === 0 && !error ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-olivoClaro">
            <div className="w-16 h-16 rounded-2xl bg-olivoClaro/40 flex items-center justify-center text-4xl mx-auto mb-3">
              🔖
            </div>
            <p className="font-serif text-lg text-olivoOscuro mb-1">Sin recetas guardadas</p>
            <p className="text-sm text-olivoOscuro opacity-60 mb-4">Genera una receta y guárdala con el corazón ♥</p>
            <button
              onClick={() => router.push('/generar')}
              className="h-11 px-6 bg-olivo text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
            >
              Generar receta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recetas.map(r => (
              <button
                key={r.id}
                onClick={() => router.push(`/receta/${r.id}`)}
                className="bg-white rounded-2xl overflow-hidden text-left border border-olivoClaro/30 active:scale-98 transition-transform"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="relative w-full aspect-square flex items-center justify-center text-5xl"
                     style={{ background: r.estilo === 'moderna'
                       ? 'linear-gradient(135deg, #fdeee8, #ffe0d0)'
                       : 'linear-gradient(135deg, #eaf3de, #d9e8c6)' }}>
                  {r.emoji || '🍽️'}
                  {r.estilo && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm"
                          style={{ color: r.estilo === 'moderna' ? '#E9967A' : '#3d7a3d' }}>
                      {r.estilo === 'moderna' ? '✨ Moderna' : '🌿 Clásica'}
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <p className="font-semibold text-sm text-olivoOscuro leading-snug mb-2 line-clamp-2"
                     style={{ minHeight: '2.5rem' }}>
                    {r.titulo}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-olivoOscuro opacity-60">
                    {r.tiempo_minutos && <span>⏱️ {r.tiempo_minutos}m</span>}
                    {r.tiempo_minutos && r.proteina_g && <span>·</span>}
                    {r.proteina_g && <span>💪 {r.proteina_g}g</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulso {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </main>
  )
}
