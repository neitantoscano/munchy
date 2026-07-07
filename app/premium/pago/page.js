'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { initMercadoPago } from '@mercadopago/sdk-react'

// Carga el Brick SOLO en el navegador (nunca en el servidor)
const CardPayment = dynamic(
  () => import('@mercadopago/sdk-react').then((mod) => mod.CardPayment),
  { ssr: false }
)

export default function PantallaPago() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [correoConfirmado, setCorreoConfirmado] = useState(false)
  const [sdkListo, setSdkListo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [mensajeError, setMensajeError] = useState('')

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (key) {
      initMercadoPago(key)
      setSdkListo(true)
    }
  }, [])

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())

  const onSubmit = (param) => {
    console.log('=== DEBUG MP BRICK ===')
    console.log('param completo:', JSON.stringify(param, null, 2))
    console.log('======================')

    return new Promise((resolve, reject) => {
      fetch('/api/pago/crear-suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...param, correo: correo.trim() }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setResultado('exito')
            resolve()
          } else {
            setMensajeError(data.mensaje || 'No se pudo procesar el pago.')
            setResultado('error')
            reject()
          }
        })
        .catch(() => {
          setMensajeError('Sin conexión. Intenta de nuevo.')
          setResultado('error')
          reject()
        })
    })
  }

  const onError = (error) => {
    console.log('Error MP Brick:', error)
  }

  if (resultado === 'exito') {
    return (
      <main className="min-h-screen bg-crema flex flex-col items-center justify-center px-5 py-8 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4"
             style={{ background: 'linear-gradient(135deg, #c47c1a, #8f4c35)' }}>
          👑
        </div>
        <h1 className="font-serif text-3xl text-olivoOscuro mb-2">¡Ya eres Premium!</h1>
        <p className="text-sm text-olivoOscuro opacity-70 max-w-xs mb-8">
          Disfruta recetas ilimitadas. Gracias por apoyar a Munchy.
        </p>
        <button
          onClick={() => router.push('/casa')}
          className="w-full max-w-xs h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide active:scale-95 transition-all"
          style={{ boxShadow: '0 8px 24px rgba(46,58,35,0.25)' }}
        >
          Volver a casa →
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-crema pb-10">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-olivo">Pago</span>
        <div className="w-10" />
      </div>

      <div className="px-5">
        <div className="pt-4 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
               style={{ background: 'linear-gradient(135deg, #c47c1a, #8f4c35)' }}>
            👑
          </div>
          <h1 className="font-serif text-2xl text-olivoOscuro mb-1">Munchy Premium</h1>
          <p className="text-sm text-olivoOscuro opacity-70">$80 MXN / mes · Cancela cuando quieras</p>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 border border-olivoClaro/30"
             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <label className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-2 block">
            Tu correo
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setCorreoConfirmado(false) }}
            placeholder="correo@ejemplo.com"
            className="w-full px-4 py-3 rounded-xl border border-olivoClaro/50 bg-cremaSuave text-olivoOscuro text-sm focus:outline-none focus:border-olivo transition-colors"
          />
          <p className="text-xs text-olivoOscuro opacity-50 mt-2">
            Lo usamos para tu recibo y confirmación de pago.
          </p>

          {!correoConfirmado && (
            <button
              onClick={() => setCorreoConfirmado(true)}
              disabled={!correoValido}
              className="w-full h-11 mt-3 bg-olivo text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
              style={{ opacity: correoValido ? 1 : 0.5 }}
            >
              Continuar al pago
            </button>
          )}
        </div>

        {correoConfirmado && (
          <div className="bg-white rounded-2xl p-4 border border-olivoClaro/30"
               style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <label className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-3 block">
              Datos de tu tarjeta
            </label>

            {resultado === 'error' && (
              <p className="text-xs text-salmon font-medium mb-3">{mensajeError}</p>
            )}

            {sdkListo ? (
              <CardPayment
                initialization={{ amount: 80 }}
                onSubmit={onSubmit}
                onError={onError}
              />
            ) : (
              <p className="text-xs text-salmon font-medium">
                Cargando sistema de pago...
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
