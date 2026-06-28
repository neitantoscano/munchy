// app/api/receta/generar/route.js
// Endpoint principal de B7: genera (o reutiliza) una receta saludable.
// Flujo: sesión → ingredientes → caché → (IA si no hay) → guardar → devolver.

import { createServerSupabase } from '@/lib/supabase-server'
import { generarHashCache } from '@/lib/cache-hash'
import { incrementarContadorReceta } from '@/lib/rachas'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

// ─── Configuración ───
const LIMITE_FREE = 3 // recetas con IA por día (plan free)
const MODELO = 'claude-haiku-4-5'

// Básicos universales (para la primera receta, despensa vacía)
const BASICOS_UNIVERSALES = [
  'huevo', 'tortilla de maíz', 'frijoles', 'avena', 'plátano',
  'jitomate', 'cebolla', 'ajo', 'pollo', 'arroz', 'atún en lata',
  'yogur natural', 'limón', 'leche', 'queso fresco'
]

// Tipos de comida válidos (deben coincidir con el frontend)
const TIPOS_VALIDOS = [
  'desayuno', 'almuerzo', 'comida', 'cena',
  'postre', 'snack', 'gym_meal', 'otro'
]

// ─── Helper de fecha (México UTC-6) para el límite diario ───
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

// ─── ¿La receta contiene algún alérgeno del usuario? ───
function contieneAlergeno(ingredientes, alergias) {
  if (!alergias || alergias.length === 0) return false
  const lista = (ingredientes || []).map((i) => String(i.nombre || '').toLowerCase())
  return alergias.some((a) => {
    const ale = String(a).toLowerCase().trim()
    return lista.some((nom) => nom.includes(ale))
  })
}

