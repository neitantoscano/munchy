// lib/rachas.js
// Dos cosas independientes:
// - incrementarContadorReceta: sube el contador diario al GENERAR. No toca la racha.
// - actualizarRachaPorCocina: sube la racha al CONFIRMAR COCINA. No toca el contador.

// Hitos de racha que disparan celebración en la pantalla.
export const HITOS_RACHA = [5, 15, 35, 75, 100]

// Fecha de hoy en México (UTC-6) como "AAAA-MM-DD"
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

// Días entre dos fechas "AAAA-MM-DD"
function diferenciaDias(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio + 'T00:00:00Z')
  const fin = new Date(fechaFin + 'T00:00:00Z')
  return Math.round((fin - inicio) / (1000 * 60 * 60 * 24))
}

/**
 * Sube el contador de recetas del día. Se llama al GENERAR una receta.
 * Si es un día nuevo, reinicia el contador en 1.
 */
export async function incrementarContadorReceta(supabase, usuarioId) {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('recetas_hoy, fecha_contador, recetas_generadas_total')
      .eq('id', usuarioId)
      .single()

    if (error || !usuario) {
      return { ok: false, error: 'usuario_no_encontrado' }
    }

    const hoy = fechaMexico()
    const esMismoDia =
      usuario.fecha_contador && String(usuario.fecha_contador).substring(0, 10) === hoy

    const nuevasHoy = esMismoDia ? (usuario.recetas_hoy || 0) + 1 : 1

    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        recetas_hoy: nuevasHoy,
        fecha_contador: hoy,
        recetas_generadas_total: (usuario.recetas_generadas_total || 0) + 1
      })
      .eq('id', usuarioId)

    if (errorUpdate) {
      return { ok: false, error: 'update_fallo' }
    }

    return { ok: true, recetas_hoy: nuevasHoy }

  } catch (err) {
    return { ok: false, error: 'servidor' }
  }
}

/**
 * Sube la racha 🔥. Se llama al CONFIRMAR que se cocinó algo.
 *
 * Reglas:
 * - Mismo día: la racha NO cambia (aunque cocine 5 recetas).
 * - Día siguiente: +1.
 * - Se saltó uno o más días: la racha se reinicia en 1.
 * - racha_record solo sube, nunca baja.
 *
 * Devuelve 'hito_alcanzado' con el número (5, 15, 35, 75, 100) cuando la racha
 * llega exactamente a uno de esos valores. En cualquier otro caso, null.
 */
export async function actualizarRachaPorCocina(supabase, usuarioId) {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('racha_dias, racha_record, ultima_visita')
      .eq('id', usuarioId)
      .single()

    if (error || !usuario) {
      return { ok: false, error: 'usuario_no_encontrado' }
    }

    const hoy = fechaMexico()
    let nuevaRacha = usuario.racha_dias || 0

    // ¿Ya había cocinado antes?
    const yaHabiaCocinado = nuevaRacha > 0 && usuario.ultima_visita

    if (yaHabiaCocinado) {
      const ultima = String(usuario.ultima_visita).substring(0, 10)
      const dias = diferenciaDias(ultima, hoy)

      if (dias === 0) {
        // Ya cocinó hoy: la racha no se mueve, pero tampoco es un error.
        return {
          ok: true,
          racha_nueva: nuevaRacha,
          racha_nueva_record: false,
          hito_alcanzado: null
        }
      } else if (dias === 1) {
        nuevaRacha = nuevaRacha + 1   // Día seguido
      } else {
        nuevaRacha = 1                // Se saltó días: vuelve a empezar
      }
    } else {
      nuevaRacha = 1                  // Primera vez que cocina
    }

    // El récord solo sube
    const recordAnterior = usuario.racha_record || 0
    const nuevoRecord = Math.max(recordAnterior, nuevaRacha)
    const esNuevoRecord = nuevaRacha > recordAnterior

    // ¿Cayó justo en un hito? Solo cuenta la primera vez que lo toca,
    // porque la racha sube de uno en uno.
    const hito = HITOS_RACHA.includes(nuevaRacha) ? nuevaRacha : null

    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        racha_dias: nuevaRacha,
        racha_record: nuevoRecord,
        ultima_visita: hoy
      })
      .eq('id', usuarioId)

    if (errorUpdate) {
      return { ok: false, error: 'update_fallo' }
    }

    return {
      ok: true,
      racha_nueva: nuevaRacha,
      racha_nueva_record: esNuevoRecord,
      hito_alcanzado: hito
    }

  } catch (err) {
    return { ok: false, error: 'servidor' }
  }
}
