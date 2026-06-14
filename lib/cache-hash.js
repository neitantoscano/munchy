// lib/cache-hash.js
// Genera la "huella digital" (hash) de una receta para el sistema de caché.
// Misma combinación de ingredientes + tipo de comida = mismo hash = receta reutilizable.

import crypto from 'crypto';

/**
 * Crea un hash único a partir de los ingredientes y el tipo de comida.
 * - Solo usa NOMBRES de ingredientes (ignora cantidades).
 * - Los normaliza: minúsculas, sin espacios sobrantes, orden alfabético.
 * - Incluye el tipo de comida para más precisión (huevo para desayuno ≠ huevo para cena).
 *
 * @param {string[]} nombresIngredientes - Ej: ["Huevo", "Tortilla", "Aguacate"]
 * @param {string} tipoComida - Ej: "desayuno", "postre", "cena"
 * @returns {string} Hash en formato hexadecimal
 */
export function generarHashCache(nombresIngredientes, tipoComida) {
  // 1. Limpiar cada nombre: minúsculas + quitar espacios al inicio/final
  const limpios = (nombresIngredientes || [])
    .filter((n) => typeof n === 'string' && n.trim() !== '')
    .map((n) => n.trim().toLowerCase());

  // 2. Quitar duplicados y ordenar alfabéticamente
  const unicosOrdenados = [...new Set(limpios)].sort();

  // 3. Armar la cadena base: tipo_comida + ingredientes
  const tipo = (tipoComida || 'general').trim().toLowerCase();
  const cadenaBase = `${tipo}|${unicosOrdenados.join(',')}`;

  // 4. Convertir esa cadena en un hash SHA-256
  return crypto.createHash('sha256').update(cadenaBase).digest('hex');
}
