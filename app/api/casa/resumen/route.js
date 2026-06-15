import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Límite de recetas diarias para usuarios free
const LIMITE_FREE = 3

// ─── Helpers de fecha (México UTC-6) ───
function fechaMexico() {
  const ahora = new Date()
  const offsetMexico = -6 * 60
  const ajuste = (ahora.getTimezoneOffset() + offsetMexico) * 60 * 1000
  const f = new Date(ahora.getTime() + ajuste)
  const ano = f.getUTCFullYear()
  const mes = String(f.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(f.getUTCDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function diferenciaDias(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio + 'T00:00:00Z')
  const fin = new Date(fechaFin + 'T00:00:00Z')
  return Math.round((fin - inicio) / (1000 * 60 * 60 * 24))
}

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
      .select('apodo, es_premium, racha_dias, recetas_hoy, primera_vez, ultima_visita, fecha_contador')
      .eq('id', user.id)
      .single()

    if (errorPerfil) {
      return NextResponse.json({ ok: false, error: 'perfil_fallo', mensaje: errorPerfil.message }, { status: 500 })
    }

    const hoy = fechaMexico()

    // 2. Calcular recetas restantes hoy (con conciencia de fecha)
    // Si el contador es de un día viejo, hoy va en 0.
    const usadasHoy =
      perfil.fecha_contador && String(perfil.fecha_contador).substring(0, 10) === hoy
        ? (perfil.recetas_hoy || 0)
        : 0

    let recetas_restantes_hoy
    if (perfil.es_premium) {
      recetas_restantes_hoy = 999 // ilimitado en la práctica
    } else {
      recetas_restantes_hoy = Math.max(0, LIMITE_FREE - usadasHoy)
    }

    // 3. Calcular la racha real (con conciencia de fecha)
    // Si la última cocina fue hace 2+ días, la racha ya se rompió → mostrar 0.
    let racha_dias = perfil.racha_dias || 0
    if (racha_dias > 0 && perfil.ultima_visita) {
      const ultima = String(perfil.ultima_visita).substring(0, 10)
      const dias = diferenciaDias(ultima, hoy)
      if (dias > 1) {
        racha_dias = 0
      }
    }

    // 4. Contar ingredientes en la despensa
    const { count: totalDespensa, error: errorDespensa } = await supabase
      .from('despensa')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)

    const ingredientes_en_despensa = errorDespensa ? 0 : (totalDespensa || 0)

    // 5. Elegir el dato curioso del día
    const dato_curioso = await obtenerDatoDelDia(supabase)

    // 6. Armar la respuesta con los nombres exactos que pidió el frontend
    return NextResponse.json({
      ok: true,
      apodo: perfil.apodo || 'Munchie Fan',
      racha_dias: racha_dias,
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
    const ahora = new Date()
    const inicioAno = new Date(ahora.getFullYear(), 0, 0)
    const diff = ahora - inicioAno
    const unDia = 1000 * 60 * 60 * 24
    let diaDelAno = Math.floor(diff / unDia)

    if (diaDelAno < 1) diaDelAno = 1
    if (diaDelAno > 365) diaDelAno = 365

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
