'use client'

import { useState, useEffect } from 'react'

// Frases de celebración, una por hito. Cámbialas cuando quieras.
const FRASES = {
  5:   { titulo: '¡5 días de racha!',   frase: 'Ya agarraste el ritmo. Lo difícil era empezar y eso ya lo hiciste.' },
  15:  { titulo: '¡15 días seguidos!',  frase: 'Dos semanas cocinando lo tuyo. Esto ya no fue suerte.' },
  35:  { titulo: '¡35 días!',           frase: 'Un mes y cacho. Ya no te estás esforzando: ya es tu costumbre.' },
  75:  { titulo: '¡75 días!',           frase: 'Setenta y cinco días. Poca gente llega hasta aquí, y tú vas de paso.' },
  100: { titulo: '¡100 DÍAS!',          frase: 'Cien días cocinando lo que te hace bien. Esto ya no es una racha, es quien eres.' },
}

export default function CelebracionHito({ hito, onCerrar }) {
  const [datos, setDatos] = useState(null)

  const info = FRASES[hito] || { titulo: `¡${hito} días!`, frase: 'Vas increíble. Sigue así.' }

  useEffect(() => {
    // Vibración de celebración (Android; iPhone no la soporta)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100, 50, 200]) } catch (e) {}
    }

    // 🔌 BACKEND: trae los totales reales del usuario.
    // Si falla, igual celebramos con el número de racha.
    const cargar = async () => {
      try {
        const res = await fetch('/api/usuario/logro', { cache: 'no-store' })
        const data = await res.json()
        if (data.ok) setDatos(data)
      } catch (e) {
        // silencioso: la celebración sigue
      }
    }
    cargar()
  }, [hito])

  // Regadero de emojis
  const emojis = ['🔥','✨','🎉','🥗','⭐','💚','🏆','🌟']
  const lluvia = Array.from({ length: 34 }, (_, i) => ({
    left: `${(i * 7.3) % 100}%`,
    emoji: emojis[i % emojis.length],
    dur: 2.4 + (i % 5) * 0.7,
    delay: (i % 9) * 0.35,
    size: 18 + (i % 4) * 7,
  }))

  const totales = datos?.totales
  const ref = datos?.referencia

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5"
         style={{ background: 'rgba(0,0,0,0.94)' }}>

      {/* Blobs neón de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full"
             style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.4, animation: 'latir 3s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full"
             style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.38, animation: 'latir 3.6s ease-in-out infinite 0.5s' }} />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full"
             style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.34, animation: 'latir 4.2s ease-in-out infinite 1s' }} />
      </div>

      {/* Regadero de emojis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {lluvia.map((e, i) => (
          <span key={i} className="lluvia absolute"
                style={{
                  left: e.left,
                  fontSize: `${e.size}px`,
                  animationDuration: `${e.dur}s`,
                  animationDelay: `${e.delay}s`,
                }}>
            {e.emoji}
          </span>
        ))}
      </div>

      {/* Tarjeta */}
      <div className="relative z-10 w-full max-w-sm marco-fiesta" style={{ animation: 'entrar 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="rounded-3xl px-6 py-7 text-center"
             style={{ background: 'linear-gradient(165deg, #1c2233 0%, #12151f 60%, #0a0b10 100%)' }}>

          <div className="text-6xl mb-3" style={{ animation: 'brincar 1.6s ease-in-out infinite' }}>🔥</div>

          <h1 className="font-serif text-3xl leading-tight mb-2"
              style={{ color: '#4ade80', textShadow: '0 0 22px rgba(74,222,128,0.55)' }}>
            {info.titulo}
          </h1>

          <p className="text-sm text-crema opacity-80 leading-relaxed mb-5">
            {info.frase}
          </p>

          {/* Lo que lleva el usuario (datos reales) */}
          {totales && (
            <div className="flex justify-around rounded-2xl py-3 px-2 mb-4"
                 style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.3)' }}>
              <div>
                <p className="font-serif text-2xl" style={{ color: '#4ade80' }}>{totales.recetas_cocinadas}</p>
                <p className="text-[10px] text-crema opacity-55 uppercase tracking-wide">Recetas</p>
              </div>
              <div>
                <p className="font-serif text-2xl" style={{ color: '#4ade80' }}>{totales.proteina_g}g</p>
                <p className="text-[10px] text-crema opacity-55 uppercase tracking-wide">Proteína</p>
              </div>
            </div>
          )}

          {/* Contexto general (NO son datos del usuario) */}
          {ref && (
            <div className="rounded-2xl p-3 mb-4 text-left"
                 style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="text-xs text-crema opacity-75 leading-relaxed">
                Una semana basada en comida rápida suele rondar{' '}
                <span className="font-semibold">{ref.sin_munchy.azucar_anadido_g[0]}–{ref.sin_munchy.azucar_anadido_g[1]} g</span>{' '}
                de azúcar añadido. Con recetas equilibradas, más cerca de{' '}
                <span className="font-semibold" style={{ color: '#4ade80' }}>
                  {ref.con_munchy.azucar_anadido_g[0]}–{ref.con_munchy.azucar_anadido_g[1]} g
                </span>.
              </p>
            </div>
          )}

          <button
            onClick={onCerrar}
            className="w-full h-14 rounded-2xl font-bold text-sm tracking-wide text-white active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #3d7a3d, #4ade80)',
              boxShadow: '0 0 26px rgba(74,222,128,0.45)',
            }}
          >
            ¡Seguimos! 🔥
          </button>

          {ref?.descargo && (
            <p className="text-[9px] text-crema opacity-35 leading-relaxed mt-3">
              {ref.descargo}
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .lluvia {
          top: -10%;
          animation-name: caerEmoji;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @keyframes caerEmoji {
          0%   { transform: translateY(0) rotate(0deg);        opacity: 1; }
          100% { transform: translateY(115vh) rotate(720deg);  opacity: 0.2; }
        }
        @keyframes entrar {
          from { transform: scale(0.8) translateY(30px); opacity: 0; }
          to   { transform: scale(1) translateY(0);     opacity: 1; }
        }
        @keyframes brincar {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-10px) scale(1.08); }
        }
        @keyframes latir {
          0%, 100% { transform: scale(1);   opacity: 0.34; }
          50%      { transform: scale(1.2); opacity: 0.5; }
        }
        .marco-fiesta {
          position: relative;
          border-radius: 26px;
          padding: 2.5px;
          overflow: hidden;
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 50px rgba(74,222,128,0.28);
        }
        .marco-fiesta::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 220%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          background: conic-gradient(
            from 0deg,
            #4ade80 0deg,
            #22d3ee 90deg,
            #a855f7 180deg,
            #fb923c 270deg,
            #4ade80 360deg
          );
          animation: girarFiesta 3s linear infinite;
        }
        @keyframes girarFiesta {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
