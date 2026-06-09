'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaGenerar() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)
  const [textoLibre, setTextoLibre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensajeIdx, setMensajeIdx] = useState(0)

  const tipos = [
    { id: 'desayuno',  label: 'Desayuno',  sub: 'Arranca con energía',  icono: '🍳', color: '#fff3d6', borde: '#c47c1a' },
    { id: 'almuerzo',  label: 'Almuerzo',  sub: 'Ligero al mediodía',   icono: '🥗', color: '#eaf3de', borde: '#3d7a3d' },
    { id: 'comida',    label: 'Comida',    sub: 'La principal del día', icono: '🍽️', color: '#d9e8c6', borde: '#2e3a23' },
    { id: 'cena',      label: 'Cena',      sub: 'Suave por la noche',   icono: '🌙', color: '#ede0f7', borde: '#5c3d6e' },
    { id: 'postre',    label: 'Postre',    sub: 'Dulce fit',            icono: '🍰', color: '#fdeee8', borde: '#E9967A' },
    { id: 'snack',     label: 'Snack',     sub: 'Botana saludable',     icono: '🥜', color: '#fff0e8', borde: '#8f4c35' },
    { id: 'gym_meal',  label: 'Gym Meal',  sub: 'Pre o post entreno',   icono: '💪', color: '#d4edda', borde: '#3d7a3d' },
    { id: 'otro',      label: 'Otro',      sub: 'Tú me dices',          icono: '✨', color: '#f5f4f0', borde: '#75786f' },
  ]

  const mensajesLoading = [
    'Munchie está revisando tu despensa... 🔍',
    'Calculando los mejores ingredientes... 🧮',
    'Cocinando algo delicioso... 👨‍🍳',
    'Casi listo, aguanta... ✨',
  ]

  useEffect(() => {
    if (!cargando) return
    const interval = setInterval(() => {
      setMensajeIdx(prev => (prev + 1) % mensajesLoading.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [cargando])

  const puedeGenerar =
    seleccionado &&
    (seleccionado !== 'otro' || textoLibre.trim().length > 0)

  const handleGenerar = () => {
    if (!puedeGenerar) return
    setCargando(true)

    // MOCK: simula llamada al backend (real en semana 4 → /api/receta/generar)
    setTimeout(() => {
      localStorage.setItem('munchy_ultimo_tipo', seleccionado)
      if (seleccionado === 'otro') {
        localStorage.setItem('munchy_ultimo_texto', textoLibre.trim())
      }
      router.push('/receta/mock-001')
    }, 4000)
  }

  // ----- VISTA DE CARGA -----
  if (cargando) {
    return (
      <main className="min-h-screen bg-crema flex flex-col items-center justify-center px-5 py-8">
        <div className="w-24 h-24 rounded-3xl bg-olivo flex items-center justify-center mb-6 relative"
             style={{ animation: 'flotar 2.5s ease-in-out infinite', boxShadow: '0 12px 32px rgba(46,58,35,0.3)' }}>
          <img
            src="/icons/munchie-cocinando.png"
            alt="Munchie"
            width={60}
            height={60}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.innerHTML = '<span style="font-size:54px">👨‍🍳</span>'
            }}
          />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-salmon flex items-center justify-center text-sm border-2 border-crema">
            ✨
          </div>
        </div>

        <h1 className="font-serif text-2xl text-olivoOscuro text-center mb-3 leading-tight">
          Creando tu receta...
        </h1>

        <p className="text-sm text-olivoOscuro opacity-70 text-center max-w-xs leading-relaxed min-h-[40px]"
           style={{ animation: 'fadeIn 0.5s' }}
           key={mensajeIdx}>
          {mensajesLoading[mensajeIdx]}
        </p>

        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-olivo"
              style={{
                animation: 'pulso 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @keyframes flotar {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulso {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50%      { opacity: 1;   transform: scale(1.3); }
          }
        `}</style>
      </main>
    )
  }

  // ----- VISTA DE SELECCIÓN -----
  return (
    <main className="min-h-screen bg-crema flex flex-col px-5 py-6 pb-8">
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-lg text-olivo">Munchy</span>
        <div className="w-10" />
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-2">
          Generar receta
        </p>
        <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">
          ¿Qué se te antoja?
        </h1>
        <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed">
          Munchie te creará algo único basado en tu despensa y perfil.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {tipos.map(t => {
          const activo = seleccionado === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSeleccionado(t.id)}
              className="flex flex-col items-start p-4 rounded-2xl text-left transition-all active:scale-98"
              style={{
                background: activo ? t.color : '#ffffff',
                border: `${activo ? 2 : 1}px solid ${activo ? t.borde : '#c5c8bd40'}`,
                boxShadow: activo ? `0 4px 16px ${t.borde}25` : '0 2px 12px rgba(0,0,0,0.04)',
                minHeight: '110px',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-2 transition-all"
                style={{ background: activo ? '#ffffff' : t.color, boxShadow: `0 2px 8px ${t.borde}30` }}
              >
                <img
                  src={`/icons/icon-comida-${t.id}.png`}
                  alt={t.label}
                  width={24}
                  height={24}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.innerHTML = `<span style="font-size:22px">${t.icono}</span>`
                  }}
                />
              </div>

              <p className="font-semibold text-sm text-olivoOscuro mb-0.5">{t.label}</p>
              <p className="text-xs text-olivoOscuro opacity-60 leading-snug">{t.sub}</p>

              {activo && (
                <div
                  className="absolute w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: t.borde, top: '10px', right: '10px' }}
                >
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {seleccionado === 'otro' && (
        <div
          className="bg-white rounded-2xl p-4 mb-5 border border-olivoClaro/50"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.04)', animation: 'aparecer 0.3s ease-out' }}
        >
          <label className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-2 block">
            Cuéntame qué quieres
          </label>
          <textarea
            value={textoLibre}
            onChange={(e) => {
              if (e.target.value.length <= 200) setTextoLibre(e.target.value)
            }}
            placeholder="Ej: algo con plátano y avena, no muy dulce..."
            rows={3}
            className="w-full p-3 rounded-xl border border-olivoClaro/50 bg-cremaSuave text-olivoOscuro text-sm resize-none focus:outline-none focus:border-olivo transition-colors"
          />
          <div className="flex justify-end mt-2">
            <span
              className="text-xs font-medium"
              style={{ color: textoLibre.length > 180 ? '#E9967A' : '#19240f99' }}
            >
              {textoLibre.length}/200
            </span>
          </div>
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={handleGenerar}
        disabled={!puedeGenerar}
        className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{
          opacity: puedeGenerar ? 1 : 0.5,
          boxShadow: puedeGenerar ? '0 8px 24px rgba(46,58,35,0.25)' : 'none',
        }}
      >
        {puedeGenerar ? '✨ Generar receta' : 'Selecciona un tipo'}
        <span>→</span>
      </button>

      <style jsx>{`
        @keyframes aparecer {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
