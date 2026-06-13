import { createServerSupabase } from '@/lib/supabase-server'
import { actualizarRachaPorGeneracion } from '@/lib/rachas'
import { NextResponse } from 'next/server'

// ─── POST: simula que el usuario generó una receta (solo para pruebas) ───
export async function POST() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const resultado = await actualizarRachaPorGeneracion(supabase, user.id)

    if (!resultado.ok) {
      return NextResponse.json(resultado, { status: 500 })
    }

    return NextResponse.json(resultado)

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
