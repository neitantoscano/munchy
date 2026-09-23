// app/api/usuario/estado/route.js

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Devuelve el estado del usuario: si tiene sesión y qué datos del cuestionario ya llenó.
// El frontend (Chat 2) usa esto para decidir si mandar al home o al cuestionario.
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // ¿Hay sesión activa?
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: true, tiene_sesion: false })
    }

    // Leemos los datos del usuario que ya confirmamos que existen en la tabla.
    const { data: perfil, error } = await supabase
      .from('usuarios')
      .select('apodo, oficio, nivel_ejercicio, nivel_cocina, es_premium')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'lectura_fallo', mensaje: error.message },
        { status: 500 }
      )
    }

    // Convertimos cada dato en "¿ya lo tiene?" (true/false).
    const tieneApodo = !!perfil?.apodo
    const tieneOficio = !!perfil?.oficio
    const tieneNivelEjercicio = !!perfil?.nivel_ejercicio
    const tieneNivelCocina = !!perfil?.nivel_cocina

    // "Cuestionario completo" = oficio + ejercicio + cocina + apodo.
    // El orden de las pantallas es: oficio → alergias → ejercicio → cocina → apodo.
    // Si falta la cocina, el usuario debe pasar por /cocina aunque ya tenga lo demás.
    const cuestionarioCompleto =
      tieneApodo && tieneOficio && tieneNivelEjercicio && tieneNivelCocina

    return NextResponse.json({
      ok: true,
      tiene_sesion: true,
      tiene_apodo: tieneApodo,
      tiene_oficio: tieneOficio,
      tiene_nivel_ejercicio: tieneNivelEjercicio,
      tiene_nivel_cocina: tieneNivelCocina,
      cuestionario_completo: cuestionarioCompleto,
      es_premium: !!perfil?.es_premium,
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
