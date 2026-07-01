import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago'

export async function POST() {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta el token de Mercado Pago.' },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

    let plan
    try {
      plan = await new PreApprovalPlan(client).create({
        body: {
          reason: 'Munchy Pro - Recetas ilimitadas',
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
      let detalleMP
      try {
        detalleMP = JSON.stringify(mpError, Object.getOwnPropertyNames(mpError))
      } catch {
        detalleMP = String(mpError)
      }
      console.error('DETALLE MP crear-plan:', detalleMP)
      return NextResponse.json(
        { ok: false, error: 'mp_rechazo', mensaje: 'Mercado Pago rechazó el plan.', detalle: detalleMP },
        { status: 502 }
      )
    }

    // Devolvemos el id del plan (lo guardaremos para usarlo después)
    return NextResponse.json({
      ok: true,
      plan_id: plan?.id ?? null,
      init_point: plan?.init_point ?? null,
      status: plan?.status ?? null,
    })

  } catch (err) {
    console.error('Error en crear-plan:', err)
    return NextResponse.json(
      { ok: false, error: 'error_servidor', mensaje: 'Algo salió mal al crear el plan.' },
      { status: 500 }
    )
  }
}
