import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── DELETE: borrar un ingrediente de la despensa ───
export async function DELETE(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const id = body?.id

    if (!id) {
      return NextResponse.json({ ok: false, error: 'falta_id' }, { status: 400 })
    }

    // Borra solo si el ingrediente es de este usuario (seguridad)
    const { error } = await supabase
      .from('despensa')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (error) {
      return NextResponse.json({ ok: false, error: 'borrar_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
