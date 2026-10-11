// lib/rate-limit.js
// Limita cuántas veces se puede intentar algo en un rato.
// Evita que alguien pruebe contraseñas sin parar o inunde de correos.
//
// Se guarda en Supabase, no en memoria: Vercel levanta y apaga servidores,
// y un contador en memoria se perdería a cada rato.

import { createAdminSupabase } from '@/lib/supabase-admin'

/**
 * Saca la IP real de quien llama.
 * En Vercel viene en 'x-forwarded-for' (puede traer varias separadas por coma;
 * la primera es la del usuario).
 */
export function obtenerIP(request) {
  const forwarded = request.headers.get('x-forwarded-for') || ''
  const primera = forwarded.split(',')[0].trim()
  return primera || request.headers.get('x-real-ip') || 'desconocida'
}

/**
 * Revisa si se pasó del límite y, si no, anota el intento.
 *
 * @param {string} llave - A quién se le cuenta (IP o correo)
 * @param {string} accion - 'login' | 'registro' | 'recuperar'
 * @param {number} maximo - Intentos permitidos en la ventana
 * @param {number} minutos - Tamaño de la ventana de tiempo
 * @returns {Promise<{permitido: boolean, restantes: number}>}
 *
 * Si la consulta falla, DEJA PASAR. Preferimos que la app siga
 * funcionando a que un error de base bloquee a todos los usuarios.
 */
export async function revisarLimite(llave, accion, maximo, minutos) {
  try {
    const admin = createAdminSupabase()

    const desde = new Date(Date.now() - minutos * 60 * 1000).toISOString()

    // Contar intentos recientes de esta llave
    const { count, error } = await admin
      .from('intentos')
      .select('*', { count: 'exact', head: true })
      .eq('llave', llave)
      .eq('accion', accion)
      .gte('creado_en', desde)

    if (error) {
      console.error('rate-limit contar:', error.message)
      return { permitido: true, restantes: maximo }
    }

    const usados = count || 0

    if (usados >= maximo) {
      return { permitido: false, restantes: 0 }
    }

    // Anotar este intento
    await admin.from('intentos').insert({ llave: llave, accion: accion })

    // Limpieza ocasional: 1 de cada 20 veces borra lo viejo.
    // Así la tabla no crece para siempre sin necesitar una tarea aparte.
    if (Math.random() < 0.05) {
      const viejo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      await admin.from('intentos').delete().lt('creado_en', viejo)
    }

    return { permitido: true, restantes: maximo - usados - 1 }

  } catch (err) {
    console.error('rate-limit:', err?.message)
    return { permitido: true, restantes: maximo }
  }
}

/**
 * Respuesta estándar cuando alguien se pasó del límite.
 */
export function respuestaLimite(minutos) {
  return {
    ok: false,
    error: 'demasiados_intentos',
    mensaje: `Demasiados intentos. Espera ${minutos} minutos e intenta de nuevo.`,
  }
}
