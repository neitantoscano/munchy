import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Valores válidos (seguridad: validamos en servidor)
const OFICIOS = ['estudiante', 'trabajo8h', 'atleta', 'profesional', 'cocinero', 'libre']
const EJERCICIOS = ['nada', 'ocasional', 'frecuente', 'gymrat']

// Límites de texto libre
const APODO_MIN = 2
const APODO_MAX = 20
const CORREO_MAX = 120

// Formato básico de correo: algo@algo.algo
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Helper: limpia texto que llega del usuario ───
// Devuelve null si no es texto (evita que .trim() reviente con números u objetos).
function textoLimpio(valor) {
  if (typeof valor !== 'string') return null
  const limpio = valor.trim()
  return limpio === '' ? null : limpio
}

// ─── GET: leer el perfil del usuario ───
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // El detalle va a los logs de Vercel, no al usuario.
      console.error('perfil GET:', error.message)
      return NextResponse.json({ ok: false, error: 'lectura_fallo', mensaje: 'No pudimos leer tu perfil' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, perfil: data })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}

// ─── POST: guardar el oficio ───
export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const oficio = body?.oficio

    if (!OFICIOS.includes(oficio)) {
      return NextResponse.json({ ok: false, error: 'oficio_invalido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ oficio: oficio })
      .eq('id', user.id)

    if (error) {
      console.error('perfil POST:', error.message)
      return NextResponse.json({ ok: false, error: 'guardado_fallo', mensaje: 'No pudimos guardar tu oficio' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, oficio: oficio })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}

// ─── PATCH: actualizar nivel de ejercicio, apodo y/o correo ───
export async function PATCH(request) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'sin_sesion' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const cambios = {}

    // Nivel de ejercicio: solo valores de la lista
    if (body?.nivel_ejercicio !== undefined) {
      if (!EJERCICIOS.includes(body.nivel_ejercicio)) {
        return NextResponse.json({ ok: false, error: 'ejercicio_invalido' }, { status: 400 })
      }
      cambios.nivel_ejercicio = body.nivel_ejercicio
    }

    // Apodo: texto de 2 a 20 caracteres.
    // Sin límite, alguien podría mandar un megabyte de texto.
    if (body?.apodo !== undefined) {
      const apodo = textoLimpio(body.apodo)
      if (apodo === null) {
        return NextResponse.json(
          { ok: false, error: 'apodo_invalido', mensaje: 'Escribe un apodo válido' },
          { status: 400 }
        )
      }
      if (apodo.length < APODO_MIN || apodo.length > APODO_MAX) {
        return NextResponse.json(
          { ok: false, error: 'apodo_invalido', mensaje: `El apodo debe tener entre ${APODO_MIN} y ${APODO_MAX} caracteres` },
          { status: 400 }
        )
      }
      cambios.apodo = apodo
    }

    // Correo: formato básico y largo máximo.
    // OJO: esto solo cambia el correo de la tabla, NO el de inicio de sesión.
    if (body?.correo !== undefined) {
      const correo = textoLimpio(body.correo)
      if (correo === null || correo.length > CORREO_MAX || !FORMATO_CORREO.test(correo)) {
        return NextResponse.json(
          { ok: false, error: 'correo_invalido', mensaje: 'Escribe un correo válido' },
          { status: 400 }
        )
      }
      cambios.correo = correo.toLowerCase()
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ ok: false, error: 'sin_cambios' }, { status: 400 })
    }

    const { error } = await supabase
      .from('usuarios')
      .update(cambios)
      .eq('id', user.id)

    if (error) {
      console.error('perfil PATCH:', error.message)
      return NextResponse.json({ ok: false, error: 'actualizar_fallo', mensaje: 'No pudimos guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, cambios: cambios })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
