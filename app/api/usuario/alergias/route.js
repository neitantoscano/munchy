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

    // Debe ser un array (puede estar vacío)
    if (!Array.isArray(lista)) {
      return NextResponse.json({ ok: false, error: 'formato_invalido' }, { status: 400 })
    }

    // Validar que cada alergia sea de las permitidas
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
      return NextResponse.json({ ok: false, error: 'borrado_fallo', mensaje: errorBorrar.message }, { status: 500 })
    }

    // Si la lista está vacía, terminamos aquí (sin alergias)
    if (lista.length === 0) {
      return NextResponse.json({ ok: true, alergias: [] })
    }

    // Insertar las nuevas alergias
    const filas = lista.map((tipo) => ({ usuario_id: user.id, tipo: tipo }))

    const { error: errorInsertar } = await supabase
      .from('alergias')
      .insert(filas)

    if (errorInsertar) {
      return NextResponse.json({ ok: false, error: 'insertar_fallo', mensaje: errorInsertar.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, alergias: lista })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
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
      return NextResponse.json({ ok: false, error: 'lectura_fallo', mensaje: error.message }, { status: 500 })
    }

    const lista = data.map((fila) => fila.tipo)

    return NextResponse.json({ ok: true, alergias: lista })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
