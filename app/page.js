'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PortadaMunchy() {
  const router = useRouter()

  useEffect(() => {
    const decidirRuta = async () => {
      try {
        // 🔌 BACKEND: pregunta qué datos ya tiene el usuario
        const res = await fetch('/api/usuario/estado', { cache: 'no-store' })
        const data = await res.json()

        if (!data.tiene_sesion) { router.replace('/bienvenida'); return }
        if (!data.tiene_oficio) { router.replace('/oficio'); return }
        if (!data.tiene_nivel_ejercicio) { router.replace('/ejercicio'); return }
        if (!data.tiene_apodo) { router.replace('/apodo'); return }

        router.replace('/casa')
      } catch (e) {
        router.replace('/bienvenida')
      }
    }

    decidirRuta()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-crema mb-3">Munchy</h1>
        <div className="flex gap-2 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full"
                 style={{ background: '#4ade80', animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
          ))}
        </div>
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
