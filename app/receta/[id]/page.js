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
  const [esRecord, setEsRecord] = useState(false)

  // Modal de despensa
  const [candidatos, setCandidatos] = useState([])
  const [seleccionados, setSeleccionados] = useState([])
  const [mostrandoModal, setMostrandoModal] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [errorModal, setErrorModal] = useState('')

  // Burbujas difuminadas del fondo (CSS puro, decorativas)
  const burbujas = [
    { left: '5%',  size: 22, dur: 15, delay: 0,  color: '#4ade80' },
    { left: '14%', size: 14, dur: 19, delay: 4,  color: '#a855f7' },
    { left: '24%', size: 30, dur: 13, delay: 8,  color: '#fb923c' },
    { left: '33%', size: 18, dur: 21, delay: 2,  color: '#4ade80' },
    { left: '42%', size: 12, dur: 17, delay: 11, color: '#a855f7' },
    { left: '51%', size: 26, dur: 14, delay: 6,  color: '#fb923c' },
    { left: '60%', size: 16, dur: 20, delay: 1,  color: '#4ade80' },
    { left: '69%', size: 20, dur: 16, delay: 9,  color: '#a855f7' },
    { left: '78%', size: 28, dur: 12, delay: 5,  color: '#fb923c' },
    { left: '87%', size: 13, dur: 22, delay: 13, color: '#4ade80' },
    { left: '94%', size: 24, dur: 18, delay: 3,  color: '#a855f7' },
    { left: '19%', size: 15, dur: 23, delay: 7,  color: '#fb923c' },
  ]

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

  // Paso 1: pregunta qué ingredientes de la despensa coinciden
  const handleCocine = async () => {
    if (cocinando || procesando) return
    setCocinando(true)
    setErrorModal('')

    try {
      // 🔌 BACKEND: consulta candidatos (NO borra nada)
      const res = await fetch('/api/receta/preparar-cocina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receta_id: params.id }),
      })

      const data = await res.json()

      if (data.ok) {
        const lista = data.candidatos || []

        // Sin candidatos: no molestamos al usuario, registramos directo
        if (lista.length === 0) {
          await registrarCocina([])
          return
        }

        setCandidatos(lista)
        setSeleccionados(lista.map(c => c.id)) // todos palomeados
        setMostrandoModal(true)
        setCocinando(false)
      } else {
        if (data.error === 'sesion_no_encontrada') { router.push('/bienvenida'); return }
        // Si falla la consulta, igual dejamos registrar sin tocar despensa
        await registrarCocina([])
      }
    } catch (e) {
      setCocinando(false)
      setErrorModal('Sin conexión. Revisa tu internet.')
    }
  }

  // Paso 2: registra la cocinada con lo que el usuario aprobó
  const registrarCocina = async (idsAQuitar) => {
    if (procesando) return
    setProcesando(true)
    setErrorModal('')

    try {
      // 🔌 BACKEND: sube racha + quita SOLO lo aprobado
      const res = await fetch('/api/receta/confirmar-cocina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receta_id: params.id, quitar_despensa: idsAQuitar }),
      })

      const data = await res.json()

      if (data.ok) {
        setRachaNueva(data.racha_nueva)
        setEsRecord(!!data.racha_nueva_record)
        setMostrandoModal(false)
        setConfetti(true)
      } else {
        if (data.error === 'sesion_no_encontrada') { router.push('/bienvenida'); return }
        setErrorModal(data.mensaje || 'No pudimos registrarlo. Intenta de nuevo.')
        setProcesando(false)
        setCocinando(false)
      }
    } catch (e) {
      setErrorModal('Sin conexión. Revisa tu internet.')
      setProcesando(false)
      setCocinando(false)
    }
  }

  const toggleIngrediente = (id) => {
    if (procesando) return
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const cerrarModal = () => {
    if (procesando) return
    setMostrandoModal(false)
    setCocinando(false)
    setErrorModal('')
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
        <p className="text-sm text-salmon font-medium text-center mb-4">{error}</p>
        <div className="flex gap-2">
          <button onClick={() => { setError(''); cargarReceta() }} className="h-11 px-6 bg-olivo text-white rounded-xl text-sm font-semibold">
            Reintentar
          </button>
          <button onClick={() => router.push('/casa')} className="h-11 px-6 border border-olivoClaro text-crema rounded-xl text-sm font-semibold">
            Ir a casa
          </button>
        </div>
      </main>
    )
  }

  if (!receta) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full"
                 style={{ background: '#4ade80', animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
          ))}
        </div>
        <style jsx>{`@keyframes pulso { 0%,100% { opacity:0.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.3) } }`}</style>
      </main>
    )
  }

  if (confetti) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(esRecord ? 30 : 20)].map((_, i) => (
            <span key={i} className="absolute text-2xl"
                  style={{
                    left: `${Math.random()*100}%`,
                    top: `-10%`,
                    animation: `caer ${2 + Math.random()*2}s ease-in ${Math.random()*0.5}s infinite`,
                  }}>
              {esRecord ? ['🏆','🔥','✨','🎉'][i%4] : ['🔥','✨','🎉','🥗'][i%4]}
            </span>
          ))}
        </div>

        <div className="text-7xl mb-4">{esRecord ? '🏆' : '🔥'}</div>
        <h1 className="font-serif text-3xl text-crema text-center mb-2">
          {esRecord
            ? '¡Nuevo récord!'
            : rachaNueva ? `¡${rachaNueva} días seguidos!` : '¡Receta cocinada!'}
        </h1>
        <p className="text-base text-crema opacity-70 text-center max-w-xs mb-8">
          {esRecord
            ? `${rachaNueva} días seguidos, nunca habías llegado tan lejos. 🔥`
            : 'La despensa se actualizó y tu racha sigue viva, campeón.'}
        </p>

        <button
          onClick={() => router.push('/casa')}
          className="w-full max-w-xs h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide active:scale-95 transition-all"
          style={{ boxShadow: '0 0 24px rgba(74,222,128,0.35)', border: '1px solid rgba(255,255,255,0.14)' }}
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
    <main className="relative min-h-screen bg-black pb-32 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas difuminadas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.26 }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.28 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.24 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-20 px-5 pt-5 pb-2 flex items-center justify-between sticky top-0"
           style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>

        <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: receta.estilo === 'moderna' ? '#E9967A' : '#8fd18f'
              }}>
          {receta.estilo === 'moderna' ? '✨ Moderna' : '🌿 Clásica'}
        </span>
      </div>

      <div className="relative z-10 px-5 pt-6">
        <h1 className="font-serif text-4xl text-crema leading-tight mb-3">
          {receta.titulo}
        </h1>
        <p className="text-sm text-crema opacity-70 leading-relaxed mb-5">
          {receta.descripcion}
        </p>

        <div className="flex flex-wrap gap-2 mb-7">
          {[
            `⏱️ ${receta.tiempo_minutos} min`,
            `🍽️ ${receta.porciones} porciones`,
            `🔥 ${receta.macros.calorias} kcal`,
          ].map(chip => (
            <span key={chip}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-crema"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}>
              {chip}
            </span>
          ))}
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
          <h2 className="font-serif text-xl text-crema mb-3">Ingredientes</h2>
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
                  ✨ Complementos extras
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
          <h2 className="font-serif text-xl text-crema mb-3">Instrucciones</h2>
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
           style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 70%, rgba(0,0,0,0))' }}>
        {errorModal && !mostrandoModal && (
          <p className="text-xs text-salmon font-medium text-center mb-2">{errorModal}</p>
        )}
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
            disabled={cocinando || procesando}
            className="flex-1 h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{
              boxShadow: '0 0 24px rgba(74,222,128,0.35)',
              border: '1px solid rgba(255,255,255,0.14)',
              opacity: (cocinando || procesando) ? 0.7 : 1,
            }}
          >
            {(cocinando || procesando) ? '🔥 Un momento...' : '✓ Ya cociné esto 🔥'}
          </button>
        </div>
      </div>

      {/* Modal: ¿qué gastaste? */}
      {mostrandoModal && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={cerrarModal}
          />

          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[95] px-4 pb-4"
               style={{ animation: 'subirModal 0.28s ease-out' }}>
            <div className="rounded-3xl p-5"
                 style={{
                   background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                   border: '1px solid rgba(120,140,190,0.35)',
                   boxShadow: '0 -8px 40px rgba(0,0,0,0.8)',
                 }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.2)' }} />

              <h2 className="font-serif text-2xl text-crema mb-1">¿Qué gastaste?</h2>
              <p className="text-sm text-crema opacity-60 mb-5 leading-relaxed">
                Destilda lo que te haya sobrado. Solo quitamos de tu despensa lo que dejes palomeado.
              </p>

              <div className="flex flex-col gap-2 mb-5 overflow-y-auto" style={{ maxHeight: '42vh' }}>
                {candidatos.map(c => {
                  const activo = seleccionados.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleIngrediente(c.id)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-left active:scale-98 transition-all"
                      style={{
                        background: activo ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${activo ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.12)'}`,
                      }}
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                           style={{
                             background: activo ? '#4ade80' : 'transparent',
                             border: `2px solid ${activo ? '#4ade80' : 'rgba(255,255,255,0.3)'}`,
                           }}>
                        {activo && <span className="text-black text-xs font-bold">✓</span>}
                      </div>
                      <span className="flex-1 text-sm font-medium"
                            style={{ color: '#FAF9F5', opacity: activo ? 1 : 0.5 }}>
                        {c.nombre}
                      </span>
                    </button>
                  )
                })}
              </div>

              {errorModal && (
                <p className="text-xs text-salmon font-medium text-center mb-3">{errorModal}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cerrarModal}
                  disabled={procesando}
                  className="h-13 px-5 rounded-2xl text-sm font-semibold text-crema active:scale-95 transition-transform"
                  style={{
                    height: '52px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    opacity: procesando ? 0.5 : 1,
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={() => registrarCocina(seleccionados)}
                  disabled={procesando}
                  className="flex-1 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    height: '52px',
                    background: 'linear-gradient(135deg, #3d7a3d, #4ade80)',
                    boxShadow: '0 0 22px rgba(74,222,128,0.35)',
                    opacity: procesando ? 0.7 : 1,
                  }}
                >
                  {procesando
                    ? 'Registrando...'
                    : `Confirmar${seleccionados.length > 0 ? ` (${seleccionados.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
        @keyframes subirModal {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to   { transform: translate(-50%, 0);    opacity: 1; }
        }
      `}</style>
    </main>
  )
}
