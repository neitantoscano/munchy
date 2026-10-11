import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Límite del texto libre del ingrediente
const INGREDIENTE_MAX = 60

// ─── PATCH: actualizar el texto de un ingrediente de la despensa ───
export async function PATCH(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const id = body?.id

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'falta_id' }, { status: 400 })
    }

    // Tiene que ser texto. Si mandan un número u objeto, .trim() reventaría.
    if (typeof body?.ingrediente !== 'string') {
      return NextResponse.json({ ok: false, error: 'falta_ingrediente' }, { status: 400 })
    }

    const ingrediente = body.ingrediente.trim()

    if (ingrediente === '') {
      return NextResponse.json({ ok: false, error: 'falta_ingrediente' }, { status: 400 })
    }

    if (ingrediente.length > INGREDIENTE_MAX) {
      return NextResponse.json(
        { ok: false, error: 'texto_muy_largo', mensaje: `Máximo ${INGREDIENTE_MAX} caracteres` },
        { status: 400 }
      )
    }

    // Actualiza solo si el ingrediente es de este usuario (seguridad)
    const { data, error } = await supabase
      .from('despensa')
      .update({ ingrediente: ingrediente })
      .eq('id', id)
      .eq('usuario_id', user.id)
      .select('id, ingrediente')
      .maybeSingle()

    if (error) {
      // El detalle va a los logs de Vercel, no al usuario.
      console.error('despensa actualizar:', error.message, error.code)
      return NextResponse.json(
        { ok: false, error: 'actualizar_fallo', mensaje: 'No pudimos actualizar el ingrediente' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'no_encontrado' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, ingrediente: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
