import { createAdminSupabase } from '@/lib/supabase-admin'
import {
  MercadoPagoConfig,
  PreApproval,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from 'mercadopago'

// Suma 1 mes a la fecha actual (respaldo de vencimiento del premium)
function unMesDesdeHoy() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

export async function POST(request) {
  try {
    // 1. Leer datos del aviso: query params + cuerpo
    const url = new URL(request.url)
    const dataIdQuery =
      url.searchParams.get('data.id') || url.searchParams.get('id')

    let body = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const tipo =
      body?.type || url.searchParams.get('type') || url.searchParams.get('topic')
    const dataId = dataIdQuery || body?.data?.id

    // 2. Verificar que el aviso sea legítimo (firma de Mercado Pago)
    const secret = process.env.MP_WEBHOOK_SECRET
    if (!secret) {
      console.error('Webhook: falta MP_WEBHOOK_SECRET')
      return new Response(null, { status: 500 })
    }

    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get('x-signature'),
        xRequestId: request.headers.get('x-request-id'),
        dataId: dataIdQuery,
        secret,
      })
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.error('Webhook: firma inválida')
        return new Response(null, { status: 401 })
      }
      throw err
    }

    // 3. Solo nos interesan los avisos de suscripción
    if (tipo !== 'subscription_preapproval') {
      // Otros avisos: respondemos 200 para que MP no insista
      return new Response(null, { status: 200 })
    }

    if (!dataId) {
      return new Response(null, { status: 200 })
    }

    // 4. Preguntarle a MP el estado REAL de la suscripción (no confiar en el aviso)
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('Webhook: falta MP_ACCESS_TOKEN')
      return new Response(null, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const suscripcion = await new PreApproval(client).get({ id: dataId })

    const userId = suscripcion?.external_reference
    const estado = suscripcion?.status

    if (!userId) {
      console.error('Webhook: suscripción sin external_reference')
      return new Response(null, { status: 200 })
    }

    // 5. Activar o desactivar premium con el cliente admin (salta RLS)
    const admin = createAdminSupabase()

    if (estado === 'authorized') {
      await admin
        .from('usuarios')
        .update({
          es_premium: true,
          premium_hasta: unMesDesdeHoy(),
          mp_suscripcion_id: suscripcion.id,
        })
        .eq('id', userId)
    } else if (estado === 'cancelled' || estado === 'paused') {
      await admin
        .from('usuarios')
        .update({ es_premium: false })
        .eq('id', userId)
    }
    // Si está 'pending', no hacemos nada (aún no paga)

    // 6. Responder 200 a Mercado Pago
    return new Response(null, { status: 200 })

  } catch (err) {
    console.error('Error en webhook:', err)
    // 500 para que MP reintente si fue un error pasajero
    return new Response(null, { status: 500 })
  }
}
