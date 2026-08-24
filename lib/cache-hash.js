// lib/cache-hash.js
// Genera la "huella digital" (hash) de una receta para el sistema de caché.
// Misma combinación de ingredientes + tipo + perfil = misma receta reutilizable.

import crypto from 'crypto';

/**
 * Agrupa al usuario en 3 perfiles de porción según su oficio y ejercicio.
 * Sirve para que el caché no se parta en 24 pedazos (6 oficios x 4 niveles),
 * sino solo en 3.
 *
 * @param {string} oficio - estudiante, trabajo8h, atleta, profesional, cocinero, libre
 * @param {string} nivelEjercicio - nada, ocasional, frecuente, gymrat
 * @returns {'ligero'|'normal'|'alto'}
 */
export function calcularPerfilPorcion(oficio, nivelEjercicio) {
  const ofi = (oficio || '').trim().toLowerCase();
  const ejer = (nivelEjercicio || '').trim().toLowerCase();

  // Alto: entrena fuerte o su oficio es físico.
  if (ejer === 'gymrat' || ejer === 'frecuente' || ofi === 'atleta') {
    return 'alto';
  }

  // Ligero: se mueve poco y su oficio es sedentario.
  if (ejer === 'nada' && (ofi === 'estudiante' || ofi === 'trabajo8h' || ofi === 'profesional')) {
    return 'ligero';
  }

  // Todo lo demás cae en el medio.
  return 'normal';
}

/**
 * Crea un hash único a partir de los ingredientes, el tipo de comida y el perfil.
 * - Solo usa NOMBRES de ingredientes (ignora cantidades).
 * - Los normaliza: minúsculas, sin espacios sobrantes, orden alfabético.
 * - Incluye el tipo de comida (huevo para desayuno ≠ huevo para cena).
 * - Incluye el perfil de porción (un gymrat no recibe la receta de un sedentario).
 *
 * NOTA: las alergias NO van en el hash a propósito. Se filtran después,
 * al leer del caché, con contieneAlergeno(). Meterlas aquí partiría
 * el caché sin ganar seguridad.
 *
 * @param {string[]} nombresIngredientes - Ej: ["Huevo", "Tortilla", "Aguacate"]
 * @param {string} tipoComida - Ej: "desayuno", "postre", "cena"
 * @param {string} perfilPorcion - 'ligero' | 'normal' | 'alto'
 * @returns {string} Hash en formato hexadecimal
 */
export function generarHashCache(nombresIngredientes, tipoComida, perfilPorcion) {
  // 1. Limpiar cada nombre: minúsculas + quitar espacios al inicio/final
  const limpios = (nombresIngredientes || [])
    .filter((n) => typeof n === 'string' && n.trim() !== '')
    .map((n) => n.trim().toLowerCase());

  // 2. Quitar duplicados y ordenar alfabéticamente
  const unicosOrdenados = [...new Set(limpios)].sort();

  // 3. Armar la cadena base: tipo | perfil | ingredientes
  const tipo = (tipoComida || 'general').trim().toLowerCase();
  const perfil = (perfilPorcion || 'normal').trim().toLowerCase();
  const cadenaBase = `${tipo}|${perfil}|${unicosOrdenados.join(',')}`;

  // 4. Convertir esa cadena en un hash SHA-256
  return crypto.createHash('sha256').update(cadenaBase).digest('hex');
}
