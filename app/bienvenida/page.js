'use client'

import { useRouter } from 'next/navigation'

export default function PantallaBienvenida() {
  const router = useRouter()

  const burbujas = [
    { left: '8%',  size: 22, dur: 15, delay: 0,  color: '#4ade80' },
    { left: '25%', size: 14, dur: 19, delay: 4,  color: '#a855f7' },
    { left: '42%', size: 28, dur: 13, delay: 8,  color: '#fb923c' },
    { left: '58%', size: 16, dur: 21, delay: 2,  color: '#4ade80' },
    { left: '74%', size: 24, dur: 17, delay: 11, color: '#a855f7' },
    { left: '90%', size: 13, dur: 14, delay: 6,  color: '#fb923c' },
  ]

  return (
    <main className="relative min-h-screen bg-black flex flex-col px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full"
             style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.35 }} />
        <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full"
             style={{ background: '#a855f7', filter: 'blur(110px)', opacity: 0.4 }} />
        <div className="absolute bottom-1/4 -left-16 w-64 h-64 rounded-full"
             style={{ background: '#fb923c', filter: 'blur(100px)', opacity: 0.3 }} />
        {burbujas.map((b, i) => (
          <span key={i} className="burbuja" style={{
            left: b.left, width: b.size, height: b.size, background: b.color,
            filter: `blur(${Math.round(b.size / 3)}px)`,
            animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 flex justify-center pt-4 pb-2">
        <span className="font-serif text-2xl text-crema">Munchy</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">

        <div className="w-full max-w-xs h-56 mb-8 rounded-3xl overflow-hidden relative"
             style={{ background: 'linear-gradient(135deg, #3d2b1f, #2d4a2d, #4a2060)' }}>
          <div className="absolute inset-0 flex items-center justify-center text-7xl"
               style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
            🥗
          </div>
          <img
            src="/icons/bienvenida-hero.png"
            alt="Bienvenida Munchy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        <div className="inline-block bg-ambarFixed rounded-full px-4 py-1 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-ambar">
            ✨ Bienvenido a Munchy
          </span>
        </div>

        <h1 className="font-serif text-4xl text-crema leading-tight mb-3">
          Nutre tu<br />
          <em className="text-white">prime</em>
        </h1>

        <p className="text-base text-crema opacity-70 max-w-xs leading-relaxed">
          Recetas saludables hechas con lo que ya tienes en casa.
        </p>
      </div>

      <div className="relative z-10">
        <div className="borde-vivo">
          <button
            onClick={() => router.push('/registro')}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            Empezar
            <span>→</span>
          </button>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full text-sm text-crema opacity-70 underline py-4 mt-2"
        >
          Ya tengo cuenta, iniciar sesión
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
