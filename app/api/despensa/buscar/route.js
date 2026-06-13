import { NextResponse } from 'next/server'

// Lista base de ingredientes comunes (mexicanos + fit + modernos)
// Cada uno con su emoji para que el frontend lo muestre bonito
const INGREDIENTES = [
  // Frutas
  { nombre: 'Plátano', emoji: '🍌', categoria: 'fruta' },
  { nombre: 'Manzana', emoji: '🍎', categoria: 'fruta' },
  { nombre: 'Fresa', emoji: '🍓', categoria: 'fruta' },
  { nombre: 'Mango', emoji: '🥭', categoria: 'fruta' },
  { nombre: 'Aguacate', emoji: '🥑', categoria: 'fruta' },
  { nombre: 'Piña', emoji: '🍍', categoria: 'fruta' },
  { nombre: 'Papaya', emoji: '🫐', categoria: 'fruta' },
  { nombre: 'Sandía', emoji: '🍉', categoria: 'fruta' },
  { nombre: 'Uva', emoji: '🍇', categoria: 'fruta' },
  { nombre: 'Naranja', emoji: '🍊', categoria: 'fruta' },
  { nombre: 'Limón', emoji: '🍋', categoria: 'fruta' },
  { nombre: 'Arándanos', emoji: '🫐', categoria: 'fruta' },
  { nombre: 'Fruta del dragón', emoji: '🐉', categoria: 'fruta' },
  // Verduras
  { nombre: 'Brócoli', emoji: '🥦', categoria: 'verdura' },
  { nombre: 'Zanahoria', emoji: '🥕', categoria: 'verdura' },
  { nombre: 'Espinaca', emoji: '🥬', categoria: 'verdura' },
  { nombre: 'Jitomate', emoji: '🍅', categoria: 'verdura' },
  { nombre: 'Cebolla', emoji: '🧅', categoria: 'verdura' },
  { nombre: 'Ajo', emoji: '🧄', categoria: 'verdura' },
  { nombre: 'Pepino', emoji: '🥒', categoria: 'verdura' },
  { nombre: 'Pimiento', emoji: '🫑', categoria: 'verdura' },
  { nombre: 'Champiñones', emoji: '🍄', categoria: 'verdura' },
  { nombre: 'Elote', emoji: '🌽', categoria: 'verdura' },
  { nombre: 'Nopal', emoji: '🌵', categoria: 'verdura' },
  { nombre: 'Chile', emoji: '🌶️', categoria: 'verdura' },
  { nombre: 'Papa', emoji: '🥔', categoria: 'verdura' },
  // Proteínas
  { nombre: 'Huevo', emoji: '🥚', categoria: 'proteina' },
  { nombre: 'Pollo', emoji: '🍗', categoria: 'proteina' },
  { nombre: 'Carne de res', emoji: '🥩', categoria: 'proteina' },
  { nombre: 'Pescado', emoji: '🐟', categoria: 'proteina' },
  { nombre: 'Camarón', emoji: '🦐', categoria: 'proteina' },
  { nombre: 'Atún', emoji: '🐟', categoria: 'proteina' },
  { nombre: 'Proteína whey', emoji: '💪', categoria: 'proteina' },
  { nombre: 'Frijol', emoji: '🫘', categoria: 'proteina' },
  { nombre: 'Lenteja', emoji: '🫘', categoria: 'proteina' },
  { nombre: 'Tofu', emoji: '⬜', categoria: 'proteina' },
  // Lácteos
  { nombre: 'Leche', emoji: '🥛', categoria: 'lacteo' },
  { nombre: 'Yogur griego', emoji: '🥛', categoria: 'lacteo' },
  { nombre: 'Queso', emoji: '🧀', categoria: 'lacteo' },
  { nombre: 'Queso cottage', emoji: '🧀', categoria: 'lacteo' },
  { nombre: 'Mantequilla', emoji: '🧈', categoria: 'lacteo' },
  // Cereales / Carbos
  { nombre: 'Avena', emoji: '🥣', categoria: 'cereal' },
  { nombre: 'Arroz', emoji: '🍚', categoria: 'cereal' },
  { nombre: 'Pan integral', emoji: '🍞', categoria: 'cereal' },
  { nombre: 'Tortilla de maíz', emoji: '🫓', categoria: 'cereal' },
  { nombre: 'Pasta', emoji: '🍝', categoria: 'cereal' },
  { nombre: 'Quinoa', emoji: '🌾', categoria: 'cereal' },
  { nombre: 'Amaranto', emoji: '🌾', categoria: 'cereal' },
  { nombre: 'Granola', emoji: '🥣', categoria: 'cereal' },
  // Semillas / Grasas buenas
  { nombre: 'Chía', emoji: '⚫', categoria: 'semilla' },
  { nombre: 'Almendras', emoji: '🌰', categoria: 'semilla' },
  { nombre: 'Nuez', emoji: '🌰', categoria: 'semilla' },
  { nombre: 'Cacahuate', emoji: '🥜', categoria: 'semilla' },
  { nombre: 'Crema de cacahuate', emoji: '🥜', categoria: 'semilla' },
  { nombre: 'Linaza', emoji: '⚫', categoria: 'semilla' },
  // Otros / Modernos
  { nombre: 'Miel', emoji: '🍯', categoria: 'otro' },
  { nombre: 'Cacao', emoji: '🍫', categoria: 'otro' },
  { nombre: 'Chocolate negro', emoji: '🍫', categoria: 'otro' },
  { nombre: 'Matcha', emoji: '🍵', categoria: 'otro' },
  { nombre: 'Café', emoji: '☕', categoria: 'otro' },
  { nombre: 'Aceite de oliva', emoji: '🫒', categoria: 'otro' },
  { nombre: 'Coco', emoji: '🥥', categoria: 'otro' }
]

// Quita acentos y pasa a minúsculas para comparar bien
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// ─── GET: buscar ingredientes que coincidan con ?q= ───
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    // Si no escribió nada (o muy poco), devolvemos lista vacía
    if (q.trim().length < 1) {
      return NextResponse.json({ ok: true, sugerencias: [] })
    }

    const busqueda = normalizar(q)

    // Filtrar los que empiecen o contengan lo buscado
    const resultados = INGREDIENTES.filter((ing) =>
      normalizar(ing.nombre).includes(busqueda)
    ).slice(0, 8) // máximo 8 sugerencias

    return NextResponse.json({ ok: true, sugerencias: resultados })

  } catch (err) {
    return NextResponse.json({ ok: false, error: 'servidor', mensaje: 'Algo salió mal' }, { status: 500 })
  }
}
