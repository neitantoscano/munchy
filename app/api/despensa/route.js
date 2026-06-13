import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── GET: listar todos los ingredientes de la despensa del usuario ───
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('despensa')
      .select('id, nombre_ingrediente, cantidad, unidad, categoria')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ ok: false, error: 'lectura_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ingredientes: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
