import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── POST: agregar un ingrediente (texto libre) a la despensa ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const ingrediente = body?.ingrediente

    // El texto del ingrediente es obligatorio
    if (!ingrediente || ingrediente.trim() === '') {
      return NextResponse.json({ ok: false, error: 'falta_ingrediente' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('despensa')
      .insert({
        usuario_id: user.id,
        ingrediente: ingrediente.trim()
      })
      .select('id, ingrediente')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: 'insertar_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ingrediente: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
