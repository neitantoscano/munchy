// app/api/receta/preparar-cocina/route.js
// POST: antes de confirmar la cocina, devuelve que ingredientes de la despensa
// coinciden con la receta, para que el usuario destilde los que le sobraron.
// NO borra nada. Solo consulta.

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

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

    // 1. Traer la receta y confirmar que es del usuario
    const { data: receta, error: errReceta } = await supabase
      .from('recetas_generadas')
      .select('ingredientes')
      .eq('id', recetaId)
      .eq('usuario_id', user.id)
      .single()

    if (errReceta || !receta) {
      return NextResponse.json(
        { ok: false, error: 'no_encontrada', mensaje: 'No encontramos esta receta' },
        { status: 404 }
      )
    }

    // 2. Nombres de los ingredientes de la receta, en minusculas
    const nombresReceta = (receta.ingredientes || [])
      .map((i) => String(i.nombre || '').toLowerCase().trim())
      .filter((n) => n !== '')

    // 3. Traer la despensa del usuario
    const { data: despensa, error: errDespensa } = await supabase
      .from('despensa')
      .select('id, nombre_ingrediente')
      .eq('usuario_id', user.id)

    if (errDespensa) {
      return NextResponse.json(
        { ok: false, error: 'leer_fallo', mensaje: 'No pudimos leer tu despensa' },
        { status: 500 }
      )
    }

    // 4. Buscar coincidencias.
    //    Coincide si un nombre contiene al otro (jitomate ≈ jitomate bola).
    const candidatos = (despensa || [])
      .filter((item) => {
        const nom = String(item.nombre_ingrediente || '').toLowerCase().trim()
        if (!nom) return false
        return nombresReceta.some((r) => nom.includes(r) || r.includes(nom))
      })
      .map((item) => ({
        id: item.id,
        nombre: item.nombre_ingrediente
      }))

    return NextResponse.json({
      ok: true,
      candidatos,
      total_despensa: (despensa || []).length
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
