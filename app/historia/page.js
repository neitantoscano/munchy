'use client'

import { useRouter } from 'next/navigation'

export default function PantallaHistoria() {
  const router = useRouter()

  const burbujas = [
    { left: '8%',  size: 22, dur: 15, delay: 0,  color: '#4ade80' },
    { left: '22%', size: 14, dur: 19, delay: 4,  color: '#a855f7' },
    { left: '36%', size: 28, dur: 13, delay: 8,  color: '#fb923c' },
    { left: '50%', size: 16, dur: 21, delay: 2,  color: '#4ade80' },
    { left: '64%', size: 24, dur: 17, delay: 11, color: '#a855f7' },
    { left: '78%', size: 13, dur: 14, delay: 6,  color: '#fb923c' },
    { left: '90%', size: 20, dur: 20, delay: 3,  color: '#4ade80' },
  ]

  const bloques = [
    {
      titulo: '¿Quién la creó?',
      texto: 'Munchy fue creada por un estudiante mexicano de informática de 16 años, del municipio de Ometepec, Guerrero.',
    },
    {
      titulo: '¿Por qué existe?',
      texto: 'Empezó por curiosidad, haciendo una web para una tienda. En el camino descubrí que resolvía algo real: qué cocinar con lo que ya tienes en casa. Porque comer saludable no es comer pura ensalada de verdura: es combinar alimentos que además sepan ricos, sin llenarte de procesados. Así nació Munchy, buscando los mejores ingredientes a un precio de suscripción accesible.',
    },
    {
      titulo: 'Lo que viene',
      texto: 'Una app para emprendedores latinos que los conecte con proveedores de confianza, para crear marcas o comprar a mayoreo con buena calidad y precio, sin estafas ni presión de compra.',
    },
    {
      titulo: 'Ayúdame a que crezca 🚀',
      texto: 'Munchy va en el nivel 1 de 4 y sigue en aprobación del público. Con tu apoyo llegan más colaboraciones y más dinámicas chidas dentro de la app.',
    },
  ]

  return (
    <main className="relative min-h-screen bg-black pb-16 overflow-hidden">

      {/* 🎨 Blobs neón + burbujas (decorativos, no bloquean toques) */}
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

      <div className="relative z-20 px-5 pt-5 pb-3 flex items-center justify-between sticky top-0"
           style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-crema">Historia</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-5">
        <div className="pt-6 pb-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-olivo flex items-center justify-center text-4xl mx-auto mb-4"
               style={{ animation: 'flotar 3s ease-in-out infinite', boxShadow: '0 0 26px rgba(74,222,128,0.3)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <img src="/icons/munchie-feliz.png" alt="Munchie" width={52} height={52}
                 onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-size:40px">🤖</span>' }} />
          </div>
          <h1 className="font-serif text-4xl text-crema leading-tight mb-2">La historia de Munchy</h1>
          <p className="text-sm text-crema opacity-60">Cómo empezó todo 🌱</p>
        </div>

        <div className="space-y-4">
          {bloques.map((b, i) => (
            <div key={i} className="rounded-2xl p-5"
                 style={{
                   background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                   border: '1px solid rgba(120,140,190,0.28)',
                   boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
                 }}>
              <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">{b.titulo}</p>
              <p className="text-sm text-crema opacity-80 leading-relaxed">{b.texto}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-crema opacity-40 mt-8">
          Hecho en México 🇲🇽
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
