// app/api/pago/cancelar/route.js

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Cancela la renovación de Munchy Pro.
// El usuario sigue siendo Pro hasta que termine el mes que ya pagó.
// El premium se apaga solo cuando Stripe manda 'customer.subscription.deleted'.
export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta configuración de Stripe' },
        { status: 500 }
      )
    }

    const supabase = await createServerSupabase()

    // Solo con sesión activa.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión para continuar' },
        { status: 401 }
      )
    }

    // Buscamos su id de cliente en Stripe.
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('es_premium, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!perfil?.es_premium || !perfil?.stripe_customer_id) {
      return NextResponse.json(
        { ok: false, error: 'sin_suscripcion', mensaje: 'No tienes una suscripción activa' },
        { status: 400 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Buscamos su suscripción activa en Stripe.
    const suscripciones = await stripe.subscriptions.list({
      customer: perfil.stripe_customer_id,
      status: 'active',
      limit: 1,
    })

    const suscripcion = suscripciones?.data?.[0]

    if (!suscripcion) {
      return NextResponse.json(
        { ok: false, error: 'sin_suscripcion', mensaje: 'No encontramos tu suscripción' },
        { status: 400 }
      )
    }

    // Ya estaba cancelada: no hacemos nada, solo confirmamos.
    if (suscripcion.cancel_at_period_end) {
      return NextResponse.json({
        ok: true,
        ya_estaba_cancelada: true,
        activo_hasta: new Date(suscripcion.current_period_end * 1000).toISOString(),
      })
    }

    // Le decimos a Stripe: no vuelvas a cobrar al terminar el mes.
    const actualizada = await stripe.subscriptions.update(suscripcion.id, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({
      ok: true,
      ya_estaba_cancelada: false,
      activo_hasta: new Date(actualizada.current_period_end * 1000).toISOString(),
    })

  } catch (err) {
    // El detalle queda en los logs de Vercel, no se le muestra al usuario.
    console.error('Error al cancelar suscripción:', err?.message)

    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'No se pudo cancelar. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
