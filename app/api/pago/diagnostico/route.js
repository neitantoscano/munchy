import { NextResponse } from 'next/server'

// Endpoint de DIAGNÓSTICO para soporte de Mercado Pago.
// Hace 2 llamadas y muestra x-request-id + hora de cada una:
//   1) GET  /v1/payment_methods  -> prueba si el token sirve para algo básico.
//   2) POST /preapproval         -> captura el x-request-id del error 500 real.
// No usa sesión ni base de datos. Es temporal: borrar al terminar el diagnóstico.
export async function GET() {
  const resultado = {
    hora_del_diagnostico: new Date().toISOString(),
    zona: 'UTC (hora universal)',
    token_configurado: !!process.env.MP_ACCESS_TOKEN,
    prueba_1_payment_methods: null,
    prueba_2_preapproval: null,
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    resultado.error = 'No hay MP_ACCESS_TOKEN configurado en Vercel.'
    return NextResponse.json(resultado)
  }

  // ─────────── PRUEBA 1: llamada simple (¿el token sirve?) ───────────
  try {
    const inicio1 = new Date().toISOString()
    const r1 = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    })

    let body1
    try {
      body1 = await r1.json()
    } catch {
      body1 = null
    }

    resultado.prueba_1_payment_methods = {
      hora_intento: inicio1,
      http_status: r1.status,
      token_funciona: r1.status === 200,
      x_request_id: r1.headers.get('x-request-id'),
      // Solo mostramos si hubo error; si funcionó no listamos todos los métodos.
      error_body: r1.status === 200 ? '(ok, token válido)' : body1,
    }
  } catch (err) {
    resultado.prueba_1_payment_methods = { error_de_red: String(err) }
  }

  // ─────────── PRUEBA 2: el /preapproval que falla (capturar folio) ───────────
  try {
    const inicio2 = new Date().toISOString()
    const uuid = crypto.randomUUID()

    const payload = {
      reason: 'Munchy Pro',
      external_reference: 'diagnostico-test',
      payer_email: 'test_user_diagnostico@testuser.com',
      status: 'pending',
      back_url: 'https://munchy-xi.vercel.app',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 80,
        currency_id: 'MXN',
      },
    }

    const r2 = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': uuid,
      },
      body: JSON.stringify(payload),
    })

    let body2
    try {
      body2 = await r2.json()
    } catch {
      body2 = null
    }

    resultado.prueba_2_preapproval = {
      hora_intento: inicio2,
      http_status: r2.status,
      x_request_id: r2.headers.get('x-request-id'),
      respuesta_mp: body2,
    }
  } catch (err) {
    resultado.prueba_2_preapproval = { error_de_red: String(err) }
  }

  return NextResponse.json(resultado)
}
