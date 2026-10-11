import { createServerSupabase } from '@/lib/supabase-server'
import { obtenerIP, revisarLimite, respuestaLimite } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Límites: 5 correos por IP y 3 por dirección, en 60 minutos.
// Sin esto, alguien podría inundar de correos a una persona.
const MAX_POR_IP = 5
const MAX_POR_CORREO = 3
const VENTANA_MIN = 60

// Envía un correo con el link para restablecer la contraseña.
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    let correo = ''
    try {
      const body = await request.json()
      correo = (body?.correo || '').trim().toLowerCase()
    } catch {
      return NextResponse.json(
        { ok: false, error: 'datos_invalidos', mensaje: 'Faltan datos' },
        { status: 400 }
      )
    }

    if (!correo || !correo.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'correo_invalido', mensaje: 'Escribe un correo válido' },
        { status: 400 }
      )
    }

    // ─── Límite de envíos ───
    const ip = obtenerIP(request)

    const porIP = await revisarLimite(ip, 'recuperar_ip', MAX_POR_IP, VENTANA_MIN)
    if (!porIP.permitido) {
      return NextResponse.json(respuestaLimite(VENTANA_MIN), { status: 429 })
    }

    const porCorreo = await revisarLimite(correo, 'recuperar_correo', MAX_POR_CORREO, VENTANA_MIN)
    if (!porCorreo.permitido) {
      return NextResponse.json(respuestaLimite(VENTANA_MIN), { status: 429 })
    }

    await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: 'https://munchy-xi.vercel.app/nueva-contrasena',
    })

    // Respondemos ok siempre, exista o no el correo.
    // Así nadie puede usar esto para descubrir qué correos están registrados.
    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal' },
      { status: 500 }
    )
  }
}
