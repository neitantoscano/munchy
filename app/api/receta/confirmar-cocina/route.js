// app/api/receta/confirmar-cocina/route.js
// POST: el usuario confirma que cocinó la receta ("Ya cociné esto 🔥").
// 1. Anota la cocinada. 2. Sube la racha. 3. Quita SOLO lo que el usuario aprobó.
// Se puede cocinar la MISMA receta varias veces: cada vez es un renglón nuevo.
//
// Body: { receta_id, quitar_despensa: [id1, id2, ...] }
// Si 'quitar_despensa' no llega o llega vacío, NO se quita nada de la despensa.

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

    // Lista de ids de despensa que el usuario aprobó quitar.
    // Si no llega, no se quita nada (más seguro que adivinar).
    const quitarDespensa = Array.isArray(body.quitar_despensa)
      ? body.quitar_despensa.filter((id) => typeof id === 'string' && id.trim() !== '')
      : []

    // 1. Confirmar que la receta existe y es del usuario
    const { data: receta, error: errReceta } = await supabase
      .from('recetas_generadas')
      .select('id')
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

    // 4. Quitar de la despensa SOLO lo que el usuario aprobó.
    //    El .eq('usuario_id') evita que alguien borre despensa ajena.
    let quitados = 0
    if (quitarDespensa.length > 0) {
      const { data: borrados, error: errBorrar } = await supabase
        .from('despensa')
        .delete()
        .in('id', quitarDespensa)
        .eq('usuario_id', user.id)
        .select('id')

      // Best-effort: si falla, no rompemos la racha ya lograda
      if (!errBorrar) {
        quitados = (borrados || []).length
      }
    }

    // 5. Devolver la racha con la forma exacta que espera el frontend.
    //    'hito_alcanzado' trae 5, 15, 35, 75 o 100 cuando toca celebrar.
    //    En cualquier otro caso viene null.
    return NextResponse.json({
      ok: true,
      racha_nueva: resultadoRacha.racha_nueva,
      racha_nueva_record: resultadoRacha.racha_nueva_record,
      hito_alcanzado: resultadoRacha.hito_alcanzado ?? null,
      ingredientes_quitados: quitados
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
