import { createServerSupabase } from '@/lib/supabase-server'
import { obtenerIP, revisarLimite, respuestaLimite } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Límites: 8 intentos por IP y 5 por correo, en 15 minutos.
// Dos llaves a propósito: una red compartida (escuela, café) no debe
// bloquear a todos, pero un correo concreto sí se protege más fuerte.
const MAX_POR_IP = 8
const MAX_POR_CORREO = 5
const VENTANA_MIN = 15

// Inicia sesión con correo + contraseña de una cuenta ya existente.
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    let correo = ''
    let contrasena = ''
    try {
      const body = await request.json()
      correo = (body?.correo || '').trim().toLowerCase()
      contrasena = body?.contrasena || ''
    } catch {
      return NextResponse.json(
        { ok: false, error: 'datos_invalidos', mensaje: 'Faltan datos' },
        { status: 400 }
      )
    }

    if (!correo || !contrasena) {
      return NextResponse.json(
        { ok: false, error: 'datos_incompletos', mensaje: 'Escribe tu correo y contraseña' },
        { status: 400 }
      )
    }

    // ─── Límite de intentos ───
    const ip = obtenerIP(request)

    const porIP = await revisarLimite(ip, 'login_ip', MAX_POR_IP, VENTANA_MIN)
    if (!porIP.permitido) {
      return NextResponse.json(respuestaLimite(VENTANA_MIN), { status: 429 })
    }

    const porCorreo = await revisarLimite(correo, 'login_correo', MAX_POR_CORREO, VENTANA_MIN)
    if (!porCorreo.permitido) {
      return NextResponse.json(respuestaLimite(VENTANA_MIN), { status: 429 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    })

    if (error) {
      // Mensaje genérico a propósito: no revelamos si el correo existe o no.
      return NextResponse.json(
        { ok: false, error: 'credenciales_invalidas', mensaje: 'Correo o contraseña incorrectos' },
        { status: 401 }
      )
    }

    if (!data?.user) {
      return NextResponse.json(
        { ok: false, error: 'sin_usuario', mensaje: 'No se pudo iniciar sesión' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
