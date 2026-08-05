'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaPremium() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const beneficios = [
    { icono: '♾️', titulo: 'Recetas ilimitadas', sub: 'Genera todas las que quieras, sin límite diario' },
    { icono: '⚡', titulo: 'Generación prioritaria', sub: 'Tus recetas se crean más rápido' },
    { icono: '✨', titulo: 'Ingredientes Pro siempre', sub: 'Sugerencias gourmet en cada receta' },
    { icono: '🚫', titulo: 'Sin anuncios', sub: 'Experiencia limpia, enfocada en cocinar' },
  ]

  const burbujas = [
    { left: '10%', size: 20, dur: 17, delay: 0,  color: '#c47c1a' },
    { left: '30%', size: 14, dur: 21, delay: 5,  color: '#a855f7' },
    { left: '52%', size: 26, dur: 15, delay: 9,  color: '#fb923c' },
    { left: '74%', size: 17, dur: 19, delay: 3,  color: '#4ade80' },
    { left: '90%', size: 22, dur: 16, delay: 11, color: '#c47c1a' },
  ]

  const irAStripe = async () => {
    if (cargando) return
    setCargando(true)
    setError('')

    try {
      // 🔌 BACKEND: pide la sesión de pago de Stripe
      const res = await fetch('/api/pago/crear-sesion', { method: 'POST' })
      const data = await res.json()

      if (data.ok && data.url) {
        // Nos vamos a la página de Stripe
        window.location.href = data.url
        return
      }

      if (data.error === 'sin_sesion') {
        router.push('/login')
        return
      }

      if (data.error === 'ya_premium') {
        router.push('/casa')
        return
      }

      setError(data.mensaje || 'No pudimos iniciar el pago. Intenta de nuevo.')
      setCargando(false)
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
      setCargando(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-black pb-28 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#c47c1a', filter: 'blur(100px)', opacity: 0.3 }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.26 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.24 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-20 px-5 pt-5 pb-3 flex items-center justify-between sticky top-0"
           style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-crema">Premium</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-5">
        <div className="flex flex-col items-center text-center pt-4 pb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4"
               style={{
                 background: 'linear-gradient(135deg, #c47c1a, #8f4c35)',
                 boxShadow: '0 0 30px rgba(196,124,26,0.4)',
                 border: '1px solid rgba(255,255,255,0.14)',
                 animation: 'flotar 3s ease-in-out infinite'
               }}>
            👑
          </div>
          <h1 className="font-serif text-4xl text-crema leading-tight mb-2">
            Munchy Premium
          </h1>
          <p className="text-sm text-crema opacity-70 leading-relaxed max-w-xs">
            Lleva tu alimentación al siguiente nivel sin límites.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 border border-ambar/20"
             style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {beneficios.map((b, i) => (
            <div key={i}
                 className={`flex items-start gap-3 py-3 ${i < beneficios.length-1 ? 'border-b border-olivoClaro/20' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-ambarLight flex items-center justify-center text-xl flex-shrink-0">
                {b.icono}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-olivoOscuro mb-0.5">{b.titulo}</p>
                <p className="text-xs text-olivoOscuro opacity-60 leading-relaxed">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 border-2 border-ambar/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-ambar text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            Más popular
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-2">
            Plan mensual
          </p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-serif text-4xl text-olivoOscuro">$80</span>
            <span className="text-sm text-olivoOscuro opacity-60">MXN / mes</span>
          </div>
          <p className="text-xs text-olivoOscuro opacity-60">
            Cancela cuando quieras. Sin compromisos.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-5 pt-3 z-50"
           style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 70%, rgba(0,0,0,0))' }}>

        {error && (
          <p className="text-xs text-salmon font-medium text-center mb-2">{error}</p>
        )}

        <button
          onClick={irAStripe}
          disabled={cargando}
          className="w-full h-14 rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 text-white active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #c47c1a, #8f4c35)',
            boxShadow: '0 0 26px rgba(196,124,26,0.4)',
            border: '1px solid rgba(255,255,255,0.14)',
            opacity: cargando ? 0.7 : 1,
          }}
        >
          {cargando ? 'Llevándote al pago...' : '👑 Hacerme Premium'}
        </button>
        <p className="text-center text-xs text-crema opacity-50 mt-2">
          Pago seguro procesado por Stripe
        </p>
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
          0%   { transform: translateY(0);      opacity: 0; }
          15%  { opacity: 0.55; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes flotar {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
      `}</style>
    </main>
  )
}
