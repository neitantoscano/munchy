'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PortadaMunchy() {
  const router = useRouter()

  useEffect(() => {
    // Por ahora siempre manda a bienvenida (mock)
    // Más adelante el Chat 1 nos dirá cómo saber si el usuario ya pasó el onboarding
    router.replace('/bienvenida')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-crema">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-olivo mb-2">Munchy</h1>
        <p className="text-olivoOscuro text-sm opacity-60">Cargando...</p>
      </div>
    </main>
  )
}
