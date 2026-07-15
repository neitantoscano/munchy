'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaPerfil() {
  const router = useRouter()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(false)
  const [nuevoApodo, setNuevoApodo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const oficios = {
    estudiante: '🎓 Estudiante',
    trabajo8h: '🕐 Trabajo 8 horas',
    atleta: '🏋️ Atleta',
    profesional: '💼 Profesional',
    cocinero: '🍳 Cocinero en casa',
    libre: '🌿 Horario libre',
  }

  const ejercicios = {
    nada: '🛋️ Cero ejercicio',
    ocasional: '🚶 A veces',
    frecuente: '🏃 Frecuente',
    gymrat: '💪 Gym Rat',
  }

  const alergiasLabels = {
    lactosa: '🥛 Lactosa',
    gluten: '🌾 Gluten',
    nueces: '🥜 Nueces',
    mariscos: '🦐 Mariscos',
    otro: '➕ Otro',
  }

  const cargarPerfil = async () => {
    try {
      // 🔌 BACKEND: lee el perfil real del usuario
      const res = await fetch('/api/usuario/perfil', { cache: 'no-store' })
      const data = await res.json()

      if (data.ok) {
        const p = data.perfil || data
        setDatos({
          apodo: p.apodo || 'Sin nombre',
          oficio: p.oficio || null,
          nivel_ejercicio: p.nivel_ejercicio || null,
          alergias: p.alergias || [],
          es_premium: !!p.es_premium,
          racha_dias: p.racha_dias ?? 0,
          racha_record: p.racha_record ?? 0,
          recetas_generadas_total: p.recetas_generadas_total ?? 0,
          miembro_desde: p.miembro_desde || null,
        })
      } else {
        setError('No pudimos cargar tu perfil.')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
  }

  useEffect(() => {
    cargarPerfil()
  }, [])

  const guardarApodo = async () => {
    if (!nuevoApodo.trim()) return
    setGuardando(true)

    try {
      // 🔌 BACKEND: actualiza el apodo
      const res = await fetch('/api/usuario/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apodo: nuevoApodo.trim() }),
      })

      const data = await res.json()

      if (data.ok) {
        setDatos(prev => ({ ...prev, apodo: nuevoApodo.trim() }))
        setEditando(false)
        setNuevoApodo('')
      }
    } catch (e) {
      // silencioso
    }
    setGuardando(false)
  }

  const cerrarSesion = async () => {
    try {
      // 🔌 BACKEND: cierra sesión
      await fetch('/api/auth/salir', { method: 'POST' })
    } catch (e) {
      // continúa aunque falle
    }
    router.push('/bienvenida')
  }

  const formatearFecha = (iso) => {
    if (!iso) return '—'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    } catch (e) {
      return '—'
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
        <p className="text-sm text-salmon font-medium text-center mb-4">{error}</p>
        <button onClick={cargarPerfil} className="h-11 px-6 bg-olivo text-white rounded-xl text-sm font-semibold">
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
        <style jsx>{`@keyframes pulso { 0%,100% { opacity:0.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.3) } }`}</style>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-black pb-28 overflow-hidden">

      {/* 🎨 5 figuras neutras elegantes (decorativas, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ border: '1.5px solid rgba(91,107,130,0.35)' }} />
        <div className="absolute top-24 -left-12 w-40 h-40 rounded-full" style={{ background: 'rgba(134,147,127,0.12)' }} />
        <div className="absolute top-1/2 -right-6 w-24 h-24 rounded-full" style={{ border: '1px solid rgba(156,163,175,0.30)' }} />
        <div className="absolute bottom-32 -left-8 w-32 h-32 rounded-3xl" style={{ background: 'rgba(91,107,130,0.10)', transform: 'rotate(18deg)' }} />
        <div className="absolute bottom-20 right-8 w-16 h-16 rounded-full" style={{ background: 'rgba(156,163,175,0.10)' }} />
      </div>

      <div className="relative z-20 px-5 pt-5 pb-3 flex items-center justify-between sticky top-0"
           style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-crema">Perfil</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-5">
        <div className="flex flex-col items-center pt-4 pb-6">
          <div className="w-24 h-24 rounded-full bg-olivo flex items-center justify-center text-white font-serif text-4xl mb-3 relative"
               style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {datos.apodo[0]?.toUpperCase() || '?'}
            {datos.es_premium && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-ambar flex items-center justify-center text-base border-2 border-black">
                👑
              </div>
            )}
          </div>

          {editando ? (
            <div className="w-full max-w-xs">
              <input
                type="text"
                value={nuevoApodo}
                onChange={(e) => setNuevoApodo(e.target.value)}
                placeholder={datos.apodo}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-olivo bg-white text-olivoOscuro text-center text-base font-semibold mb-2 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditando(false); setNuevoApodo('') }}
                  className="flex-1 h-10 rounded-xl border border-olivoClaro text-crema text-sm font-medium active:scale-95"
                >Cancelar</button>
                <button
                  onClick={guardarApodo}
                  disabled={guardando}
                  className="flex-1 h-10 rounded-xl bg-olivo text-white text-sm font-semibold active:scale-95"
                  style={{ opacity: guardando ? 0.7 : 1 }}
                >{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl text-crema">{datos.apodo}</h1>
              <button
                onClick={() => { setEditando(true); setNuevoApodo(datos.apodo) }}
                className="text-crema opacity-50 active:scale-90 transition-transform"
              >✏️</button>
            </div>
          )}

          <p className="text-xs text-crema opacity-50 mt-1">
            Miembro desde {formatearFecha(datos.miembro_desde)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: 'Racha', valor: `${datos.racha_dias}🔥` },
            { label: 'Récord', valor: `${datos.racha_record}🏆` },
            { label: 'Recetas', valor: datos.recetas_generadas_total },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-olivoClaro/30"
                 style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <p className="font-serif text-xl text-olivoOscuro">{s.valor}</p>
              <p className="text-[10px] text-olivoOscuro opacity-60 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {!datos.es_premium && (
          <button
            onClick={() => router.push('/premium')}
            className="w-full rounded-2xl p-4 mb-6 flex items-center gap-3 active:scale-98 transition-transform"
            style={{ background: 'linear-gradient(135deg, #c47c1a, #8f4c35)', boxShadow: '0 8px 24px rgba(196,124,26,0.25)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">👑</div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-base text-white">Hazte Premium</p>
              <p className="text-xs text-white/80">Recetas ilimitadas por $80 MXN/mes</p>
            </div>
            <span className="text-white text-xl">→</span>
          </button>
        )}

        <div className="bg-white rounded-2xl border border-olivoClaro/30 mb-6 overflow-hidden"
             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between p-4 border-b border-olivoClaro/20">
            <span className="text-sm text-olivoOscuro opacity-70">Oficio</span>
            <span className="text-sm font-semibold text-olivoOscuro">
              {datos.oficio ? (oficios[datos.oficio] || datos.oficio) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-olivoClaro/20">
            <span className="text-sm text-olivoOscuro opacity-70">Actividad física</span>
            <span className="text-sm font-semibold text-olivoOscuro">
              {datos.nivel_ejercicio ? (ejercicios[datos.nivel_ejercicio] || datos.nivel_ejercicio) : '—'}
            </span>
          </div>
          <div className="flex items-start justify-between p-4">
            <span className="text-sm text-olivoOscuro opacity-70">Alergias</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
              {datos.alergias.length > 0 ? (
                datos.alergias.map(a => (
                  <span key={a} className="text-xs px-2 py-1 rounded-full bg-salmonLight text-cafeTierra font-medium">
                    {alergiasLabels[a] || a}
                  </span>
                ))
              ) : (
                <span className="text-sm font-semibold text-olivoOscuro">Ninguna</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={cerrarSesion}
          className="w-full h-12 rounded-2xl border border-salmon/50 text-salmon text-sm font-semibold active:scale-95 transition-transform"
        >
          Cerrar sesión
        </button>
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
