'use client'

import { useRouter } from 'next/navigation'

export default function PantallaPagoCancelado() {
  const router = useRouter()

  const burbujas = [
    { left: '14%', size: 20, dur: 17, delay: 0,  color: '#4ade80' },
    { left: '36%', size: 14, dur: 21, delay: 5,  color: '#a855f7' },
    { left: '58%', size: 26, dur: 15, delay: 9,  color: '#fb923c' },
    { left: '80%', size: 17, dur: 19, delay: 3,  color: '#4ade80' },
  ]

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.22 }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full" style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.24 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.2 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <div className="text-6xl mb-5">🤔</div>

        <h1 className="font-serif text-3xl text-crema leading-tight mb-3">
          No pasó nada
        </h1>
        <p className="text-sm text-crema opacity-70 max-w-xs mx-auto leading-relaxed mb-2">
          Cancelaste el pago, así que no te cobramos nada.
        </p>
        <p className="text-xs text-crema opacity-50 max-w-xs mx-auto leading-relaxed mb-8">
          Puedes seguir usando Munchy gratis, y hacerte Premium cuando quieras.
        </p>

        <div className="borde-vivo w-full max-w-xs mx-auto mb-3">
          <button
            onClick={() => router.push('/premium')}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            Intentar de nuevo
            <span>→</span>
          </button>
        </div>

        <button
          onClick={() => router.push('/casa')}
          className="text-sm text-crema opacity-70 underline py-2"
        >
          Volver a casa
        </button>
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
        .borde-vivo {
          position: relative;
          border-radius: 1rem;
          padding: 2px;
          overflow: hidden;
        }
        .borde-vivo::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 250%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          background: conic-gradient(from 0deg, transparent 0deg, transparent 250deg, #4ade80 300deg, #a855f7 340deg, transparent 360deg);
          animation: girar 3s linear infinite;
        }
        @keyframes girar {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