// ─── Decide estilo: 70% moderna, 30% clásica ───
function elegirEstilo() {
  return Math.random() < 0.7 ? 'moderna' : 'clasica'
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabase()

    // 1. Verificar sesión
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

    if (!TIPOS_VALIDOS.includes(tipoComida)) {
      return NextResponse.json(
        { ok: false, error: 'tipo_invalido', mensaje: 'Tipo de comida no válido' },
        { status: 400 }
      )
    }

    // 3. Leer datos del usuario (premium + contador)
    const { data: usuario, error: errUsuario } = await supabase
      .from('usuarios')
      .select('es_premium, recetas_hoy, fecha_contador')
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

    // 6. Generar el hash y buscar en caché
    const hash = generarHashCache(ingredientesDisponibles, tipoComida)

    const { data: cacheHit } = await supabase
      .from('recetas_cache')
      .select('id, receta_completa, veces_usada')
      .eq('ingredientes_hash', hash)
      .maybeSingle()

    let recetaFinal = null
    let vinoDeCache = false

    if (cacheHit && cacheHit.receta_completa) {
      const recetaCache = cacheHit.receta_completa
      // Seguridad: si la receta del caché trae un alérgeno del usuario, la ignoramos
      if (!contieneAlergeno(recetaCache.ingredientes, alergias)) {
        recetaFinal = recetaCache
        vinoDeCache = true
        // Subir el contador de "veces usada" del caché
        await supabase
          .from('recetas_cache')
          .update({ veces_usada: (cacheHit.veces_usada || 1) + 1 })
          .eq('id', cacheHit.id)
      }
    }

    // 7. Si NO vino de caché → revisar límite y llamar a la IA
    if (!recetaFinal) {
      // Límite diario (solo aplica a generación con IA, y solo a free)
      if (!usuario.es_premium && usadasHoy >= LIMITE_FREE) {
        return NextResponse.json(
          { ok: false, error: 'limite_diario', mensaje: 'Llegaste a tus 3 recetas de hoy. Hazte Pro para recetas ilimitadas 🚀' },
          { status: 403 }
        )
      }

      const estilo = elegirEstilo()
      const recetaIA = await generarConIA({
        tipoComida,
        textoLibre,
        estilo,
        ingredientes: ingredientesDisponibles,
        alergias
      })

      if (!recetaIA) {
        return NextResponse.json(
          { ok: false, error: 'generacion_fallo', mensaje: 'No pudimos crear tu receta, intenta de nuevo' },
          { status: 502 }
        )
      }

      // Forzamos el estilo elegido (por si la IA lo cambió)
      recetaIA.estilo = estilo

      // Seguridad final: si la IA ignoró las alergias, no servimos la receta
      if (contieneAlergeno(recetaIA.ingredientes, alergias)) {
        return NextResponse.json(
          { ok: false, error: 'alergia_detectada', mensaje: 'No pudimos crear una receta segura para tus alergias. Intenta otro tipo de comida.' },
          { status: 409 }
        )
      }

      recetaFinal = recetaIA

      // Guardar en caché (compartida para todos)
      await supabase
        .from('recetas_cache')
        .insert({
          ingredientes_hash: hash,
          tipo_comida: tipoComida,
          receta_completa: recetaFinal,
          veces_usada: 1
        })

      // Subir el contador diario del usuario (solo cuando se usó IA)
      await incrementarContadorReceta(supabase, user.id)
    }

    // 8. Guardar la receta en el historial del usuario (recetas_generadas)
    const { data: recetaGuardada, error: errInsert } = await supabase
      .from('recetas_generadas')
      .insert({
        usuario_id: user.id,
        titulo: recetaFinal.titulo,
        emoji: recetaFinal.emoji,
        imagen_url: null,
        estilo: recetaFinal.estilo || 'moderna',
        tiempo_minutos: recetaFinal.tiempo_minutos,
        porciones: recetaFinal.porciones,
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
    let recetasRestantes
    if (usuario.es_premium) {
      recetasRestantes = 999 // ilimitado
    } else {
      const usadasFinal = vinoDeCache ? usadasHoy : usadasHoy + 1
      recetasRestantes = Math.max(0, LIMITE_FREE - usadasFinal)
    }

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

// ════════════════════════════════════════════
// Llamada a la IA (Claude Haiku) que crea la receta.
// Devuelve el objeto receta ya parseado, o null si falla.
// ════════════════════════════════════════════
async function generarConIA({ tipoComida, textoLibre, estilo, ingredientes, alergias }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const listaIngredientes = ingredientes.join(', ')
  const listaAlergias = alergias && alergias.length > 0 ? alergias.join(', ') : 'ninguna'
  const pedidoLibre = tipoComida === 'otro' && textoLibre
    ? `El usuario pidió específicamente: "${textoLibre}".`
    : ''

  const sistema = `Eres el chef de Munchy, una app de recetas saludables para la Gen Z mexicana.
Creas recetas saludables pero antojables, en español de México.
Estilo "${estilo}": si es "moderna", recetas estilo TikTok, modernas y virales; si es "clasica", recetas tradicionales mexicanas en versión saludable.
Saludable Gen Z = papas al horno SÍ, Takis NO. Nada de comida chatarra.
Sugiere 1 o 2 ingredientes "Nivel Pro" que suban la receta de nivel.

REGLAS ESTRICTAS:
- NUNCA uses estos ingredientes (alergias del usuario): ${listaAlergias}.
- Usa principalmente los ingredientes disponibles. Puedes asumir 1-2 básicos comunes (sal, aceite, especias).
- Las instrucciones deben tener entre 4 y 6 pasos.
- CADA paso debe tener aproximadamente 33 palabras (dos oraciones): la primera dice qué hacer, la segunda da un detalle útil, tip o punto a cuidar. Ni muy corto ni un párrafo largo.
- Responde SOLO con un objeto JSON válido. Sin texto antes ni después. Sin backticks. Sin markdown.

FORMATO EXACTO del JSON:
{
  "titulo": "string corto y antojable",
  "emoji": "un solo emoji",
  "estilo": "${estilo}",
  "tiempo_minutos": numero,
  "porciones": numero,
  "descripcion": "string de 1 linea",
  "ingredientes": [{ "nombre": "string", "cantidad": "string con unidad, ej: 2 tazas" }],
  "ingredientes_pro": [{ "nombre": "string", "cantidad": "string", "razon": "por que sube nivel" }],
  "instrucciones": ["paso de ~33 palabras", "paso de ~33 palabras"],
  "macros": { "proteina_g": numero, "carbos_g": numero, "grasas_g": numero, "calorias": numero, "azucar_g": numero, "fibra_g": numero, "sodio_mg": numero }
}`

  const usuario = `Crea una receta de tipo "${tipoComida}".
Ingredientes disponibles: ${listaIngredientes}.
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
