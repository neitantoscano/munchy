// lib/rachas.js
// Sistema de rachas y contador diario de Munchy 🔥
// Dos funciones independientes:
//   1. incrementarContadorReceta → al GENERAR (sube el límite diario)
//   2. actualizarRachaPorCocina  → al CONFIRMAR COCINA (sube la racha)

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

// ════════════════════════════════════════════
// FUNCIÓN 1: Contador del límite diario
// Se llama al GENERAR una receta (caché o IA).
// Sube recetas_hoy y el total. Reinicia el contador si es día nuevo.
// NO toca la racha.
// ════════════════════════════════════════════
export async function incrementarContadorReceta(supabase, userId) {
  try {
    // 1. Leer el estado actual del usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('recetas_hoy, recetas_generadas_total, fecha_contador')
      .eq('id', userId)
      .single()

    if (error || !usuario) {
      return { ok: false, error: 'usuario_no_encontrado' }
    }

    const hoy = fechaMexico()

    // ¿Cuándo fue la última receta contada? (solo la parte AAAA-MM-DD)
    const ultimoConteo = usuario.fecha_contador
      ? String(usuario.fecha_contador).substring(0, 10)
      : null

    let nuevoRecetasHoy
    if (ultimoConteo !== hoy) {
      // Día nuevo (o primera receta) → el contador arranca en 1
      nuevoRecetasHoy = 1
    } else {
      // Mismo día → suma una receta más
      nuevoRecetasHoy = (usuario.recetas_hoy || 0) + 1
    }

    const nuevoTotal = (usuario.recetas_generadas_total || 0) + 1

    // 2. Guardar
    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        recetas_hoy: nuevoRecetasHoy,
        recetas_generadas_total: nuevoTotal,
        fecha_contador: hoy,
        primera_vez: false
      })
      .eq('id', userId)

    if (errorUpdate) {
      return { ok: false, error: 'actualizar_fallo', mensaje: errorUpdate.message }
    }

    return {
      ok: true,
      recetas_hoy: nuevoRecetasHoy
    }

  } catch (err) {
    return { ok: false, error: 'servidor', mensaje: err.message }
  }
}

// ════════════════════════════════════════════
// FUNCIÓN 2: Racha 🔥
// Se llama al CONFIRMAR COCINA (botón "Ya cociné esto").
// Sube la racha según los días consecutivos cocinando.
// NO toca el contador diario.
// ════════════════════════════════════════════
export async function actualizarRachaPorCocina(supabase, userId) {
  try {
    // 1. Leer el estado actual del usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('racha_dias, racha_record, ultima_visita')
      .eq('id', userId)
      .single()

    if (error || !usuario) {
      return { ok: false, error: 'usuario_no_encontrado' }
    }

    const hoy = fechaMexico()

    let nuevaRacha = usuario.racha_dias || 0
    let nuevoRecord = usuario.racha_record || 0

    // ultima_visita ahora significa "último día que cocinó".
    // Usamos null si la racha está en 0, porque eso significa que
    // todavía no ha cocinado nada (aunque ya tenga ultima_visita
    // por el registro inicial del usuario).
    const yaHabiaCocinado = nuevaRacha > 0 && usuario.ultima_visita

    if (!yaHabiaCocinado) {
      // Primera vez que cocina → racha arranca en 1
      nuevaRacha = 1
    } else {
      // Comparar con la última cocinada
      const ultimaFecha = String(usuario.ultima_visita).substring(0, 10)
      const dias = diferenciaDias(ultimaFecha, hoy)

      if (dias === 0) {
        // Ya cocinó hoy → la racha no cambia
      } else if (dias === 1) {
        // Día consecutivo → racha sube
        nuevaRacha = nuevaRacha + 1
      } else {
        // Saltó días → racha se reinicia a 1 (hoy cuenta)
        nuevaRacha = 1
      }
    }

    // ¿Esta cocinada rompió récord?
    const esNuevoRecord = nuevaRacha > nuevoRecord
    if (esNuevoRecord) {
      nuevoRecord = nuevaRacha
    }

    // 2. Guardar
    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        racha_dias: nuevaRacha,
        racha_record: nuevoRecord,
        ultima_visita: hoy
      })
      .eq('id', userId)

    if (errorUpdate) {
      return { ok: false, error: 'actualizar_fallo', mensaje: errorUpdate.message }
    }

    return {
      ok: true,
      racha_nueva: nuevaRacha,
      racha_nueva_record: esNuevoRecord
    }

  } catch (err) {
    return { ok: false, error: 'servidor', mensaje: err.message }
  }
}
