import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Envía un correo con el link para restablecer la contraseña.
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    let correo = ''
    try {
      const body = await request.json()
      correo = (body?.correo || '').trim().toLowerCase()
    } catch {
      return NextResponse.json(
        { ok: false, error: 'datos_invalidos', mensaje: 'Faltan datos' },
        { status: 400 }
      )
    }

    if (!correo || !correo.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'correo_invalido', mensaje: 'Escribe un correo válido' },
        { status: 400 }
      )
    }

    await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: 'https://munchy-xi.vercel.app/nueva-contrasena',
    })

    // Respondemos ok siempre, exista o no el correo.
    // Así nadie puede usar esto para descubrir qué correos están registrados.
    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
