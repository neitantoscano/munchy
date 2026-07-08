import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    // 1. Verificar sesión
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'No hay sesión activa. Vuelve a entrar.' },
        { status: 401 }
      )
    }

    // 2. Leer el body (formData del Brick + correo)
    let body
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    // ─── LOG TEMPORAL: ver qué manda el frontend (quitar después) ───
    console.log('BODY_RECIBIDO:', JSON.stringify(body))

    const correo = body?.correo
    // El token de la tarjeta viene dentro del formData del Card Payment Brick como "token"
    const cardToken = body?.token

    // 3. Validaciones
    if (!correo || typeof correo !== 'string' || !correo.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'correo_invalido', mensaje: 'Necesitamos un correo válido.' },
        { status: 400 }
      )
    }

    if (!cardToken || typeof cardToken !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'token_faltante', mensaje: 'No llegó el token de la tarjeta.' },
        { status: 400 }
      )
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta configurar el pago.' },
        { status: 500 }
      )
    }

    // 4. Fechas ISO para auto_recurring (start_date debe ir junto con end_date)
    //    start_date: unos minutos en el futuro para no quedar en el pasado
    const inicio = new Date(Date.now() + 5 * 60 * 1000) // +5 minutos
    const fin = new Date()
    fin.setFullYear(fin.getFullYear() + 1) // +1 año

    // 5. Armar la suscripción (modelo authorized)
    const uuid = crypto.randomUUID()

    const payload = {
      reason: 'Munchy Pro',
      external_reference: user.id,
      payer_email: correo,
      card_token_id: cardToken,
      status: 'authorized',
      back_url: 'https://munchy-xi.vercel.app',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 80,
        currency_id: 'MXN',
        start_date: inicio.toISOString(),
        end_date: fin.toISOString(),
      },
    }

    const mpResp = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': uuid,
      },
      body: JSON.stringify(payload),
    })

    const requestId = mpResp.headers.get('x-request-id')
    let mpBody
    try {
      mpBody = await mpResp.json()
    } catch {
      mpBody = null
    }

    // 6. Si MP no aceptó, devolver diagnóstico (incluye x-request-id para soporte)
    if (mpResp.status !== 200 && mpResp.status !== 201) {
      // ─── LOG TEMPORAL: ver el motivo real de MP (quitar después) ───
      console.log('MP_RECHAZO:', 'http_status=' + mpResp.status, 'x_request_id=' + requestId, 'respuesta_mp=' + JSON.stringify(mpBody))

      return NextResponse.json(
        {
          ok: false,
          error: 'mp_rechazo',
          mensaje: 'Mercado Pago no aceptó la suscripción.',
          http_status: mpResp.status,
          x_request_id: requestId,
          respuesta_mp: mpBody,
        },
        { status: 502 }
      )
    }

    // 7. Éxito. El webhook escribirá es_premium y mp_suscripcion_id.
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Error en crear-suscripcion:', err)
    return NextResponse.json(
      { ok: false, error: 'error_servidor', mensaje: 'Algo salió mal.' },
      { status: 500 }
    )
  }
}
