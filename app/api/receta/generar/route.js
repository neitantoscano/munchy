// app/api/receta/generar/route.js
// Endpoint principal de B7: genera (o reutiliza) una receta saludable.
// Flujo: sesión → perfil → ingredientes → caché → (IA si no hay) → guardar → devolver.

import { createServerSupabase } from '@/lib/supabase-server'
import { generarHashCache, calcularPerfilPorcion } from '@/lib/cache-hash'
import { incrementarContadorReceta } from '@/lib/rachas'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

// ─── Configuración ───
const LIMITE_FREE = 2   // recetas con IA por día (plan free)
const LIMITE_PRO = 20   // recetas con IA por día (plan Pro)
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

// Tipos que NO son plato completo (no llevan proteína + carbo + verdura)
const TIPOS_SUELTOS = ['postre', 'snack']

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

    // Límite que aplica según el plan
    const limiteDelUsuario = usuario.es_premium ? LIMITE_PRO : LIMITE_FREE

    // Perfil de porción: agrupa oficio + ejercicio en ligero / normal / alto.
    // Solo 3 grupos para que el caché siga sirviendo.
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

    // 6. Generar el hash y buscar en caché
    const hash = generarHashCache(ingredientesDisponibles, tipoComida, perfilPorcion)

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
      // Límite diario (solo aplica a generación con IA)
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
        perfilPorcion
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

      // Guardar en caché (compartida para todos).
      // upsert: si ya existía ese hash (porque se descartó por alergia),
      // se sobrescribe en vez de fallar.
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

// ════════════════════════════════════════════
// Llamada a la IA (Claude Haiku) que crea la receta.
// Devuelve el objeto receta ya parseado, o null si falla.
// ════════════════════════════════════════════
async function generarConIA({ tipoComida, textoLibre, estilo, ingredientes, alergias, perfilPorcion }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const listaIngredientes = ingredientes.join(', ')
  const listaAlergias = alergias && alergias.length > 0 ? alergias.join(', ') : 'ninguna'
  const pedidoLibre = tipoComida === 'otro' && textoLibre
    ? `El usuario pidió específicamente: "${textoLibre}".`
    : ''

  // Instrucción de porción según el perfil del usuario
  const guiaPorcion = {
    ligero: 'Persona sedentaria. Porciones moderadas, menos carbohidrato, más verdura. Alrededor de 350-450 kcal por porción.',
    normal: 'Persona con actividad media. Porciones equilibradas. Alrededor de 450-600 kcal por porción.',
    alto: 'Persona muy activa o que entrena fuerte. Porciones generosas, más proteína y más carbohidrato. Alrededor de 600-800 kcal por porción.'
  }[perfilPorcion] || 'Porciones equilibradas. Alrededor de 450-600 kcal por porción.'

  // Los snacks y postres no son plato completo
  const esPlatoCompleto = !TIPOS_SUELTOS.includes(tipoComida)

  const reglaPlato = esPlatoCompleto
    ? `═══ SIEMPRE PLATO COMPLETO ═══
Esta receta debe ser un PLATO ARMADO, no un solo elemento suelto.
Todo plato principal lleva estos 3 componentes:
1. PROTEÍNA (pollo, pescado, huevo, carne, atún, frijoles, requesón)
2. CARBOHIDRATO (papa, arroz, tortilla, pasta, camote, avena, pan integral)
3. VEGETAL (ensalada, verdura salteada, asada o al horno)
Más un toque final: limón, salsa, aderezo o hierbas frescas.

Piensa en un plato de restaurante: filete dorado + papas cambray al ajillo + ensalada con aderezo + rodaja de limón.
Los 3 componentes van en la MISMA lista de ingredientes y en los MISMOS pasos.
Si un componente se cocina mientras otro reposa, dilo en el paso (ej. "mientras las papas hierven...").`
    : ''

  const sistema = `Eres el chef de Munchy, una app de recetas saludables para la Gen Z mexicana.
Creas comida que de verdad se antoja, en español de México.

═══ LO MÁS IMPORTANTE: NADA DE COMIDA ABURRIDA ═══
Munchy NO es una app de dieta triste. Si la receta se ve aburrida, fallaste.

PROHIBIDO servir como plato principal:
- Ensaladas planas de lechuga y pepino sin nada más.
- Pechuga hervida con verdura al vapor.
- Cualquier cosa sin sazón, sin salsa, sin gracia.

${reglaPlato}

SÍ hacemos comida rica que además es saludable. Ejemplos del nivel que buscamos:
- Tacos usando hoja de lechuga como tortilla, con carne, salsa, aderezo y limón.
- Ensaladas mezcladas con aderezo cremoso hecho con yogur griego, no secas.
- Pastas y arroces bien sazonados, con salsa y proteína.
- Bowls con capas: base, proteína, algo crujiente, salsa encima.

REGLA DE ORO: toda receta lleva SABOR — aderezo, salsa, marinada o especias.
Para aderezos cremosos usa yogur griego, aguacate o requesón como base.
Si la receta necesita mayonesa o kétchup, usa muy poca cantidad.

SNACKS: que se antojen de verdad. Nada de "un puño de almendras" o "zanahoria cruda".
Piensa: papas al horno con especias, palomitas sazonadas, hummus con algo crujiente, rollitos, brochetas.

POSTRES: que sepan a postre real, no a castigo. Nada de "una fruta y ya".
Piensa: mousse de yogur griego con cacao, nice cream de plátano, avena horneada tipo brownie, fresas con crema de verdad.
Se endulza con dátil, plátano, miel o canela en vez de azúcar refinada.

Saludable Gen Z = papas al horno SÍ, Takis NO.
