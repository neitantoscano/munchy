import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Límites del texto libre del ingrediente
const INGREDIENTE_MAX = 60

// Tope de ingredientes por usuario. Evita que alguien llene la base.
const DESPENSA_MAX = 200

// ─── POST: agregar un ingrediente (texto libre) a la despensa ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    // Tiene que ser texto. Si mandan un número u objeto, .trim() reventaría.
    if (typeof body?.ingrediente !== 'string') {
      return NextResponse.json({ ok: false, error: 'falta_ingrediente' }, { status: 400 })
    }

    const ingrediente = body.ingrediente.trim()

    if (ingrediente === '') {
      return NextResponse.json({ ok: false, error: 'falta_ingrediente' }, { status: 400 })
    }

    // Sin tope, alguien podría mandar un texto enorme y llenar la base.
    if (ingrediente.length > INGREDIENTE_MAX) {
      return NextResponse.json(
        { ok: false, error: 'texto_muy_largo', mensaje: `Máximo ${INGREDIENTE_MAX} caracteres` },
        { status: 400 }
      )
    }

    // Revisar cuántos ingredientes tiene ya
    const { count } = await supabase
      .from('despensa')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)

    if ((count || 0) >= DESPENSA_MAX) {
      return NextResponse.json(
        { ok: false, error: 'despensa_llena', mensaje: `Tu despensa llegó al tope de ${DESPENSA_MAX} ingredientes` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('despensa')
      .insert({
        usuario_id: user.id,
        ingrediente: ingrediente
      })
      .select('id, ingrediente')
      .single()

    if (error) {
      // El detalle va a los logs de Vercel, no al usuario.
      console.error('despensa agregar:', error.message, error.code)
      return NextResponse.json(
        { ok: false, error: 'insertar_fallo', mensaje: 'No pudimos agregar el ingrediente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, ingrediente: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
