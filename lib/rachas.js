// ─── Helpers de fecha (zona México UTC-6) ───

// Devuelve la fecha actual en México como string "AAAA-MM-DD"
function fechaMexico() {
  const ahora = new Date()
  // México es UTC-6 (sin horario de verano desde 2022)
  const offsetMexico = -6 * 60 // minutos
  const ajuste = (ahora.getTimezoneOffset() + offsetMexico) * 60 * 1000
  const fechaMex = new Date(ahora.getTime() + ajuste)

  const ano = fechaMex.getUTCFullYear()
  const mes = String(fechaMex.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(fechaMex.getUTCDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

// Calcula los días entre dos fechas "AAAA-MM-DD"
function diferenciaDias(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio + 'T00:00:00Z')
  const fin = new Date(fechaFin + 'T00:00:00Z')
  return Math.round((fin - inicio) / (1000 * 60 * 60 * 24))
}

// ─── Lógica principal: actualizar racha al generar una receta ───
// Se llama cada vez que el usuario genera una receta nueva.
// Devuelve { racha_dias, racha_record, recetas_hoy } actualizados.
export async function actualizarRachaPorGeneracion(supabase, userId) {
  try {
    // 1. Leer el estado actual del usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('racha_dias, racha_record, ultima_visita, recetas_hoy, recetas_generadas_total')
      .eq('id', userId)
      .single()

    if (error || !usuario) {
      return { ok: false, error: 'usuario_no_encontrado' }
    }

    const hoy = fechaMexico()

    let nuevaRacha = usuario.racha_dias || 0
    let nuevoRecord = usuario.racha_record || 0
    let nuevoRecetasHoy = (usuario.recetas_hoy || 0) + 1
    const nuevoTotal = (usuario.recetas_generadas_total || 0) + 1

    if (!usuario.ultima_visita) {
      // Primera vez que genera
      nuevaRacha = 1
      nuevoRecetasHoy = 1
    } else {
      // Comparar con la última visita
      const ultimaFecha = String(usuario.ultima_visita).substring(0, 10)
      const dias = diferenciaDias(ultimaFecha, hoy)

      if (dias === 0) {
        // Mismo día → la racha no cambia, solo cuenta la receta
      } else if (dias === 1) {
        // Día consecutivo → racha sube
        nuevaRacha = nuevaRacha + 1
        nuevoRecetasHoy = 1
      } else {
        // Saltó días → racha se reinicia a 1 (hoy cuenta)
        nuevaRacha = 1
        nuevoRecetasHoy = 1
      }
    }

    // Actualizar récord si la racha actual lo supera
    if (nuevaRacha > nuevoRecord) {
      nuevoRecord = nuevaRacha
    }

    // 2. Guardar los nuevos valores
    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        racha_dias: nuevaRacha,
        racha_record: nuevoRecord,
        recetas_hoy: nuevoRecetasHoy,
        recetas_generadas_total: nuevoTotal,
        ultima_visita: hoy,
        primera_vez: false
      })
      .eq('id', userId)

    if (errorUpdate) {
      return { ok: false, error: 'actualizar_fallo', mensaje: errorUpdate.message }
    }

    return {
      ok: true,
      racha_dias: nuevaRacha,
      racha_record: nuevoRecord,
      recetas_hoy: nuevoRecetasHoy
    }

  } catch (err) {
    return { ok: false, error: 'servidor', mensaje: err.message }
  }
}
