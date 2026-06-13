import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── POST: agregar un ingrediente a la despensa ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const nombre = body?.nombre_ingrediente

    // El nombre es obligatorio
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json({ ok: false, error: 'falta_nombre' }, { status: 400 })
    }

    // Cantidad, unidad y categoría son opcionales (usamos defaults si no vienen)
    const cantidad = body?.cantidad ?? 1
    const unidad = body?.unidad?.trim() || 'unidades'
    const categoria = body?.categoria?.trim() || 'otro'

    const { data, error } = await supabase
      .from('despensa')
      .insert({
        usuario_id: user.id,
        nombre_ingrediente: nombre.trim(),
        cantidad: cantidad,
        unidad: unidad,
        categoria: categoria
      })
      .select('id, nombre_ingrediente, cantidad, unidad, categoria')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: 'insertar_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ingrediente: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
