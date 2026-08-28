// app/api/receta/confirmar-cocina/route.js
// POST: el usuario confirma que cocinó la receta ("Ya cociné esto 🔥").
// 1. Anota la cocinada en la tabla 'cocinadas'. 2. Sube la racha. 3. Resta despensa.
// Se puede cocinar la MISMA receta varias veces: cada vez es un renglón nuevo.

import { createServerSupabase } from '@/lib/supabase-server'
import { actualizarRachaPorCocina } from '@/lib/rachas'
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

    // 2. Anotar la cocinada. Un renglón nuevo cada vez.
    //    Es lo que alimenta el menú de la semana.
    const { error: errCocinada } = await supabase
      .from('cocinadas')
      .insert({
        usuario_id: user.id,
        receta_id: recetaId
      })

    if (errCocinada) {
      return NextResponse.json(
        { ok: false, error: 'registrar_fallo', mensaje: 'No pudimos registrar tu platillo' },
        { status: 500 }
      )
    }

    // 3. Subir la racha 🔥
    //    Solo sube una vez al día, aunque cocines varias recetas.
    const resultadoRacha = await actualizarRachaPorCocina(supabase, user.id)
    if (!resultadoRacha.ok) {
      return NextResponse.json(resultadoRacha, { status: 500 })
    }

    // 4. Restar de la despensa los ingredientes usados (si los tenía).
    //    Si la receta fue de básicos universales, no habrá coincidencias.
    const nombresReceta = (receta.ingredientes || [])
      .map((i) => String(i.nombre || '').toLowerCase().trim())
      .filter((n) => n !== '')

    if (nombresReceta.length > 0) {
      const { data: despensa } = await supabase
        .from('despensa')
        .select('id, nombre_ingrediente')
        .eq('usuario_id', user.id)

      const idsAEliminar = (despensa || [])
        .filter((item) => {
          const nom = String(item.nombre_ingrediente || '').toLowerCase().trim()
          if (!nom) return false
          // Coincide si un nombre contiene al otro (jitomate ≈ jitomate bola)
          return nombresReceta.some((r) => nom.includes(r) || r.includes(nom))
        })
        .map((item) => item.id)

      if (idsAEliminar.length > 0) {
        // Best-effort: si falla, no rompemos la racha ya lograda
        await supabase
          .from('despensa')
          .delete()
          .in('id', idsAEliminar)
      }
    }

    // 5. Devolver la racha con la forma exacta que espera el frontend
    return NextResponse.json({
      ok: true,
      racha_nueva: resultadoRacha.racha_nueva,
      racha_nueva_record: resultadoRacha.racha_nueva_record
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
