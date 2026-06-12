import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    // Lee el apodo que manda el frontend (puede venir vacío)
    let apodo = 'Munchie Fan'
    try {
      const body = await request.json()
      if (body?.apodo && body.apodo.trim() !== '') {
        apodo = body.apodo.trim()
      }
    } catch {
      // Si no mandan body, usamos el default
    }

    // Crea la sesión anónima en Supabase
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'auth_fallo', mensaje: error.message },
        { status: 500 }
      )
    }

    const userId = data.user.id

    // Crea la fila del usuario en la tabla 'usuarios'
    const { error: errorPerfil } = await supabase
      .from('usuarios')
      .insert({ id: userId, apodo: apodo })

    if (errorPerfil) {
      return NextResponse.json(
        { ok: false, error: 'perfil_fallo', mensaje: errorPerfil.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, apodo: apodo })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
