// app/api/receta/[id]/route.js
// GET: lee una receta del historial por su id.
// La usa la pantalla de detalle (receta/[id]/page.js).

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const supabase = await createServerSupabase()

    // 1. Verificar sesión
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sesion_no_encontrada', mensaje: 'Inicia sesión para ver esta receta' },
        { status: 401 }
      )
    }

    const recetaId = params.id

    // 2. Buscar la receta (solo si es de este usuario)
    const { data: receta, error } = await supabase
      .from('recetas_generadas')
      .select('*')
      .eq('id', recetaId)
      .eq('usuario_id', user.id)
      .single()

    if (error || !receta) {
      return NextResponse.json(
        { ok: false, error: 'no_encontrada', mensaje: 'No encontramos esta receta' },
        { status: 404 }
      )
    }

    // 3. Revisar si está guardada en favoritos
    const { data: guardada } = await supabase
      .from('recetas_guardadas')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('receta_id', recetaId)
      .maybeSingle()

    // 4. Devolver con la forma que espera el frontend
    return NextResponse.json({
      ok: true,
      receta: {
        id: receta.id,
        titulo: receta.titulo,
        emoji: receta.emoji,
        imagen_url: receta.imagen_url,
        estilo: receta.estilo,
        tiempo_minutos: receta.tiempo_minutos,
        porciones: receta.porciones,
        descripcion: receta.descripcion,
        ingredientes: receta.ingredientes,
        ingredientes_pro: receta.ingredientes_pro || [],
        instrucciones: receta.instrucciones,
        macros: receta.macros,
        alergias_presentes: receta.alergias_presentes || [],
        guardada: guardada ? true : false
      }
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
