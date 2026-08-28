// lib/cache-hash.js
// Genera la "huella digital" (hash) de una receta para el sistema de cache.
// Misma combinacion de ingredientes + tipo + perfil + porciones = misma receta reutilizable.

import crypto from 'crypto';

// Porciones permitidas. Si llega otra cosa, se usa 2.
export const PORCIONES_VALIDAS = [1, 2, 4];
export const PORCIONES_DEFAULT = 2;

/**
 * Limpia el numero de porciones que llega del frontend.
 * Si es invalido o no llega, devuelve 2.
 *
 * @param {any} valor
 * @returns {1|2|4}
 */
export function normalizarPorciones(valor) {
  const num = Number(valor);
  return PORCIONES_VALIDAS.includes(num) ? num : PORCIONES_DEFAULT;
}

/**
 * Agrupa al usuario en 3 perfiles de porcion segun su oficio y ejercicio.
 * Sirve para que el cache no se parta en 24 pedazos (6 oficios x 4 niveles),
 * sino solo en 3.
 *
 * @param {string} oficio - estudiante, trabajo8h, atleta, profesional, cocinero, libre
 * @param {string} nivelEjercicio - nada, ocasional, frecuente, gymrat
 * @returns {'ligero'|'normal'|'alto'}
 */
export function calcularPerfilPorcion(oficio, nivelEjercicio) {
  const ofi = (oficio || '').trim().toLowerCase();
  const ejer = (nivelEjercicio || '').trim().toLowerCase();

  // Alto: entrena fuerte o su oficio es fisico.
  if (ejer === 'gymrat' || ejer === 'frecuente' || ofi === 'atleta') {
    return 'alto';
  }

  // Ligero: se mueve poco y su oficio es sedentario.
  if (ejer === 'nada' && (ofi === 'estudiante' || ofi === 'trabajo8h' || ofi === 'profesional')) {
    return 'ligero';
  }

  // Todo lo demas cae en el medio.
  return 'normal';
}

/**
 * Crea un hash unico a partir de los ingredientes, tipo de comida, perfil y porciones.
 * - Solo usa NOMBRES de ingredientes (ignora cantidades).
 * - Los normaliza: minusculas, sin espacios sobrantes, orden alfabetico.
 * - Incluye el tipo de comida (huevo para desayuno no es huevo para cena).
 * - Incluye el perfil de porcion (un gymrat no recibe la receta de un sedentario).
 * - Incluye las porciones (una receta para 1 no sirve para 4).
 *
 * NOTA: las alergias NO van en el hash a proposito. Se filtran despues,
 * al leer del cache, con contieneAlergeno(). Meterlas aqui partiria
 * el cache sin ganar seguridad.
 *
 * @param {string[]} nombresIngredientes - Ej: ["Huevo", "Tortilla", "Aguacate"]
 * @param {string} tipoComida - Ej: "desayuno", "postre", "cena"
 * @param {string} perfilPorcion - 'ligero' | 'normal' | 'alto'
 * @param {number} porciones - 1, 2 o 4
 * @returns {string} Hash en formato hexadecimal
 */
export function generarHashCache(nombresIngredientes, tipoComida, perfilPorcion, porciones) {
  // 1. Limpiar cada nombre: minusculas + quitar espacios al inicio/final
  const limpios = (nombresIngredientes || [])
    .filter((n) => typeof n === 'string' && n.trim() !== '')
    .map((n) => n.trim().toLowerCase());

  // 2. Quitar duplicados y ordenar alfabeticamente
  const unicosOrdenados = [...new Set(limpios)].sort();

  // 3. Armar la cadena base: tipo | perfil | porciones | ingredientes
  const tipo = (tipoComida || 'general').trim().toLowerCase();
  const perfil = (perfilPorcion || 'normal').trim().toLowerCase();
  const porc = normalizarPorciones(porciones);
  const cadenaBase = `${tipo}|${perfil}|p${porc}|${unicosOrdenados.join(',')}`;

  // 4. Convertir esa cadena en un hash SHA-256
  return crypto.createHash('sha256').update(cadenaBase).digest('hex');
}
