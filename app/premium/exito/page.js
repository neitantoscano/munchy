'use client'

import { useRouter } from 'next/navigation'

export default function PantallaPagoExitoso() {
  const router = useRouter()

  const burbujas = [
    { left: '10%', size: 22, dur: 16, delay: 0,  color: '#4ade80' },
    { left: '30%', size: 14, dur: 20, delay: 5,  color: '#a855f7' },
    { left: '50%', size: 28, dur: 14, delay: 9,  color: '#fb923c' },
    { left: '70%', size: 17, dur: 22, delay: 3,  color: '#4ade80' },
    { left: '88%', size: 22, dur: 18, delay: 11, color: '#a855f7' },
  ]

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#4ade80', filter: 'blur(100px)', opacity: 0.3 }} />
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

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="absolute text-2xl"
                style={{
                  left: `${(i * 5.5) % 100}%`,
                  top: '-10%',
                  animation: `caer ${2.5 + (i % 4) * 0.6}s ease-in ${(i % 5) * 0.3}s infinite`,
                }}>
            {['👑','✨','🎉','🔥'][i % 4]}
          </span>
        ))}
      </div>

      <div className="relative z-10 text-center">
        <div className="w-24 h-24 rounded-3xl bg-olivo flex items-center justify-center text-5xl mx-auto mb-6"
             style={{ animation: 'flotar 3s ease-in-out infinite', boxShadow: '0 0 30px rgba(74,222,128,0.35)', border: '1px solid rgba(255,255,255,0.14)' }}>
          👑
        </div>

        <h1 className="font-serif text-4xl text-crema leading-tight mb-3">
          ¡Ya eres Premium!
        </h1>
        <p className="text-sm text-crema opacity-70 max-w-xs mx-auto leading-relaxed mb-2">
          Ahora tienes hasta 20 recetas al día. Cocina sin frenos. 🔥
        </p>
        <p className="text-xs text-crema opacity-50 max-w-xs mx-auto leading-relaxed mb-8">
          Si aún no ves el cambio, dale unos segundos y recarga.
        </p>

        <div className="borde-vivo w-full max-w-xs mx-auto">
          <button
            onClick={() => router.push('/casa')}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10"
          >
            Entrar a Munchy
            <span>→</span>
          </button>
        </div>
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
        @keyframes caer {
          0%   { transform: translateY(0) rotate(0deg);       opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
        }
        @keyframes flotar {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
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
