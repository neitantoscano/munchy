// app/api/pago/webhook/route.js

import { createAdminSupabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Webhook de Stripe: recibe los avisos de pago y activa o apaga es_premium.
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
      // Firma invalida: no viene de Stripe.
      return NextResponse.json({ ok: false, error: 'firma_invalida' }, { status: 400 })
    }

    const admin = createAdminSupabase()

    // ─── Pago inicial completado: activar premium ───
    if (evento.type === 'checkout.session.completed') {
      const sesion = evento.data.object
      const usuarioId = sesion.client_reference_id || sesion.metadata?.usuario_id

      if (usuarioId) {
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

    // ─── Renovacion mensual pagada: extender 30 dias mas ───
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

    // ─── Cobro rechazado: NO se quita el premium ───
    // Stripe reintenta el cobro varios dias. Si al final se rinde,
    // manda 'customer.subscription.deleted' y ahi si se apaga.
    if (evento.type === 'invoice.payment_failed') {
      const factura = evento.data.object
      console.log('COBRO_RECHAZADO:', 'customer=' + factura.customer)
    }

    // ─── Reembolso emitido: apagar premium ───
    // Se dispara al apretar "Reembolsar" en el panel de Stripe.
    // Solo apagamos si el reembolso fue TOTAL. Uno parcial no quita el acceso.
    if (evento.type === 'charge.refunded') {
      const cargo = evento.data.object
      const customerId = cargo.customer
      const fueTotal = cargo.amount_refunded >= cargo.amount

      if (customerId && fueTotal) {
        await admin
          .from('usuarios')
          .update({
            es_premium: false,
            premium_hasta: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        console.log('REEMBOLSO_TOTAL:', 'customer=' + customerId)
      } else if (customerId) {
        console.log('REEMBOLSO_PARCIAL:', 'customer=' + customerId)
      }
    }

    // ─── Suscripcion terminada: apagar premium ───
    // Llega cuando el usuario cancelo y ya se acabo su mes pagado,
    // o cuando Stripe se rindio de cobrar.
    if (evento.type === 'customer.subscription.deleted') {
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
    console.error('Error en webhook de Stripe:', err?.message)
    return NextResponse.json({ ok: false, error: 'servidor' }, { status: 500 })
  }
}
