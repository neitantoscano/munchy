// app/api/receta/generar/route.js
// Endpoint principal de B7: genera (o reutiliza) una receta saludable.
// Flujo: sesion → perfil → ingredientes → cache → (IA si no hay) → guardar → devolver.
// El texto del chef vive en lib/prompt-chef.js

import { createServerSupabase } from '@/lib/supabase-server'
import { generarHashCache, calcularPerfilPorcion, normalizarPorciones } from '@/lib/cache-hash'
import { construirPromptChef } from '@/lib/prompt-chef'
import { incrementarContadorReceta } from '@/lib/rachas'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

// ─── Configuracion ───
const LIMITE_FREE = 2
const LIMITE_PRO = 20
const MODELO = 'claude-haiku-4-5'

const BASICOS_UNIVERSALES = [
  'huevo', 'tortilla de maíz', 'frijoles', 'avena', 'plátano',
  'jitomate', 'cebolla', 'ajo', 'pollo', 'arroz', 'atún en lata',
  'yogur natural', 'limón', 'leche', 'queso fresco'
]

const TIPOS_VALIDOS = [
  'desayuno', 'almuerzo', 'comida', 'cena',
  'postre', 'snack', 'gym_meal', 'otro'
]

// ─── Helper de fecha (Mexico UTC-6) para el limite diario ───
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

// ─── La receta contiene algun alergeno del usuario? ───
function contieneAlergeno(ingredientes, alergias) {
  if (!alergias || alergias.length === 0) return false
  const lista = (ingredientes || []).map((i) => String(i.nombre || '').toLowerCase())
  return alergias.some((a) => {
    const ale = String(a).toLowerCase().trim()
    return lista.some((nom) => nom.includes(ale))
  })
}

// ─── Decide estilo: 70% moderna, 30% clasica ───
function elegirEstilo() {
  return Math.random() < 0.7 ? 'moderna' : 'clasica'
}

