'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaCasa() {
  const router = useRouter()
  const [apodo, setApodo] = useState('Munchie Fan')
  const [mostrarBannerCorreo, setMostrarBannerCorreo] = useState(false)

  // Mock data — en el futuro vendrá del backend
  const datosMock = {
    racha_dias: 5,
    recetas_restantes_hoy: 3,
    es_premium: false,
    ingredientes_en_despensa: 6,
    dato_curioso: 'El chocolate negro tiene más antioxidantes que los arándanos. 🍫',
    primera_vez: true,
  }

  useEffect(() => {
    const apodoGuardado = localStorage.getItem('munchy_apodo')
    if (apodoGuardado) setApodo(apodoGuardado)
  }, [])

  const irAGenerar = () => {
    router.push('/generar')
  }

  return (
    <main className="min-h-screen bg-crema pb-24">

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-10"
           style={{ background: 'rgba(250,249,245,0.9)', backdropFilter: 'blur(14px)' }}>
        
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full bg-olivoClaro border-2 border-olivoClaro flex items-center justify-center text-olivo font-bold"
               style={{ boxShadow: '0 0 0 2px rgba(46,58,35,0.2)' }}>
            {apodo[0].toUpperCase()}
            {datosMock.racha_dias > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-salmon flex items-center justify-center text-white text-xs font-bold border-2 border-crema">
                {datosMock.racha_dias}
              </div>
            )}
          </div>
          <span className="font-serif text-xl text-olivo">Munchy</span>
        </div>

        {/* Racha */}
        <div className="flex items-center gap-1.5 bg-ambarFixed rounded-full px-3 py-1.5 border border-ambar/30">
          <span className="text-base">🔥</span>
          <span className="text-xs font-bold text-ambar">
            {datosMock.racha_dias} días
          </span>
        </div>
      </div>

      <div className="px-5">

        {/* Saludo */}
        <div className="pt-6 pb-6">
          <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">
            Buenos días, {apodo}. 👋
          </h1>
          <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed">
            {datosMock.primera_vez 
              ? 'Tu primera receta es de regalo. ¿Lista para empezar?'
              : `Tienes ${datosMock.ingredientes_en_despensa} ingredientes en tu despensa. ¿Qué se te antoja hoy?`
            }
          </p>
        </div>

        {/* Dato del día */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-olivoClaro/30"
             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-ambarFixed flex items-center justify-center text-xl flex-shrink-0">
              💡
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-ambar mb-1">
                Dato del día
              </p>
              <p className="text-sm text-olivoOscuro leading-relaxed">
                {datosMock.dato_curioso}
              </p>
            </div>
          </div>
        </div>

        {/* Mascota Munchie */}
        <div className="bg-olivo rounded-3xl p-5 mb-6 relative overflow-hidden">
          {/* Burbujas decorativas */}
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-10 bg-olivoClaro"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15 bg-salmon"></div>

          <div className="flex items-start gap-3 relative">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl flex-shrink-0"
                 style={{ animation: 'flotar 3s ease-in-out infinite' }}>
              <img 
                src="/icons/munchie-feliz.png"
                alt="Munchie"
                width={48}
                height={48}
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement.innerHTML = '<span style="font-size:32px">🤖</span>'
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-1">
                ¡Qué onda, soy Munchie!
              </p>
              <p className="font-serif text-lg text-white leading-snug">
                {datosMock.primera_vez 
                  ? `Te tengo una sorpresa, ${apodo}. Tu primera receta es de regalo 🎁`
                  : `${apodo}, hoy tengo ideas perfectas para ti.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* CTA principal */}
        <button
          onClick={irAGenerar}
          className="w-full bg-olivo text-white rounded-2xl py-5 mb-6 active:scale-98 transition-transform"
          style={{ boxShadow: '0 8px 24px rgba(46,58,35,0.3)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-base tracking-wide">
              {datosMock.primera_vez ? 'GENERAR MI PRIMERA RECETA 🎁' : 'GENERAR ANTOJO FIT'}
            </span>
          </div>
          <p className="text-xs text-olivoClaro/70 font-medium">
            {!datosMock.es_premium && `${datosMock.recetas_restantes_hoy} recetas gratis hoy`}
          </p>
        </button>

        {/* Despensa rápida */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-olivoOscuro">Mi Despensa</h2>
            <button 
              onClick={() => router.push('/despensa')}
              className="text-xs font-semibold text-cafeTierra bg-salmon/10 rounded-full px-3 py-1.5"
            >
              Ver todo →
            </button>
          </div>

          {datosMock.ingredientes_en_despensa === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center border-2 border-dashed border-olivoClaro">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-olivoOscuro opacity-70 mb-3">
                Tu despensa está vacía
              </p>
              <button 
                onClick={() => router.push('/despensa')}
                className="text-sm font-semibold text-olivo underline"
              >
                Agregar ingredientes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {['🥛', '🌾', '🍯', '🍌', '💪', '🫐'].map((emoji, i) => (
                <div key={i} className="bg-white rounded-xl aspect-square flex items-center justify-center text-3xl border border-olivoClaro/20">
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banner agregar correo (aparece después del día 2) */}
        {mostrarBannerCorreo && (
          <div className="bg-ambarFixed rounded-2xl p-4 mb-6 border border-ambar/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-ambar mb-1">
                  ¡Llevas {datosMock.racha_dias} días seguidos!
                </p>
                <p className="text-xs text-olivoOscuro opacity-70 mb-2">
                  Guarda tu progreso con tu correo para no perderlo.
                </p>
                <button className="text-xs font-semibold text-olivo underline">
                  Agregar correo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Barra de navegación inferior */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-4 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl px-2 py-2 flex justify-around items-center border border-olivoClaro/30"
             style={{ boxShadow: '0 -2px 20px rgba(0,0,0,0.08)' }}>
          {[
            { id: 'casa', label: 'Casa', icono: '🏠', activo: true },
            { id: 'despensa', label: 'Despensa', icono: '📦' },
            { id: 'guardados', label: 'Guardados', icono: '🔖' },
            { id: 'perfil', label: 'Perfil', icono: '👤' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => router.push(`/${item.id}`)}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all"
              style={{ background: item.activo ? '#2e3a23' : 'transparent' }}
            >
              <span className="text-base" style={{ filter: item.activo ? 'brightness(10)' : 'none' }}>
                {item.icono}
              </span>
              <span className={`text-[10px] font-semibold ${item.activo ? 'text-white' : 'text-olivoOscuro opacity-60'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Animación flotar */}
      <style jsx>{`
        @keyframes flotar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

    </main>
  )
}
