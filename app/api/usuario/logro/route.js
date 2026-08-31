// app/api/usuario/logro/route.js
// GET: datos para la pantalla de felicitación al alcanzar un hito de racha.
// Devuelve lo REAL del usuario (recetas cocinadas, calorías, proteína)
// más rangos de referencia ilustrativos para el comparativo.

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Rangos ILUSTRATIVOS de una semana de alimentación basada en comida rápida.
// NO son datos del usuario ni una medición: son referencia general.
// Fuente: estimación general, no representa a toda la Generación Z.
const REFERENCIA_SEMANAL = {
  sin_munchy: {
    calorias: [14000, 17500],
    proteina_g: [350, 550],
    azucar_total_g: [700, 1100],
    azucar_anadido_g: [500, 800]
  },
  con_munchy: {
    calorias: [12600, 15400],
    proteina_g: [490, 700],
    azucar_total_g: [350, 700],
    azucar_anadido_g: [175, 350]
  },
  descargo: 'Estimaciones generales e ilustrativas. No representan a toda la Generación Z ni sustituyen una evaluación nutricional personalizada.',
  nota_oms: 'La OMS recomienda limitar los azúcares libres a menos del 10% de la energía diaria, y preferentemente a menos del 5%.'
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // 1. Verificar sesión
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    // 2. Leer racha del usuario
    const { data: perfil, error: errPerfil } = await supabase
      .from('usuarios')
      .select('apodo, racha_dias, racha_record')
      .eq('id', user.id)
      .single()

    if (errPerfil || !perfil) {
      return NextResponse.json(
        { ok: false, error: 'perfil_fallo', mensaje: 'No encontramos tu perfil' },
        { status: 404 }
      )
    }

    // 3. Traer TODAS las cocinadas del usuario con los macros de cada receta.
    //    Esto es lo único real: lo que de verdad cocinó.
    const { data: cocinadas, error: errCocinadas } = await supabase
      .from('cocinadas')
      .select('id, recetas_generadas(macros)')
      .eq('usuario_id', user.id)

    if (errCocinadas) {
      return NextResponse.json(
        { ok: false, error: 'leer_fallo', mensaje: 'No pudimos leer tu historial' },
        { status: 500 }
      )
    }

    // 4. Sumar macros. Cada cocinada cuenta, aunque sea la misma receta repetida.
    let totalRecetas = 0
    let totalCalorias = 0
    let totalProteina = 0

    for (const c of (cocinadas || [])) {
      const macros = c.recetas_generadas?.macros
      if (!macros) continue

      totalRecetas += 1
      totalCalorias += Number(macros.calorias) || 0
      totalProteina += Number(macros.proteina_g) || 0
    }

    return NextResponse.json({
      ok: true,
      apodo: perfil.apodo || 'Munchie',
      racha_dias: perfil.racha_dias || 0,
      racha_record: perfil.racha_record || 0,

      // Datos REALES del usuario
      totales: {
        recetas_cocinadas: totalRecetas,
        calorias: totalCalorias,
        proteina_g: Math.round(totalProteina),
        promedio_calorias: totalRecetas > 0 ? Math.round(totalCalorias / totalRecetas) : 0,
        promedio_proteina_g: totalRecetas > 0 ? Math.round(totalProteina / totalRecetas) : 0
      },

      // Rangos de referencia (NO son del usuario)
      referencia: REFERENCIA_SEMANAL
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
