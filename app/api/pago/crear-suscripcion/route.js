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

    // 2. Recibir el correo del frontend
    let body
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    const correo = body?.correo

    if (!correo || typeof correo !== 'string' || !correo.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'correo_invalido', mensaje: 'Necesitamos un correo válido.' },
        { status: 400 }
      )
    }

    // 3. Verificar token
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta configurar el pago.' },
        { status: 500 }
      )
    }

    // Fechas ISO (dentro de auto_recurring)
    const inicio = new Date()
    const fin = new Date()
    fin.setFullYear(fin.getFullYear() + 1)

    // 4. Request MÍNIMO directo a Mercado Pago (para diagnóstico + capturar x-request-id)
    const uuid = crypto.randomUUID()

    const payload = {
      reason: 'Munchy Pro',
      payer_email: correo,
      status: 'pending',
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

    // Devolvemos TODO para diagnóstico
    return NextResponse.json({
      ok: mpResp.status === 201 || mpResp.status === 200,
      http_status: mpResp.status,
      x_request_id: requestId,
      init_point: mpBody?.init_point ?? null,
      respuesta_mp: mpBody,
    })

  } catch (err) {
    console.error('Error en crear-suscripcion:', err)
    return NextResponse.json(
      { ok: false, error: 'error_servidor', mensaje: 'Algo salió mal.' },
      { status: 500 }
    )
  }
}
