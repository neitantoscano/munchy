// app/api/menu/historial/route.js
// GET: devuelve lo que el usuario COCINO agrupado por dia.
// Query: ?rango=semana  (default)  o  ?rango=mes
// Lee de la tabla 'cocinadas': cada vez que se cocina algo es un renglon.
// Si el usuario cocina la MISMA receta dos veces, aparece dos veces.

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Fecha de hoy en Mexico (UTC-6) como "AAAA-MM-DD"
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

// Convierte un timestamp a "AAAA-MM-DD" en hora de Mexico
function diaMexico(timestamp) {
  const f = new Date(timestamp)
  const ajustada = new Date(f.getTime() - 6 * 60 * 60 * 1000)
  const ano = ajustada.getUTCFullYear()
  const mes = String(ajustada.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(ajustada.getUTCDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// Resta dias a una fecha "AAAA-MM-DD". Con dias negativos, suma.
function restarDias(fechaTexto, dias) {
  const f = new Date(fechaTexto + 'T00:00:00Z')
  f.setUTCDate(f.getUTCDate() - dias)
  return f.toISOString().substring(0, 10)
}

// Que dia de la semana es (0 = domingo, 1 = lunes ... 6 = sabado)
function diaDeLaSemana(fechaTexto) {
  return new Date(fechaTexto + 'T00:00:00Z').getUTCDay()
}

export async function GET(request) {
  try {
    const supabase = await createServerSupabase()

    // 1. Verificar sesion
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    // 2. Leer el rango pedido
    const { searchParams } = new URL(request.url)
    const rango = searchParams.get('rango') === 'mes' ? 'mes' : 'semana'

    const hoy = fechaMexico()

    // 3. Calcular desde que dia leer
    let desde
    if (rango === 'mes') {
      // Del dia 1 del mes actual hasta hoy
      desde = hoy.substring(0, 8) + '01'
    } else {
      // Semana en curso: del lunes hasta hoy.
      // Si hoy es miercoles, son 3 dias (lunes, martes, miercoles).
      const dow = diaDeLaSemana(hoy)
      const diasDesdeLunes = dow === 0 ? 6 : dow - 1
      desde = restarDias(hoy, diasDesdeLunes)
    }

    // 4. Traer las cocinadas del rango, con los datos de cada receta.
    //    El join trae titulo, emoji y macros desde recetas_generadas.
    const { data: cocinadas, error } = await supabase
      .from('cocinadas')
      .select('id, receta_id, cocinada_en, recetas_generadas(titulo, emoji, macros)')
      .eq('usuario_id', user.id)
      .gte('cocinada_en', desde + 'T00:00:00.000Z')
      .order('cocinada_en', { ascending: true })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'leer_fallo', mensaje: 'No pudimos leer tu menú' },
        { status: 500 }
      )
    }

    // 5. Agrupar por dia
    const porDia = {}

    for (const c of (cocinadas || [])) {
      // Si la receta fue borrada, el join viene vacio: la saltamos
      const r = c.recetas_generadas
      if (!r) continue

      const dia = diaMexico(c.cocinada_en)

      // Descartamos lo que quede fuera del rango por el ajuste de zona horaria
      if (dia < desde || dia > hoy) continue

      if (!porDia[dia]) {
        porDia[dia] = { fecha: dia, recetas: [], calorias_totales: 0, proteina_total: 0 }
      }

      const cal = Number(r.macros?.calorias) || 0
      const prot = Number(r.macros?.proteina_g) || 0

      porDia[dia].recetas.push({
        id: c.receta_id,
        titulo: r.titulo,
        emoji: r.emoji,
        calorias: cal,
        proteina_g: prot
      })

      porDia[dia].calorias_totales += cal
      porDia[dia].proteina_total += prot
    }

    // 6. Armar la lista completa de dias (incluyendo los vacios)
    const dias = []
    let cursor = desde
    while (cursor <= hoy) {
      dias.push(
        porDia[cursor] || { fecha: cursor, recetas: [], calorias_totales: 0, proteina_total: 0 }
      )
      cursor = restarDias(cursor, -1)
    }

    // 7. Totales del rango completo
    const totalCalorias = dias.reduce((s, d) => s + d.calorias_totales, 0)
    const totalRecetas = dias.reduce((s, d) => s + d.recetas.length, 0)
    const diasConCocina = dias.filter((d) => d.recetas.length > 0).length

    return NextResponse.json({
      ok: true,
      rango,
      desde,
      hasta: hoy,
      dias,
      resumen: {
        calorias_totales: totalCalorias,
        recetas_totales: totalRecetas,
        dias_cocinados: diasConCocina,
        promedio_calorias_dia: diasConCocina > 0 ? Math.round(totalCalorias / diasConCocina) : 0
      }
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
