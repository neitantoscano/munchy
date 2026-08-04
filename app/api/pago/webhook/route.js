import { createAdminSupabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Webhook de Stripe: recibe el aviso de que un pago se completó
// y activa es_premium + premium_hasta en la tabla usuarios.
// Solo este endpoint puede escribir es_premium (usa el cliente admin).
export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: 'config_faltante' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Leemos el cuerpo tal cual llega: la firma se valida sobre el texto original.
    const cuerpo = await request.text()
    const firma = request.headers.get('stripe-signature')

    let evento
    try {
      evento = stripe.webhooks.constructEvent(
        cuerpo,
        firma,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      // Firma inválida: no viene de Stripe.
      return NextResponse.json({ ok: false, error: 'firma_invalida' }, { status: 400 })
    }

    const admin = createAdminSupabase()

    // ─── Pago completado: activar premium ───
    if (evento.type === 'checkout.session.completed') {
      const sesion = evento.data.object
      const usuarioId = sesion.client_reference_id || sesion.metadata?.usuario_id

      if (usuarioId) {
        // Premium por 30 días desde hoy.
        const hasta = new Date()
        hasta.setDate(hasta.getDate() + 30)

        await admin
          .from('usuarios')
          .update({
            es_premium: true,
            premium_hasta: hasta.toISOString(),
            stripe_customer_id: sesion.customer || null,
          })
          .eq('id', usuarioId)
      }
    }

    // ─── Renovación mensual pagada: extender 30 días más ───
    if (evento.type === 'invoice.payment_succeeded') {
      const factura = evento.data.object
      const customerId = factura.customer

      if (customerId) {
        const hasta = new Date()
        hasta.setDate(hasta.getDate() + 30)

        await admin
          .from('usuarios')
          .update({
            es_premium: true,
            premium_hasta: hasta.toISOString(),
          })
          .eq('stripe_customer_id', customerId)
      }
    }

    // ─── Suscripción cancelada o pago fallido: quitar premium ───
    if (
      evento.type === 'customer.subscription.deleted' ||
      evento.type === 'invoice.payment_failed'
    ) {
      const objeto = evento.data.object
      const customerId = objeto.customer

      if (customerId) {
        await admin
          .from('usuarios')
          .update({ es_premium: false })
          .eq('stripe_customer_id', customerId)
      }
    }

    return NextResponse.json({ ok: true, recibido: true })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor' }, { status: 500 })
  }
}
