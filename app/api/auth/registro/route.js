import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { obtenerIP, revisarLimite, respuestaLimite } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Limite: 5 cuentas nuevas por IP en 60 minutos.
// Sin esto, un bot podria crear miles de cuentas basura.
const MAX_POR_IP = 5
const VENTANA_MIN = 60

// Crea una cuenta nueva con correo + contraseña.
// La fila en 'usuarios' se escribe con el cliente admin, porque al momento
// del registro todavía no hay sesión activa y RLS bloquearía el insert.
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

    if (!correo || !correo.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'correo_invalido', mensaje: 'Escribe un correo válido' },
        { status: 400 }
      )
    }

    if (contrasena.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'contrasena_corta', mensaje: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    if (contrasena.length > 25) {
      return NextResponse.json(
        { ok: false, error: 'contrasena_larga', mensaje: 'La contraseña no puede pasar de 25 caracteres' },
        { status: 400 }
      )
    }

    // Limite de cuentas nuevas por IP
    const ip = obtenerIP(request)
    const porIP = await revisarLimite(ip, 'registro_ip', MAX_POR_IP, VENTANA_MIN)
    if (!porIP.permitido) {
      return NextResponse.json(respuestaLimite(VENTANA_MIN), { status: 429 })
    }

    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'registro_fallo', mensaje: 'No pudimos crear tu cuenta' },
        { status: 400 }
      )
    }

    if (!data?.user) {
      return NextResponse.json(
        { ok: false, error: 'sin_usuario', mensaje: 'No se pudo crear la cuenta' },
        { status: 500 }
      )
    }

    const userId = data.user.id

    // Cliente ADMIN para saltar RLS: aún no hay sesión activa al registrarse.
    const admin = createAdminSupabase()

    const { error: errorPerfil } = await admin
      .from('usuarios')
      .upsert({ id: userId, correo: correo }, { onConflict: 'id' })

    if (errorPerfil) {
      console.error('auth registro perfil:', errorPerfil.message)
      return NextResponse.json(
        { ok: false, error: 'perfil_fallo', mensaje: 'No pudimos crear tu perfil' },
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
