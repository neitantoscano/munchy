import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Crea una sesión de Stripe Checkout y devuelve el link de pago.
// El frontend solo redirige a esa URL; Stripe maneja la pantalla de pago.
export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta configuración de Stripe' },
        { status: 500 }
      )
    }

    const supabase = await createServerSupabase()

    // Solo usuarios con sesión pueden pagar.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión para continuar' },
        { status: 401 }
      )
    }

    // Revisamos si ya es premium, para no cobrarle dos veces.
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('es_premium')
      .eq('id', user.id)
      .maybeSingle()

    if (perfil?.es_premium) {
      return NextResponse.json(
        { ok: false, error: 'ya_premium', mensaje: 'Ya tienes Munchy Pro activo' },
        { status: 400 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const sitio = 'https://munchy-xi.vercel.app'

    const sesion = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // Guardamos el id del usuario para que el webhook sepa a quién activar.
      client_reference_id: user.id,
      metadata: {
        usuario_id: user.id,
      },
      success_url: `${sitio}/premium/exito`,
      cancel_url: `${sitio}/premium/cancelado`,
    })

    return NextResponse.json({ ok: true, url: sesion.url })

  } catch (err) {
    // El detalle del error queda solo en los logs de Vercel, no se expone al usuario.
    console.error('Error al crear sesión de Stripe:', err?.message)

    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'No se pudo iniciar el pago' },
      { status: 500 }
    )
  }
}
