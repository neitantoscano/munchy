import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export async function POST(request) {
  try {
    // 1. Verificar que el usuario tenga sesión
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'No hay sesión activa. Vuelve a entrar.' },
        { status: 401 }
      )
    }

    // 2. Recibir el correo que manda el frontend
    let body
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    const correo = body?.correo

    if (!correo || typeof correo !== 'string' || !correo.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'correo_invalido', mensaje: 'Necesitamos un correo válido para tu suscripción.' },
        { status: 400 }
      )
    }

    // 3. Verificar que exista la credencial de Mercado Pago
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta configurar el pago. Intenta más tarde.' },
        { status: 500 }
      )
    }

    // 4. Crear la suscripción en Mercado Pago ($80 MXN al mes)
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

    let suscripcion
    try {
      suscripcion = await new PreApproval(client).create({
        body: {
          reason: 'Munchy Pro - Recetas ilimitadas',
          external_reference: user.id,
          payer_email: correo,
          back_url: 'https://munchy-xi.vercel.app',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 80,
            currency_id: 'MXN',
          },
        },
      })
    } catch (mpError) {
      // AJUSTE TEMPORAL: mostrar el error COMPLETO de Mercado Pago
      let detalleMP
      try {
        detalleMP = JSON.stringify(mpError, Object.getOwnPropertyNames(mpError))
      } catch {
        detalleMP = String(mpError)
      }
      console.error('DETALLE MP crear-suscripcion:', detalleMP)
      return NextResponse.json(
        { ok: false, error: 'mp_rechazo', mensaje: 'Mercado Pago rechazó la suscripción.', detalle: detalleMP },
        { status: 502 }
      )
    }

    // 5. Guardar el folio de la suscripción en la fila del usuario
    if (suscripcion?.id) {
      await supabase
        .from('usuarios')
        .update({ mp_suscripcion_id: suscripcion.id })
        .eq('id', user.id)
    }

    // 6. Devolver el link de pago para que el frontend redirija
    if (!suscripcion?.init_point) {
      return NextResponse.json(
        { ok: false, error: 'sin_link', mensaje: 'No se pudo generar el link de pago. Intenta de nuevo.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, url_pago: suscripcion.init_point })

  } catch (err) {
    console.error('Error en crear-suscripcion:', err)
    return NextResponse.json(
      { ok: false, error: 'error_servidor', mensaje: 'Algo salió mal al crear tu suscripción. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