// ─── Llamada a la IA. Devuelve la receta parseada, o null si falla ───
async function generarConIA({ tipoComida, textoLibre, estilo, ingredientes, alergias, perfilPorcion, porciones }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const sistema = construirPromptChef({ tipoComida, estilo, alergias, perfilPorcion, porciones })

  const pedidoLibre = tipoComida === 'otro' && textoLibre
    ? `El usuario pidió específicamente: "${textoLibre}".`
    : ''

  const usuario = `Crea una receta de tipo "${tipoComida}" para ${porciones} persona(s).
Ingredientes disponibles: ${ingredientes.join(', ')}.
${pedidoLibre}`

  try {
    const respuesta = await anthropic.messages.create({
      model: MODELO,
      max_tokens: 2000,
      system: sistema,
      messages: [{ role: 'user', content: usuario }]
    })

    const bloqueTexto = respuesta.content.find((b) => b.type === 'text')
    if (!bloqueTexto) return null

    let texto = bloqueTexto.text.trim()
    texto = texto.replace(/```json/g, '').replace(/```/g, '').trim()

    return JSON.parse(texto)

  } catch (err) {
    return null
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    // 1. Verificar sesion
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'sesion_no_encontrada', mensaje: 'Inicia sesión para generar recetas' },
        { status: 401 }
      )
    }

    // 2. Leer el body
    const body = await request.json().catch(() => ({}))
    const tipoComida = body.tipo_comida
    const esPrimeraVez = body.es_primera_vez === true
    const textoLibre = (body.texto_libre || '').toString().slice(0, 200)

    // Porciones: 1, 2 o 4. Si no llega o es invalido, usa 2.
    const porciones = normalizarPorciones(body.porciones)

    if (!TIPOS_VALIDOS.includes(tipoComida)) {
      return NextResponse.json(
        { ok: false, error: 'tipo_invalido', mensaje: 'Tipo de comida no válido' },
        { status: 400 }
      )
    }

    // 3. Leer datos del usuario (premium + contador + perfil)
    const { data: usuario, error: errUsuario } = await supabase
      .from('usuarios')
      .select('es_premium, recetas_hoy, fecha_contador, oficio, nivel_ejercicio')
      .eq('id', user.id)
      .single()

    if (errUsuario || !usuario) {
      return NextResponse.json(
        { ok: false, error: 'sesion_no_encontrada', mensaje: 'No encontramos tu perfil' },
        { status: 404 }
      )
    }

    const hoy = fechaMexico()
    const usadasHoy =
      usuario.fecha_contador && String(usuario.fecha_contador).substring(0, 10) === hoy
        ? (usuario.recetas_hoy || 0)
        : 0

    const limiteDelUsuario = usuario.es_premium ? LIMITE_PRO : LIMITE_FREE

    // Perfil de porcion: agrupa oficio + ejercicio en ligero / normal / alto
    const perfilPorcion = calcularPerfilPorcion(usuario.oficio, usuario.nivel_ejercicio)

    // 4. Leer alergias del usuario
    const { data: alergiasData } = await supabase
      .from('alergias')
      .select('tipo')
      .eq('usuario_id', user.id)
    const alergias = (alergiasData || []).map((a) => a.tipo)

    // 5. Armar la lista de ingredientes disponibles
    let ingredientesDisponibles
    if (esPrimeraVez) {
      ingredientesDisponibles = BASICOS_UNIVERSALES
    } else {
      const { data: despensaData } = await supabase
        .from('despensa')
        .select('nombre_ingrediente')
        .eq('usuario_id', user.id)
      ingredientesDisponibles = (despensaData || []).map((d) => d.nombre_ingrediente)

      if (ingredientesDisponibles.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'sin_ingredientes', mensaje: 'Agrega ingredientes a tu despensa primero' },
          { status: 400 }
        )
      }
    }

    // 6. Generar el hash y buscar en cache
    const hash = generarHashCache(ingredientesDisponibles, tipoComida, perfilPorcion, porciones)

    const { data: cacheHit } = await supabase
      .from('recetas_cache')
      .select('id, receta_completa, veces_usada')
      .eq('ingredientes_hash', hash)
      .maybeSingle()

    let recetaFinal = null
    let vinoDeCache = false

    if (cacheHit && cacheHit.receta_completa) {
      const recetaCache = cacheHit.receta_completa
      // Seguridad: si la receta del cache trae un alergeno del usuario, la ignoramos
      if (!contieneAlergeno(recetaCache.ingredientes, alergias)) {
        recetaFinal = recetaCache
        vinoDeCache = true
        await supabase
          .from('recetas_cache')
          .update({ veces_usada: (cacheHit.veces_usada || 1) + 1 })
          .eq('id', cacheHit.id)
      }
    }

    // 7. Si NO vino de cache → revisar limite y llamar a la IA
    if (!recetaFinal) {
      if (usadasHoy >= limiteDelUsuario) {
        const mensajeLimite = usuario.es_premium
          ? `Llegaste a tus ${LIMITE_PRO} recetas de hoy. Vuelve mañana 🌙`
          : `Llegaste a tus ${LIMITE_FREE} recetas de hoy. Hazte Pro para más recetas 🚀`

        return NextResponse.json(
          { ok: false, error: 'limite_diario', mensaje: mensajeLimite },
          { status: 403 }
        )
      }

      const estilo = elegirEstilo()
      const recetaIA = await generarConIA({
        tipoComida,
        textoLibre,
        estilo,
        ingredientes: ingredientesDisponibles,
        alergias,
        perfilPorcion,
        porciones
      })

      if (!recetaIA) {
        return NextResponse.json(
          { ok: false, error: 'generacion_fallo', mensaje: 'No pudimos crear tu receta, intenta de nuevo' },
          { status: 502 }
        )
      }

      recetaIA.estilo = estilo
      // Forzamos las porciones pedidas (por si la IA puso otro numero)
      recetaIA.porciones = porciones

      // Seguridad final: si la IA ignoro las alergias, no servimos la receta
      if (contieneAlergeno(recetaIA.ingredientes, alergias)) {
        return NextResponse.json(
          { ok: false, error: 'alergia_detectada', mensaje: 'No pudimos crear una receta segura para tus alergias. Intenta otro tipo de comida.' },
          { status: 409 }
        )
      }

      recetaFinal = recetaIA

      // Guardar en cache (compartida para todos)
      await supabase
        .from('recetas_cache')
        .upsert(
          {
            ingredientes_hash: hash,
            tipo_comida: tipoComida,
            receta_completa: recetaFinal,
            veces_usada: 1
          },
          { onConflict: 'ingredientes_hash' }
        )

      await incrementarContadorReceta(supabase, user.id)
    }

    // 8. Guardar la receta en el historial del usuario
    const { data: recetaGuardada, error: errInsert } = await supabase
      .from('recetas_generadas')
      .insert({
        usuario_id: user.id,
        titulo: recetaFinal.titulo,
        emoji: recetaFinal.emoji,
        imagen_url: null,
        estilo: recetaFinal.estilo || 'moderna',
        tiempo_minutos: recetaFinal.tiempo_minutos,
        porciones: recetaFinal.porciones || porciones,
        descripcion: recetaFinal.descripcion,
        ingredientes: recetaFinal.ingredientes,
        ingredientes_pro: recetaFinal.ingredientes_pro || [],
        instrucciones: recetaFinal.instrucciones,
        macros: recetaFinal.macros,
        alergias_presentes: []
      })
      .select()
      .single()

    if (errInsert || !recetaGuardada) {
      return NextResponse.json(
        { ok: false, error: 'guardar_fallo', mensaje: 'No pudimos guardar tu receta' },
        { status: 500 }
      )
    }

    // 9. Calcular recetas restantes para hoy
    const usadasFinal = vinoDeCache ? usadasHoy : usadasHoy + 1
    const recetasRestantes = Math.max(0, limiteDelUsuario - usadasFinal)

    // 10. Devolver la receta con la forma que espera el frontend
    return NextResponse.json({
      ok: true,
      receta: {
        id: recetaGuardada.id,
        titulo: recetaGuardada.titulo,
        emoji: recetaGuardada.emoji,
        imagen_url: null,
        estilo: recetaGuardada.estilo,
        tiempo_minutos: recetaGuardada.tiempo_minutos,
        porciones: recetaGuardada.porciones,
        descripcion: recetaGuardada.descripcion,
        ingredientes: recetaGuardada.ingredientes,
        ingredientes_pro: recetaGuardada.ingredientes_pro,
        instrucciones: recetaGuardada.instrucciones,
        macros: recetaGuardada.macros,
        alergias_presentes: [],
        guardada: false
      },
      recetas_restantes_hoy: recetasRestantes
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'servidor', mensaje: 'Algo salió mal, intenta de nuevo' },
      { status: 500 }
    )
  }
}
