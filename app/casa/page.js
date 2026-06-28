'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaCasa() {
  const router = useRouter()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  const cargarResumen = async () => {
    try {
      // 🔌 BACKEND: lee el resumen real del usuario
      const res = await fetch('/api/casa/resumen', { cache: 'no-store' })
      const data = await res.json()

      if (data.ok) {
        setDatos({
          apodo: data.apodo || 'Munchie Fan',
          racha_dias: data.racha_dias ?? 0,
          recetas_restantes_hoy: data.recetas_restantes_hoy ?? 0,
          es_premium: !!data.es_premium,
          ingredientes_en_despensa: data.ingredientes_en_despensa ?? 0,
          dato_curioso: data.dato_curioso || '',
          primera_vez: !!data.primera_vez,
        })
      } else {
        if (data.error === 'sin_sesion' || data.error === 'sesion_no_encontrada') {
          router.push('/bienvenida')
          return
        }
        setError('No pudimos cargar tu información.')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
  }

  useEffect(() => {
    cargarResumen()
  }, [])

  const irAGenerar = () => {
    if (!datos.es_premium && datos.recetas_restantes_hoy === 0) {
      router.push('/premium')
      return
    }
    router.push('/generar')
  }

  if (error) {
    return (
      <main className="min-h-screen bg-crema flex flex-col items-center justify-center px-5">
        <p className="text-sm text-salmon font-medium text-center mb-4">{error}</p>
        <button onClick={cargarResumen} className="h-11 px-6 bg-olivo text-white rounded-xl text-sm font-semibold">
          Reintentar
        </button>
      </main>
    )
  }

  if (!datos) {
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

  const recetasTexto = datos.es_premium
    ? 'Recetas ilimitadas'
    : `${datos.recetas_restantes_hoy} ${datos.recetas_restantes_hoy === 1 ? 'receta gratis' : 'recetas gratis'} hoy`

  return (
    <main className="min-h-screen bg-crema pb-24">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-10" style={{ background: 'rgba(250,249,245,0.9)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full bg-olivoClaro border-2 border-olivoClaro flex items-center justify-center text-olivo font-bold" style={{ boxShadow: '0 0 0 2px rgba(46,58,35,0.2)' }}>
            {datos.apodo[0]?.toUpperCase() || '?'}
            {datos.racha_dias > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-salmon flex items-center justify-center text-white text-xs font-bold border-2 border-crema">
                {datos.racha_dias}
              </div>
            )}
          </div>
          <span className="font-serif text-xl text-olivo">Munchy</span>
        </div>

        <div className="flex items-center gap-1.5 bg-ambarFixed rounded-full px-3 py-1.5 border border-ambar/30">
          <span className="text-base">🔥</span>
          <span className="text-xs font-bold text-ambar">{datos.racha_dias} {datos.racha_dias === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      <div className="px-5">
        <div className="pt-6 pb-6">
          <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">Buenos días, {datos.apodo}. 👋</h1>
          <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed">
            {datos.primera_vez
              ? 'Tu primera receta es de regalo. ¿Listo para empezar?'
              : datos.ingredientes_en_despensa > 0
                ? `Tienes ${datos.ingredientes_en_despensa} ${datos.ingredientes_en_despensa === 1 ? 'ingrediente' : 'ingredientes'} en tu despensa. ¿Qué se te antoja hoy?`
                : 'Empieza llenando tu despensa o pide tu primera receta de regalo.'}
          </p>
        </div>

        {datos.dato_curioso && (
          <div className="bg-white rounded-2xl p-4 mb-6 border border-olivoClaro/30" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-ambarFixed flex items-center justify-center text-xl flex-shrink-0">💡</div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-ambar mb-1">Dato del día</p>
                <p className="text-sm text-olivoOscuro leading-relaxed">{datos.dato_curioso}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-olivo rounded-3xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-10 bg-olivoClaro"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15 bg-salmon"></div>

          <div className="flex items-start gap-3 relative">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl flex-shrink-0" style={{ animation: 'flotar 3s ease-in-out infinite' }}>
              <img src="/icons/munchie-feliz.png" alt="Munchie" width={48} height={48} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-size:32px">🤖</span>' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-1">¡Qué onda, soy Munchie!</p>
              <p className="font-serif text-lg text-white leading-snug">
                {datos.primera_vez
                  ? `Te tengo una sorpresa, ${datos.apodo}. Tu primera receta es de regalo 🎁`
                  : `${datos.apodo}, hoy tengo ideas perfectas para ti.`}
              </p>
