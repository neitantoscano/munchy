'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaGenerar() {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState(null)
  const [textoLibre, setTextoLibre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensajeIdx, setMensajeIdx] = useState(0)
  const [error, setError] = useState('')

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

  // Burbujas difuminadas tipo glow (CSS puro, decorativas)
  const burbujas = [
    { left: '5%',  size: 22, dur: 15, delay: 0,  color: '#4ade80' },
    { left: '12%', size: 14, dur: 19, delay: 4,  color: '#a855f7' },
    { left: '20%', size: 30, dur: 13, delay: 8,  color: '#fb923c' },
    { left: '27%', size: 18, dur: 21, delay: 2,  color: '#4ade80' },
    { left: '35%', size: 12, dur: 17, delay: 11, color: '#a855f7' },
    { left: '43%', size: 26, dur: 14, delay: 6,  color: '#fb923c' },
    { left: '50%', size: 16, dur: 20, delay: 1,  color: '#4ade80' },
    { left: '57%', size: 20, dur: 16, delay: 9,  color: '#a855f7' },
    { left: '64%', size: 28, dur: 12, delay: 5,  color: '#fb923c' },
    { left: '71%', size: 13, dur: 22, delay: 13, color: '#4ade80' },
    { left: '78%', size: 24, dur: 18, delay: 3,  color: '#a855f7' },
    { left: '85%', size: 15, dur: 15, delay: 7,  color: '#fb923c' },
    { left: '92%', size: 20, dur: 23, delay: 10, color: '#4ade80' },
    { left: '17%', size: 11, dur: 24, delay: 14, color: '#a855f7' },
    { left: '68%', size: 32, dur: 19, delay: 12, color: '#fb923c' },
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

  const handleGenerar = async () => {
    if (!puedeGenerar) return
    setCargando(true)
    setError('')

    const body = { tipo_comida: seleccionado }
    if (seleccionado === 'otro') {
      body.texto_libre = textoLibre.trim()
    }

    try {
      // 🔌 BACKEND: genera la receta real con IA
      const res = await fetch('/api/receta/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.ok && data.receta) {
        router.push(`/receta/${data.receta.id}`)
        return
      }

      // Manejo de errores del backend
      setCargando(false)
      switch (data.error) {
        case 'sin_ingredientes':
          router.push('/despensa')
          break
        case 'limite_diario':
          router.push('/premium')
          break
        case 'sesion_no_encontrada':
        case 'sin_sesion':
          router.push('/bienvenida')
          break
        case 'alergia_detectada':
          setError(data.mensaje || 'Esa receta contiene un ingrediente al que eres alérgico. Prueba otro tipo.')
          break
        default:
          setError(data.mensaje || 'No se pudo generar la receta. Intenta de nuevo.')
      }
    } catch (e) {
      setCargando(false)
      setError('Sin conexión. Revisa tu internet.')
    }
  }

  if (cargando) {
    return (
      <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8 overflow-hidden">

        {/* 🎨 Blobs neón + burbujas difuminadas (decorativos, no bloquean toques) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.28 }} />
          <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.3 }} />
          <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.25 }} />
          {burbujas.map((b, i) => (
            <span key={i} className="burbuja" style={{
              left: b.left, width: b.size, height: b.size, background: b.color,
              filter: `blur(${Math.round(b.size / 3)}px)`,
              animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
            }} />
          ))}
        </div>

        <div className="relative z-10 w-24 h-24 rounded-3xl bg-olivo flex items-center justify-center mb-6"
             style={{ animation: 'flotar 2.5s ease-in-out infinite', boxShadow: '0 0 26px rgba(74,222,128,0.35)', border: '1px solid rgba(255,255,255,0.12)' }}>
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
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-salmon flex items-center justify-center text-sm border-2 border-black">
            ✨
          </div>
        </div>

        <h1 className="relative z-10 font-serif text-2xl text-crema text-center mb-3 leading-tight">
          Creando tu receta...
        </h1>

        <p className="relative z-10 text-sm text-crema opacity-70 text-center max-w-xs leading-relaxed min-h-[40px]"
           style={{ animation: 'fadeIn 0.5s' }}
           key={mensajeIdx}>
          {mensajesLoading[mensajeIdx]}
        </p>

        <div className="relative z-10 flex gap-2 mt-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#4ade80',
                animation: 'pulso 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        <style jsx>{`
          .burbuja {
            position: absolute;
            bottom: -40px;
            border-radius: 9999px;
            opacity: 0;
            animation-name: subir;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          @keyframes subir {
            0%   { transform: translateY(0);       opacity: 0; }
            15%  { opacity: 0.55; }
            80%  { opacity: 0.3; }
            100% { transform: translateY(-110vh);  opacity: 0; }
          }
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

  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-6 pb-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas difuminadas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.28 }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.3 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.25 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-lg text-crema">Munchy</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">
          Generar receta
        </p>
        <h1 className="font-serif text-3xl text-crema leading-tight mb-2">
          ¿Qué se te antoja?
        </h1>
        <p className="text-sm text-crema opacity-70 leading-relaxed">
          Munchie te creará algo único basado en tu despensa y perfil.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 mb-5">
        {tipos.map(t => {
          const activo = seleccionado === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSeleccionado(t.id)}
              className="flex flex-col items-start p-4 rounded-2xl text-left transition-all active:scale-98 relative"
              style={{
                background: activo
                  ? t.color
                  : 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                border: `${activo ? 2 : 1}px solid ${activo ? t.borde : 'rgba(120,140,190,0.28)'}`,
                boxShadow: activo ? `0 4px 16px ${t.borde}25` : '0 4px 18px rgba(0,0,0,0.5)',
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

              <p className="font-semibold text-sm mb-0.5" style={{ color: activo ? '#19240f' : '#FAF9F5' }}>{t.label}</p>
              <p className="text-xs leading-snug" style={{ color: activo ? '#19240f' : '#FAF9F5', opacity: 0.6 }}>{t.sub}</p>

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
          className="relative z-10 rounded-2xl p-4 mb-5"
          style={{
            background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
            border: '1px solid rgba(120,140,190,0.28)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
            animation: 'aparecer 0.3s ease-out'
          }}
        >
          <label className="text-xs font-bold uppercase tracking-wider text-salmon mb-2 block">
            Cuéntame qué quieres
          </label>
          <textarea
            value={textoLibre}
            onChange={(e) => {
              if (e.target.value.length <= 200) setTextoLibre(e.target.value)
            }}
            placeholder="Ej: algo con plátano y avena, no muy dulce..."
            rows={3}
            className="w-full p-3 rounded-xl bg-white text-olivoOscuro text-sm resize-none focus:outline-none transition-colors"
            style={{ border: '1px solid rgba(120,140,190,0.35)' }}
          />
          <div className="flex justify-end mt-2">
            <span
              className="text-xs font-medium"
              style={{ color: textoLibre.length > 180 ? '#E9967A' : 'rgba(250,249,245,0.6)' }}
            >
              {textoLibre.length}/200
            </span>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {error && (
        <p className="relative z-10 text-xs text-salmon font-medium text-center mb-2">{error}</p>
      )}

      <button
        onClick={handleGenerar}
        disabled={!puedeGenerar}
        className="relative z-10 w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{
          opacity: puedeGenerar ? 1 : 0.5,
          boxShadow: puedeGenerar ? '0 0 24px rgba(74,222,128,0.35)' : 'none',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        {puedeGenerar ? '✨ Generar receta' : 'Selecciona un tipo'}
        <span>→</span>
      </button>

      <style jsx>{`
        .burbuja {
          position: absolute;
          bottom: -40px;
          border-radius: 9999px;
          opacity: 0;
          animation-name: subir;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes subir {
          0%   { transform: translateY(0);      opacity: 0; }
          15%  { opacity: 0.55; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes aparecer {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
