import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Valores válidos (seguridad: validamos en servidor)
const OFICIOS = ['estudiante', 'trabajo8h', 'atleta', 'profesional', 'cocinero', 'libre']
const EJERCICIOS = ['nada', 'ocasional', 'frecuente', 'gymrat']

// ─── GET: leer el perfil del usuario ───
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: 'lectura_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, perfil: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}

// ─── POST: guardar el oficio ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const oficio = body?.oficio

    if (!OFICIOS.includes(oficio)) {
      return NextResponse.json({ ok: false, error: 'oficio_invalido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ oficio: oficio })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ ok: false, error: 'guardado_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, oficio: oficio })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}

// ─── PATCH: actualizar nivel de ejercicio y/o correo ───
export async function PATCH(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json()
    const cambios = {}

    // Nivel de ejercicio (si viene, validar)
    if (body?.nivel_ejercicio !== undefined) {
      if (!EJERCICIOS.includes(body.nivel_ejercicio)) {
        return NextResponse.json({ ok: false, error: 'ejercicio_invalido' }, { status: 400 })
      }
      cambios.nivel_ejercicio = body.nivel_ejercicio
    }

    // Correo (si viene, guardarlo)
    if (body?.correo !== undefined && body.correo.trim() !== '') {
      cambios.correo = body.correo.trim()
    }

    // Apodo (si viene, guardarlo)
    if (body?.apodo !== undefined && body.apodo.trim() !== '') {
      cambios.apodo = body.apodo.trim()
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ ok: false, error: 'sin_cambios' }, { status: 400 })
    }

    const { error } = await supabase
      .from('usuarios')
      .update(cambios)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ ok: false, error: 'actualizar_fallo', mensaje: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, cambios: cambios })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
