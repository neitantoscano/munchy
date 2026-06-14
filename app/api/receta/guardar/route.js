// app/api/receta/guardar/route.js
// Maneja los favoritos del usuario:
//   POST   → guardar una receta en favoritos
//   DELETE → quitarla de favoritos
//   GET    → lista de recetas guardadas (pantalla guardados)

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── POST: guardar en favoritos ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sesion_no_encontrada', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const recetaId = body.receta_id
    if (!recetaId) {
      return NextResponse.json(
        { ok: false, error: 'falta_receta', mensaje: 'Falta el id de la receta' },
        { status: 400 }
      )
    }

    // ¿Ya estaba guardada? (evitamos duplicados)
    const { data: yaExiste } = await supabase
      .from('recetas_guardadas')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('receta_id', recetaId)
      .maybeSingle()

    if (yaExiste) {
      return NextResponse.json({ ok: true, guardada: true })
    }

    const { error } = await supabase
      .from('recetas_guardadas')
      .insert({ usuario_id: user.id, receta_id: recetaId })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'guardar_fallo', mensaje: 'No pudimos guardar la receta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, guardada: true })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}

// ─── DELETE: quitar de favoritos ───
export async function DELETE(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sesion_no_encontrada', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const recetaId = body.receta_id
    if (!recetaId) {
      return NextResponse.json(
        { ok: false, error: 'falta_receta', mensaje: 'Falta el id de la receta' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('recetas_guardadas')
      .delete()
      .eq('usuario_id', user.id)
      .eq('receta_id', recetaId)

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'quitar_fallo', mensaje: 'No pudimos quitar la receta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, guardada: false })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}

// ─── GET: lista de recetas guardadas ───
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sesion_no_encontrada', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    // Traemos las guardadas + los datos de cada receta (join por receta_id)
    const { data, error } = await supabase
      .from('recetas_guardadas')
      .select('receta_id, created_at, recetas_generadas(*)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'leer_fallo', mensaje: 'No pudimos leer tus favoritos' },
        { status: 500 }
      )
    }

    // Damos forma a la lista
    const recetas = (data || [])
      .filter((fila) => fila.recetas_generadas) // por si alguna receta fue borrada
      .map((fila) => {
        const r = fila.recetas_generadas
        return {
          id: r.id,
          titulo: r.titulo,
          emoji: r.emoji,
          imagen_url: r.imagen_url,
          estilo: r.estilo,
          tiempo_minutos: r.tiempo_minutos,
          porciones: r.porciones,
          descripcion: r.descripcion,
          macros: r.macros,
          guardada: true
        }
      })

    return NextResponse.json({ ok: true, recetas })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
