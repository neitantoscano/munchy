import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Crea una cuenta nueva con correo + contraseña.
// Deja la sesión iniciada y crea la fila en 'usuarios'.
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    let correo = ''
    let contrasena = ''
    try {
      const body = await request.json()
      correo = (body?.correo || '').trim().toLowerCase()
      contrasena = body?.contrasena || ''
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

    if (contrasena.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'contrasena_corta', mensaje: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Crea la cuenta en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
    })

    if (error) {
      // Correo ya registrado u otro fallo de Supabase
      return NextResponse.json(
        { ok: false, error: 'registro_fallo', mensaje: error.message },
        { status: 400 }
      )
    }

    if (!data?.user) {
      return NextResponse.json(
        { ok: false, error: 'sin_usuario', mensaje: 'No se pudo crear la cuenta' },
        { status: 500 }
      )
    }

    const userId = data.user.id

    // Crea la fila del usuario. El apodo se pide al final del cuestionario.
    const { error: errorPerfil } = await supabase
      .from('usuarios')
      .insert({ id: userId, correo: correo })

    if (errorPerfil) {
      return NextResponse.json(
        { ok: false, error: 'perfil_fallo', mensaje: errorPerfil.message },
        { status: 500 }
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
