// app/api/usuario/consentimiento/route.js
// POST: guarda constancia de que el usuario aceptó el Aviso de Privacidad,
// los Términos, y dio consentimiento expreso para tratar sus datos sensibles
// (alergias, art. 9 LFPDPPP).
//
// Se guarda un renglón NUEVO cada vez. Nunca se sobrescribe: si el aviso
// cambia y el usuario vuelve a aceptar, quedan las dos constancias.
//
// La IP y el user_agent se leen de los headers, no del body:
// un dato que el cliente puede inventar no sirve como evidencia.

import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    // 1. Verificar sesión
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sin_sesion', mensaje: 'Inicia sesión' },
        { status: 401 }
      )
    }

    // 2. Leer el body
    const body = await request.json().catch(() => ({}))

    const aceptoPrivacidad = body.acepto_privacidad === true
    const aceptoDatosSensibles = body.acepto_datos_sensibles === true
    const version = (body.version_documentos || '').toString().trim().slice(0, 50)

    // La versión es obligatoria: sin ella no sabemos QUÉ aceptó el usuario,
    // y la constancia pierde su valor.
    if (!version) {
      return NextResponse.json(
        { ok: false, error: 'falta_version', mensaje: 'Falta la versión de los documentos' },
        { status: 400 }
      )
    }

    // 3. Sacar IP y navegador de los headers.
    //    En Vercel la IP real viene en 'x-forwarded-for' (puede traer varias
    //    separadas por coma; la primera es la del usuario).
    const forwarded = request.headers.get('x-forwarded-for') || ''
    const ip = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || null
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 500) || null

    // 4. Guardar la constancia
    const { error } = await supabase
      .from('consentimientos')
      .insert({
        usuario_id: user.id,
        acepto_privacidad: aceptoPrivacidad,
        acepto_datos_sensibles: aceptoDatosSensibles,
        version_documentos: version,
        ip: ip,
        user_agent: userAgent
      })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'guardar_fallo', mensaje: 'No pudimos registrar tu aceptación' },
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
