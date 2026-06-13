import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Límite de recetas diarias para usuarios free
const LIMITE_FREE = 3

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    // 1. Leer el perfil del usuario
    const { data: perfil, error: errorPerfil } = await supabase
      .from('usuarios')
      .select('apodo, es_premium, racha_dias, recetas_hoy, primera_vez')
      .eq('id', user.id)
      .single()

    if (errorPerfil) {
      return NextResponse.json({ ok: false, error: 'perfil_fallo', mensaje: errorPerfil.message }, { status: 500 })
    }

    // 2. Calcular recetas restantes hoy
    // Si es premium, ponemos un número alto (ilimitado en la práctica)
    let recetas_restantes_hoy
    if (perfil.es_premium) {
      recetas_restantes_hoy = 999
    } else {
      recetas_restantes_hoy = Math.max(0, LIMITE_FREE - (perfil.recetas_hoy || 0))
    }

    // 3. Contar ingredientes en la despensa
    const { count: totalDespensa, error: errorDespensa } = await supabase
      .from('despensa')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)

    const ingredientes_en_despensa = errorDespensa ? 0 : (totalDespensa || 0)

    // 4. Elegir el dato curioso del día
    // Usamos el día del año (1-365) para que todos vean el mismo dato ese día
    const dato_curioso = await obtenerDatoDelDia(supabase)

    // 5. Armar la respuesta con los nombres exactos que pidió el frontend
    return NextResponse.json({
      ok: true,
      apodo: perfil.apodo || 'Munchie Fan',
      racha_dias: perfil.racha_dias || 0,
      recetas_restantes_hoy: recetas_restantes_hoy,
      es_premium: perfil.es_premium || false,
      ingredientes_en_despensa: ingredientes_en_despensa,
      dato_curioso: dato_curioso,
      primera_vez: perfil.primera_vez ?? true
    })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}

// ─── Función: obtener el dato curioso según el día del año ───
async function obtenerDatoDelDia(supabase) {
  try {
    // Calcular qué día del año es hoy (1 a 365)
    const ahora = new Date()
    const inicioAno = new Date(ahora.getFullYear(), 0, 0)
    const diff = ahora - inicioAno
    const unDia = 1000 * 60 * 60 * 24
    let diaDelAno = Math.floor(diff / unDia)

    // Asegurar que esté entre 1 y 365
    if (diaDelAno < 1) diaDelAno = 1
    if (diaDelAno > 365) diaDelAno = 365

    // Buscar el dato con ese 'orden'
    const { data, error } = await supabase
      .from('datos_curiosos')
      .select('texto')
      .eq('orden', diaDelAno)
      .single()

    if (error || !data) {
      return 'Comer saludable también puede ser delicioso. 🥗'
    }

    return data.texto

  } catch {
    return 'Comer saludable también puede ser delicioso. 🥗'
  }
}
