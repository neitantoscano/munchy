'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initMercadoPago, createCardToken } from '@mercadopago/sdk-react'

// ⚠️⚠️ TEMPORAL SOLO PARA PRUEBAS ⚠️⚠️
// En producción, usa el correo real del usuario en vez de este fijo.
const CORREO_PRUEBA = 'TESTUSER438953120584698002@testuser.com'

export default function PantallaPago() {
  const router = useRouter()
  const [sdkListo, setSdkListo] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [mensajeError, setMensajeError] = useState('')

  // Campos de la tarjeta
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [mes, setMes] = useState('')
  const [anio, setAnio] = useState('')
  const [cvv, setCvv] = useState('')
  const [tipoDoc, setTipoDoc] = useState('DNI')
  const [numDoc, setNumDoc] = useState('')

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (key) {
      initMercadoPago(key)
      setSdkListo(true)
    }
  }, [])

  const camposCompletos =
    numero.trim() && nombre.trim() && mes.trim() && anio.trim() &&
    cvv.trim() && numDoc.trim()

  const pagar = async () => {
    if (!camposCompletos || procesando) return
    setProcesando(true)
    setMensajeError('')

    try {
      // 1) Generar el card_token con MercadoPago.js core
      const cardToken = await createCardToken({
        cardNumber: numero.replace(/\s/g, ''),
        cardholderName: nombre.trim(),
        cardExpirationMonth: mes.trim(),
        cardExpirationYear: anio.trim(),
        securityCode: cvv.trim(),
        identificationType: tipoDoc,
        identificationNumber: numDoc.trim(),
      })

      console.log('=== DEBUG CARD TOKEN ===')
      console.log('cardToken completo:', JSON.stringify(cardToken, null, 2))
      console.log('========================')

      const token = cardToken?.id

      if (!token) {
        setMensajeError('No se pudo generar el token de la tarjeta. Revisa los datos.')
        setProcesando(false)
        return
      }

      // 2) Mandar el token al backend
      const res = await fetch('/api/pago/crear-suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          correo: CORREO_PRUEBA, // ⚠️ TEMPORAL: en prod usa el correo real
        }),
      })

      const data = await res.json()

      if (data.ok) {
        setResultado('exito')
      } else {
        setMensajeError(data.mensaje || 'No se pudo procesar el pago.')
        setProcesando(false)
      }
    } catch (e) {
      console.log('Error tokenización:', e)
      setMensajeError('Error al procesar la tarjeta. Revisa los datos e intenta de nuevo.')
      setProcesando(false)
    }
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-olivoClaro/50 bg-cremaSuave text-olivoOscuro text-sm focus:outline-none focus:border-olivo transition-colors"

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

        <div className="bg-white rounded-2xl p-4 border border-olivoClaro/30 space-y-3"
             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <label className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 block">
            Datos de tu tarjeta
          </label>

          <input
            type="text"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número de tarjeta"
            className={inputClass}
          />

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del titular (como aparece en la tarjeta)"
            className={inputClass}
          />

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              placeholder="Mes (MM)"
              maxLength={2}
              className={inputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="Año (YYYY)"
              maxLength={4}
              className={inputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="CVV"
              maxLength={4}
              className={inputClass}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value)}
              className={inputClass + ' max-w-[120px]'}
            >
              <option value="DNI">DNI</option>
              <option value="CURP">CURP</option>
              <option value="RFC">RFC</option>
            </select>
            <input
              type="text"
              value={numDoc}
              onChange={(e) => setNumDoc(e.target.value)}
              placeholder="Número de documento"
              className={inputClass}
            />
          </div>

          {mensajeError && (
            <p className="text-xs text-salmon font-medium">{mensajeError}</p>
          )}

          <button
            onClick={pagar}
            disabled={!camposCompletos || procesando || !sdkListo}
            className="w-full h-14 rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 text-white active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #c47c1a, #8f4c35)',
              boxShadow: '0 8px 24px rgba(196,124,26,0.3)',
              opacity: (camposCompletos && !procesando && sdkListo) ? 1 : 0.5,
            }}
          >
            {procesando ? 'Procesando...' : '👑 Pagar $80 MXN'}
          </button>

          <p className="text-center text-xs text-olivoOscuro opacity-50">
            Pago seguro procesado por Mercado Pago
          </p>
        </div>
      </div>
    </main>
  )
}
