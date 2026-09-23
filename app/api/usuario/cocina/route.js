// app/api/usuario/cocina/route.js
// GET:  devuelve el nivel de cocina del usuario (o null si no lo ha elegido).
// POST: guarda el nivel de cocina. Valores: 'basico' | 'completo' | 'equipado'.

import { createServerSupabase } from '@/lib/supabase-server'
import { COCINA_VALIDA } from '@/lib/cache-hash'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    const { data: perfil, error } = await supabase
      .from('usuarios')
      .select('nivel_cocina')
      .eq('id', user.id)
      .single()

    if (error || !perfil) {
      return NextResponse.json(
        { ok: false, error: 'perfil_fallo', mensaje: 'No encontramos tu perfil' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      nivel_cocina: perfil.nivel_cocina || null,
      opciones: COCINA_VALIDA
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const nivel = String(body.nivel_cocina || '').trim().toLowerCase()

    // Solo aceptamos los 3 valores validos.
    // Si llega otra cosa es error: no queremos guardar basura en la columna.
    if (!COCINA_VALIDA.includes(nivel)) {
      return NextResponse.json(
        { ok: false, error: 'nivel_invalido', mensaje: 'Nivel de cocina no válido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ nivel_cocina: nivel })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'guardar_fallo', mensaje: 'No pudimos guardar tu cocina' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, nivel_cocina: nivel })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
