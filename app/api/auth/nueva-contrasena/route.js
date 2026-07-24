import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Recibe el código del enlace de recuperación y la contraseña nueva.
// Canjea el código por una sesión y actualiza la contraseña.
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    let code = ''
    let contrasena = ''
    try {
      const body = await request.json()
      code = (body?.code || '').trim()
      contrasena = body?.contrasena || ''
    } catch {
      return NextResponse.json(
        { ok: false, error: 'datos_invalidos', mensaje: 'Faltan datos' },
        { status: 400 }
      )
    }

    if (contrasena.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'contrasena_corta', mensaje: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Si viene código, lo canjeamos por sesión.
    if (code) {
      const { error: errorCanje } = await supabase.auth.exchangeCodeForSession(code)

      if (errorCanje) {
        return NextResponse.json(
          { ok: false, error: 'enlace_invalido', mensaje: 'El enlace expiró o ya se usó. Pide uno nuevo.' },
          { status: 400 }
        )
      }
    }

    // Verificamos que ya haya sesión antes de cambiar la contraseña.
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'El enlace expiró o ya se usó. Pide uno nuevo.' },
        { status: 401 }
      )
    }

    const { error } = await supabase.auth.updateUser({ password: contrasena })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'cambio_fallo', mensaje: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
