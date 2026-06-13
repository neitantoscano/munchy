import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── PATCH: cambiar cantidad de un ingrediente (o borrarlo si llega a 0) ───
export async function PATCH(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const id = body?.id
    const nuevaCantidad = body?.cantidad

    // El id del ingrediente es obligatorio
    if (!id) {
      return NextResponse.json({ ok: false, error: 'falta_id' }, { status: 400 })
    }

    // La cantidad debe ser un número
    if (typeof nuevaCantidad !== 'number') {
      return NextResponse.json({ ok: false, error: 'cantidad_invalida' }, { status: 400 })
    }

    // Si la cantidad es 0 o menos, borramos el ingrediente
    if (nuevaCantidad <= 0) {
      const { error } = await supabase
        .from('despensa')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (error) {
        return NextResponse.json({ ok: false, error: 'borrado_fallo', mensaje: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, borrado: true, id: id })
    }

    // Si no, actualizamos la cantidad
    const { data, error } = await supabase
      .from('despensa')
      .update({ cantidad: nuevaCantidad })
      .eq('id', id)
      .eq('usuario_id', user.id)
      .select('id, nombre_ingrediente, cantidad, unidad, categoria')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: 'actualizar_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ingrediente: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
