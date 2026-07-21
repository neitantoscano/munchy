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
          frase_premium: data.frase_premium || null,
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
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
        <p className="text-sm text-salmon font-medium text-center mb-4">{error}</p>
        <button onClick={cargarResumen} className="h-11 px-6 bg-olivo text-white rounded-xl text-sm font-semibold" style={{ boxShadow: '0 0 18px rgba(255,255,255,0.12)' }}>
          Reintentar
        </button>
      </main>
    )
  }

  if (!datos) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-crema"
                 style={{ animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
          ))}
        </div>
        <style jsx global>{`@keyframes pulso { 0%,100% { opacity:0.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.3) } }`}</style>
      </main>
    )
  }

  const recetasTexto = datos.es_premium
    ? 'Recetas ilimitadas'
    : `${datos.recetas_restantes_hoy} ${datos.recetas_restantes_hoy === 1 ? 'receta gratis' : 'recetas gratis'} hoy`

  // Texto que se muestra en el bloque de Munchie:
  // - Premium con frase → la frase del día
  // - Si no → el mensaje de bienvenida de siempre
  const mensajeMunchie = datos.frase_premium
    ? datos.frase_premium
    : (datos.primera_vez
        ? `Te tengo una sorpresa, ${datos.apodo}. Tu primera receta es de regalo 🎁`
        : `${datos.apodo}, hoy tengo ideas perfectas para ti.`)

  const tituloMunchie = datos.frase_premium
    ? '👑 Tu momento Premium'
    : '¡Qué onda, soy Munchie!'

  return (
    <main className="relative min-h-screen bg-black pb-24">

      {/* 🎨 Glows neutros al centro (fijos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full" style={{ background: '#c9cbd1', filter: 'blur(120px)', opacity: 0.14 }} />
        <div className="absolute top-1/4 left-4 w-56 h-56 rounded-full" style={{ background: '#8a8f99', filter: 'blur(110px)', opacity: 0.12 }} />
        <div className="absolute bottom-1/4 right-4 w-60 h-60 rounded-full" style={{ background: '#b0a99f', filter: 'blur(120px)', opacity: 0.12 }} />
      </div>

      {/* ✨ Glow lineal gris-blanco recubriendo la orilla */}
      <div className="pointer-events-none fixed inset-0 z-40" style={{ boxShadow: 'inset 0 0 70px 3px rgba(255,255,255,0.16), inset 0 0 15px 1px rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.10)' }} />

      <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-30" style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full bg-olivoClaro border-2 border-olivoClaro flex items-center justify-center text-olivo font-bold" style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }}>
            {datos.apodo[0]?.toUpperCase() || '?'}
            {datos.racha_dias > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-salmon flex items-center justify-center text-white text-xs font-bold border-2 border-black">
                {datos.racha_dias}
              </div>
            )}
          </div>
          <span className="font-serif text-xl text-crema">Munchy</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/historia')}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <span className="text-sm">📖</span>
            <span className="text-xs font-bold text-crema">Historia</span>
          </button>

          <div className="flex items-center gap-1.5 bg-ambarFixed rounded-full px-3 py-1.5 border border-ambar/30">
            <span className="text-base">🔥</span>
            <span className="text-xs font-bold text-ambar">{datos.racha_dias} {datos.racha_dias === 1 ? 'día' : 'días'}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5">
        <div className="pt-6 pb-6">
          <h1 className="font-serif text-3xl text-crema leading-tight mb-2">Buenos días, {datos.apodo}. 👋</h1>
          <p className="text-sm text-crema opacity-70 leading-relaxed">
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

        <div className="bg-olivo rounded-3xl p-5 mb-6 relative overflow-hidden border border-white/10">
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-10 bg-olivoClaro"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15 bg-salmon"></div>

          <div className="flex items-start gap-3 relative">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl flex-shrink-0" style={{ animation: 'flotar 3s ease-in-out infinite' }}>
              <img src="/icons/munchie-feliz.png" alt="Munchie" width={48} height={48} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-size:32px">🤖</span>' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-1">{tituloMunchie}</p>
              <p className="font-serif text-lg text-white leading-snug">{mensajeMunchie}</p>
              {datos.frase_premium && (
                <p className="text-[10px] text-olivoClaro/60 mt-2 leading-relaxed">
                  Frases para inspirarte, no son asesoría financiera ni médica.
                </p>
              )}
            </div>
          </div>
        </div>

        <button onClick={irAGenerar} className="w-full bg-olivo text-white rounded-2xl py-5 mb-6 active:scale-98 transition-transform" style={{ animation: 'flotar 3.5s ease-in-out infinite', boxShadow: '0 0 22px rgba(255,255,255,0.14), 0 10px 28px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.14)' }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-base tracking-wide">
              {datos.primera_vez ? 'GENERAR MI PRIMERA RECETA 🎁' : 'GENERAR ANTOJO FIT'}
            </span>
          </div>
          <p className="text-xs text-olivoClaro/70 font-medium">{recetasTexto}</p>
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-crema">Mi Despensa</h2>
            <button onClick={() => router.push('/despensa')} className="text-xs font-semibold text-salmon bg-salmon/10 rounded-full px-3 py-1.5">Ver todo →</button>
          </div>

          {datos.ingredientes_en_despensa === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center border-2 border-dashed border-olivoClaro">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-olivoOscuro opacity-70 mb-3">Tu despensa está vacía</p>
              <button onClick={() => router.push('/despensa')} className="text-sm font-semibold text-olivo underline">Agregar ingredientes</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 text-center border border-olivoClaro/30" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <p className="font-serif text-3xl text-olivoOscuro mb-1">{datos.ingredientes_en_despensa}</p>
              <p className="text-xs text-olivoOscuro opacity-60 uppercase tracking-wide">
                {datos.ingredientes_en_despensa === 1 ? 'ingrediente guardado' : 'ingredientes guardados'}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-4 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl px-2 py-2 flex justify-around items-center border border-olivoClaro/30" style={{ boxShadow: '0 -2px 20px rgba(0,0,0,0.08)' }}>
          {[
            { id: 'casa', label: 'Casa', icono: '🏠', activo: true },
            { id: 'despensa', label: 'Despensa', icono: '📦' },
            { id: 'guardados', label: 'Guardados', icono: '🔖' },
            { id: 'perfil', label: 'Perfil', icono: '👤' },
          ].map(item => (
            <button key={item.id} onClick={() => router.push(`/${item.id}`)} className="flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all" style={{ background: item.activo ? '#2e3a23' : 'transparent' }}>
              <span className="text-base" style={{ filter: item.activo ? 'brightness(10)' : 'none' }}>{item.icono}</span>
              <span className={`text-[10px] font-semibold ${item.activo ? 'text-white' : 'text-olivoOscuro opacity-60'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <style jsx global>{`
        @keyframes flotar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulso {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </main>
  )
}
