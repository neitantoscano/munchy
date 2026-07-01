import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    // 1. Verificar sesión
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'No hay sesión activa.' },
        { status: 401 }
      )
    }

    // 2. Verificar que exista el token
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'config_faltante', mensaje: 'Falta el token de Mercado Pago.' },
        { status: 500 }
      )
    }

    // 3. PRUEBA TEMPORAL: preguntarle a Mercado Pago "¿de quién es este token?"
    const pruebaResp = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })

    let pruebaBody
    try {
      pruebaBody = await pruebaResp.json()
    } catch {
      pruebaBody = null
    }

    return NextResponse.json({
      ok: pruebaResp.status === 200,
      prueba_token: {
        status: pruebaResp.status,
        id: pruebaBody?.id ?? null,
        nickname: pruebaBody?.nickname ?? null,
        site_id: pruebaBody?.site_id ?? null,
        email: pruebaBody?.email ?? null,
        error: pruebaResp.status !== 200 ? pruebaBody : null,
      },
    })

  } catch (err) {
    console.error('Error en prueba de token:', err)
    return NextResponse.json(
      { ok: false, error: 'error_servidor', mensaje: 'Algo salió mal en la prueba.' },
      { status: 500 }
    )
  }
}
