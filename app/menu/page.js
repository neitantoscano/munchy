'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaMenuSemana() {
  const router = useRouter()
  const [rango, setRango] = useState('semana')
  const [datos, setDatos] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarHistorial = async (nuevoRango) => {
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: lee lo que el usuario realmente cocinó
      const res = await fetch(`/api/menu/historial?rango=${nuevoRango}`, { cache: 'no-store' })
      const data = await res.json()

      if (data.ok) {
        setDatos(data)
        // Por default arranca en el día de hoy (el último del array)
        setSeleccionado(data.dias?.length ? data.dias.length - 1 : null)
      } else {
        if (data.error === 'sin_sesion') { router.push('/bienvenida'); return }
        setError(data.mensaje || 'No pudimos cargar tu menú.')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarHistorial(rango)
  }, [rango])

  // "2026-08-24" → "Lunes 24 de agosto"
  const fechaLarga = (iso) => {
    try {
      const d = new Date(iso + 'T12:00:00')
      const txt = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
      return txt.charAt(0).toUpperCase() + txt.slice(1)
    } catch (e) {
      return iso
    }
  }

  // "2026-08-24" → "L" (semana) o "24" (mes)
  const etiquetaChip = (iso) => {
    try {
      const d = new Date(iso + 'T12:00:00')
      if (rango === 'mes') return String(d.getDate())
      return d.toLocaleDateString('es-MX', { weekday: 'short' })[0].toUpperCase()
    } catch (e) {
      return '?'
    }
  }

  const dia = datos?.dias?.[seleccionado] || null
  const vacioTotal = datos?.resumen?.recetas_totales === 0

  const fondo = (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.28 }} />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.26 }} />
      <div className="absolute bottom-1/4 -left-16 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.24 }} />
      <div className="absolute top-1/2 -right-6 w-24 h-24 rounded-full" style={{ border: '1px solid rgba(156,163,175,0.28)' }} />
      <div className="absolute bottom-32 -left-8 w-32 h-32 rounded-full" style={{ border: '1.5px solid rgba(91,107,130,0.3)' }} />
    </div>
  )

  return (
    <main className="relative min-h-screen bg-black pb-16 overflow-hidden">
      {fondo}

      <div className="relative z-20 px-5 pt-5 pb-3 flex items-center justify-between sticky top-0"
           style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-crema">Mi menú</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-5">
        <div className="pt-4 pb-5">
          <h1 className="font-serif text-3xl text-crema leading-tight mb-2">Lo que cocinaste 🔥</h1>
          <p className="text-sm text-crema opacity-70 leading-relaxed">
            Solo aparecen las recetas que marcaste como cocinadas.
          </p>
        </div>

        {/* Semana / Mes */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'semana', label: 'Semana' },
            { id: 'mes', label: 'Mes' },
          ].map(r => {
            const activo = rango === r.id
            return (
              <button
                key={r.id}
                onClick={() => setRango(r.id)}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold active:scale-95 transition-all"
                style={{
                  background: activo ? 'rgba(74,222,128,0.16)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activo ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.14)'}`,
                  color: activo ? '#4ade80' : '#FAF9F5',
                  boxShadow: activo ? '0 0 18px rgba(74,222,128,0.22)' : 'none',
                  opacity: activo ? 1 : 0.65,
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>

        {error && (
          <div className="rounded-2xl p-4 mb-4 text-center"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(233,150,122,0.4)' }}>
            <p className="text-sm text-salmon font-medium mb-3">{error}</p>
            <button
              onClick={() => cargarHistorial(rango)}
              className="h-10 px-5 bg-olivo text-white rounded-xl text-sm font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full"
                     style={{ background: '#4ade80', animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
              ))}
            </div>
          </div>
        ) : !datos ? null : vacioTotal ? (
          /* Nada cocinado en todo el rango */
          <div className="rounded-2xl p-8 text-center relative overflow-hidden"
               style={{
                 background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                 border: '2px dashed rgba(120,140,190,0.4)',
               }}>
            <p className="text-4xl mb-3">🍳</p>
            <p className="font-serif text-lg text-crema mb-2">
              Aún no cocinas nada {rango === 'semana' ? 'esta semana' : 'este mes'}
            </p>
            <p className="text-sm text-crema opacity-60 mb-5 leading-relaxed">
              Genera una receta y marca "Ya cociné esto" para verla aquí.
            </p>
            <button
              onClick={() => router.push('/generar')}
              className="h-12 px-6 rounded-2xl text-sm font-semibold text-white active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #3d7a3d, #4ade80)',
                boxShadow: '0 0 22px rgba(74,222,128,0.35)',
              }}
            >
              ¡Empieza hoy! 🔥
            </button>
          </div>
        ) : (
          <>
            {/* Resumen del rango */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Calorías', valor: datos.resumen.calorias_totales },
                { label: 'Recetas', valor: datos.resumen.recetas_totales },
                { label: 'Días', valor: datos.resumen.dias_cocinados },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-3 text-center"
                     style={{
                       background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                       border: '1px solid rgba(120,140,190,0.28)',
                     }}>
                  <p className="font-serif text-xl text-crema">{s.valor}</p>
                  <p className="text-[10px] text-crema opacity-55 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Fila de días */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5" style={{ scrollbarWidth: 'none' }}>
              {datos.dias.map((d, i) => {
                const activo = i === seleccionado
                const tieneComida = d.recetas.length > 0
                return (
                  <button
                    key={d.fecha}
                    onClick={() => setSeleccionado(i)}
                    className="flex flex-col items-center justify-center flex-shrink-0 rounded-2xl active:scale-95 transition-all"
                    style={{
                      width: '52px',
                      height: '62px',
                      background: activo
                        ? 'rgba(74,222,128,0.18)'
                        : tieneComida ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${activo ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: activo ? '0 0 16px rgba(74,222,128,0.3)' : 'none',
                      opacity: tieneComida || activo ? 1 : 0.4,
                    }}
                  >
                    <span className="text-sm font-bold"
                          style={{ color: activo ? '#4ade80' : '#FAF9F5' }}>
                      {etiquetaChip(d.fecha)}
                    </span>
                    {tieneComida ? (
                      <span className="text-[10px] mt-0.5"
                            style={{ color: activo ? '#4ade80' : '#FAF9F5', opacity: activo ? 0.9 : 0.55 }}>
                        {d.calorias_totales}
                      </span>
                    ) : (
                      <span className="text-[10px] mt-0.5 text-crema opacity-30">—</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Detalle del día */}
            {dia && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-3">
                  {fechaLarga(dia.fecha)}
                </p>

                {dia.recetas.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center"
                       style={{
                         background: 'rgba(255,255,255,0.04)',
                         border: '1px dashed rgba(255,255,255,0.16)',
                       }}>
                    <p className="text-3xl mb-2">🍽️</p>
                    <p className="text-sm text-crema opacity-60">No cocinaste nada este día</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 mb-4">
                      {dia.recetas.map(r => (
                        <button
                          key={r.id}
                          onClick={() => router.push(`/receta/${r.id}`)}
                          className="flex items-center gap-3 p-4 rounded-2xl text-left active:scale-98 transition-transform"
                          style={{
                            background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                            border: '1px solid rgba(120,140,190,0.28)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                          }}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                               style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}>
                            {r.emoji || '🍽️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-crema leading-snug mb-1">{r.titulo}</p>
                            <p className="text-xs text-crema opacity-55">
                              🔥 {r.calorias} kcal · 💪 {r.proteina_g}g
                            </p>
                          </div>
                          <span className="text-crema opacity-40 text-lg flex-shrink-0">→</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-around rounded-2xl p-4"
                         style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.28)' }}>
                      <div className="text-center">
                        <p className="font-serif text-2xl" style={{ color: '#4ade80' }}>{dia.calorias_totales}</p>
                        <p className="text-[10px] text-crema opacity-55 uppercase tracking-wide">Calorías</p>
                      </div>
                      <div className="text-center">
                        <p className="font-serif text-2xl" style={{ color: '#4ade80' }}>{dia.proteina_total}g</p>
                        <p className="text-[10px] text-crema opacity-55 uppercase tracking-wide">Proteína</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes pulso {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  )
}
