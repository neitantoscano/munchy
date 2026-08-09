import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Alergias válidas (seguridad: validamos en servidor)
const ALERGIAS_VALIDAS = ['lactosa', 'gluten', 'nueces', 'mariscos', 'otro']

// ─── POST: guardar las alergias del usuario ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const lista = body?.alergias

    if (!Array.isArray(lista)) {
      return NextResponse.json({ ok: false, error: 'formato_invalido', recibido: body }, { status: 400 })
    }

    for (const a of lista) {
      if (!ALERGIAS_VALIDAS.includes(a)) {
        return NextResponse.json({ ok: false, error: 'alergia_invalida', valor: a }, { status: 400 })
      }
    }

    // Borrar las alergias anteriores (para no duplicar)
    const { error: errorBorrar } = await supabase
      .from('alergias')
      .delete()
      .eq('usuario_id', user.id)

    if (errorBorrar) {
      return NextResponse.json({
        ok: false,
        error: 'borrado_fallo',
        mensaje: errorBorrar.message,
        detalle: errorBorrar.details || null,
        pista: errorBorrar.hint || null,
        codigo: errorBorrar.code || null,
      }, { status: 500 })
    }

    if (lista.length === 0) {
      return NextResponse.json({ ok: true, alergias: [] })
    }

    // Insertar las nuevas alergias
    const filas = lista.map((tipo) => ({ usuario_id: user.id, tipo: tipo }))

    const { error: errorInsertar } = await supabase
      .from('alergias')
      .insert(filas)

    if (errorInsertar) {
      return NextResponse.json({
        ok: false,
        error: 'insertar_fallo',
        mensaje: errorInsertar.message,
        detalle: errorInsertar.details || null,
        pista: errorInsertar.hint || null,
        codigo: errorInsertar.code || null,
      }, { status: 500 })
    }

    return NextResponse.json({ ok: true, alergias: lista })

  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: 'servidor',
      mensaje: err?.message || 'Algo salió mal',
    }, { status: 500 })
  }
}

// ─── GET: leer las alergias del usuario ───
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('alergias')
      .select('tipo')
      .eq('usuario_id', user.id)

    if (error) {
      return NextResponse.json({
        ok: false,
        error: 'lectura_fallo',
        mensaje: error.message,
        codigo: error.code || null,
      }, { status: 500 })
    }

    const lista = data.map((fila) => fila.tipo)

    return NextResponse.json({ ok: true, alergias: lista })

  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: 'servidor',
      mensaje: err?.message || 'Algo salió mal',
    }, { status: 500 })
  }
}
