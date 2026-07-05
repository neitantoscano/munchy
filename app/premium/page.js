'use client'

import { useRouter } from 'next/navigation'

export default function PantallaPremium() {
  const router = useRouter()

  const beneficios = [
    { icono: '♾️', titulo: 'Recetas ilimitadas', sub: 'Genera todas las que quieras, sin límite diario' },
    { icono: '⚡', titulo: 'Generación prioritaria', sub: 'Tus recetas se crean más rápido' },
    { icono: '✨', titulo: 'Ingredientes Pro siempre', sub: 'Sugerencias gourmet en cada receta' },
    { icono: '🚫', titulo: 'Sin anuncios', sub: 'Experiencia limpia, enfocada en cocinar' },
  ]

  return (
    <main className="min-h-screen pb-28"
          style={{ background: 'linear-gradient(180deg, #fff3d6 0%, #faf9f5 35%)' }}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-olivo">Premium</span>
        <div className="w-10" />
      </div>

      <div className="px-5">
        <div className="flex flex-col items-center text-center pt-4 pb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4"
               style={{ background: 'linear-gradient(135deg, #c47c1a, #8f4c35)', boxShadow: '0 12px 32px rgba(196,124,26,0.3)' }}>
            👑
          </div>
          <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">
            Munchy Premium
          </h1>
          <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed max-w-xs">
            Lleva tu alimentación al siguiente nivel sin límites.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 border border-ambar/20"
             style={{ boxShadow: '0 8px 24px rgba(196,124,26,0.08)' }}>
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

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-5 pt-3 z-40"
           style={{ background: 'linear-gradient(to top, rgba(250,249,245,1) 70%, rgba(250,249,245,0))' }}>
        <button
          onClick={() => router.push('/premium/pago')}
          className="w-full h-14 rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 text-white active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #c47c1a, #8f4c35)',
            boxShadow: '0 8px 24px rgba(196,124,26,0.3)',
          }}
        >
          👑 Hacerme Premium
        </button>
        <p className="text-center text-xs text-olivoOscuro opacity-50 mt-2">
          Pago seguro procesado por Mercado Pago
        </p>
      </div>
    </main>
  )
}
