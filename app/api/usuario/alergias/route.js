import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Alergias válidas (seguridad: validamos en servidor)
const ALERGIAS_VALIDAS = ['lactosa', 'gluten', 'nueces', 'mariscos', 'otro']

// ─── POST: guardar las alergias del usuario ───
// Reemplaza la lista completa: borra las anteriores e inserta las nuevas.
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const lista = body?.alergias

    if (!Array.isArray(lista)) {
      return NextResponse.json({ ok: false, error: 'formato_invalido' }, { status: 400 })
    }

    // Tope de seguridad: solo hay 5 alergias posibles, nunca puede llegar más.
    if (lista.length > ALERGIAS_VALIDAS.length) {
      return NextResponse.json({ ok: false, error: 'lista_muy_larga' }, { status: 400 })
    }

    for (const a of lista) {
      if (!ALERGIAS_VALIDAS.includes(a)) {
        return NextResponse.json({ ok: false, error: 'alergia_invalida' }, { status: 400 })
      }
    }

    // Quitamos repetidos: la misma alergia dos veces no aporta nada.
    const unicas = [...new Set(lista)]

    // Borrar las alergias anteriores (para no duplicar)
    const { error: errorBorrar } = await supabase
      .from('alergias')
      .delete()
      .eq('usuario_id', user.id)

    if (errorBorrar) {
      // El detalle va a los logs de Vercel, nunca al usuario:
      // los mensajes internos de la base revelan cómo está armada.
      console.error('alergias borrar:', errorBorrar.message, errorBorrar.code)
      return NextResponse.json(
        { ok: false, error: 'borrado_fallo', mensaje: 'No pudimos guardar tus alergias' },
        { status: 500 }
      )
    }

    if (unicas.length === 0) {
      return NextResponse.json({ ok: true, alergias: [] })
    }

    // Insertar las nuevas alergias
    const filas = unicas.map((tipo) => ({ usuario_id: user.id, tipo: tipo }))

    const { error: errorInsertar } = await supabase
      .from('alergias')
      .insert(filas)

    if (errorInsertar) {
      console.error('alergias insertar:', errorInsertar.message, errorInsertar.code)
      return NextResponse.json(
        { ok: false, error: 'insertar_fallo', mensaje: 'No pudimos guardar tus alergias' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, alergias: unicas })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
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
      console.error('alergias leer:', error.message, error.code)
      return NextResponse.json(
        { ok: false, error: 'lectura_fallo', mensaje: 'No pudimos leer tus alergias' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      alergias: (data || []).map((a) => a.tipo),
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
