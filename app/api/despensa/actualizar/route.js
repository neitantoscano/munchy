import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── PATCH: actualizar el texto de un ingrediente de la despensa ───
export async function PATCH(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const id = body?.id
    const ingrediente = body?.ingrediente

    // El id y el nuevo texto son obligatorios
    if (!id) {
      return NextResponse.json({ ok: false, error: 'falta_id' }, { status: 400 })
    }
    if (!ingrediente || ingrediente.trim() === '') {
      return NextResponse.json({ ok: false, error: 'falta_ingrediente' }, { status: 400 })
    }

    // Actualiza solo si el ingrediente es de este usuario (seguridad)
    const { data, error } = await supabase
      .from('despensa')
      .update({ ingrediente: ingrediente.trim() })
      .eq('id', id)
      .eq('usuario_id', user.id)
      .select('id, ingrediente')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: 'actualizar_fallo', mensaje: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'no_encontrado' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, ingrediente: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
