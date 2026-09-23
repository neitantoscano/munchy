// lib/cache-hash.js
// Genera la "huella digital" (hash) de una receta para el sistema de cache.
// Misma combinacion de ingredientes + tipo + perfil + porciones + cocina
// = misma receta reutilizable.

import crypto from 'crypto';

// Porciones permitidas. Si llega otra cosa, se usa 2.
export const PORCIONES_VALIDAS = [1, 2, 4];
export const PORCIONES_DEFAULT = 2;

// Niveles de equipamiento de cocina. Si llega otra cosa, se usa 'completo'.
export const COCINA_VALIDA = ['basico', 'completo', 'equipado'];
export const COCINA_DEFAULT = 'completo';

/**
 * Limpia el numero de porciones que llega del frontend.
 * Si es invalido o no llega, devuelve 2.
 */
export function normalizarPorciones(valor) {
  const num = Number(valor);
  return PORCIONES_VALIDAS.includes(num) ? num : PORCIONES_DEFAULT;
}

/**
 * Limpia el nivel de cocina.
 * Si es invalido o no llega (usuario viejo que nunca lo eligio),
 * devuelve 'completo': el intermedio, para no romper nada.
 */
export function normalizarCocina(valor) {
  const txt = String(valor || '').trim().toLowerCase();
  return COCINA_VALIDA.includes(txt) ? txt : COCINA_DEFAULT;
}

/**
 * Agrupa al usuario en 3 perfiles de porcion segun su oficio y ejercicio.
 * Sirve para que el cache no se parta en 24 pedazos (6 oficios x 4 niveles),
 * sino solo en 3.
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
 * Crea un hash unico a partir de ingredientes, tipo, perfil, porciones y cocina.
 * - Solo usa NOMBRES de ingredientes (ignora cantidades).
 * - Los normaliza: minusculas, sin espacios sobrantes, orden alfabetico.
 * - Incluye el tipo de comida (huevo para desayuno no es huevo para cena).
 * - Incluye el perfil de porcion (un gymrat no recibe la receta de un sedentario).
 * - Incluye las porciones (una receta para 1 no sirve para 4).
 * - Incluye el nivel de cocina (sin horno no sirve una receta al horno).
 *
 * NOTA: las alergias NO van en el hash a proposito. Se filtran despues,
 * al leer del cache, con contieneAlergeno(). Meterlas aqui partiria
 * el cache sin ganar seguridad.
 *
 * @param {string[]} nombresIngredientes - Ej: ["Huevo", "Tortilla", "Aguacate"]
 * @param {string} tipoComida - Ej: "desayuno", "postre", "cena"
 * @param {string} perfilPorcion - 'ligero' | 'normal' | 'alto'
 * @param {number} porciones - 1, 2 o 4
 * @param {string} nivelCocina - 'basico' | 'completo' | 'equipado'
 * @returns {string} Hash en formato hexadecimal
 */
export function generarHashCache(nombresIngredientes, tipoComida, perfilPorcion, porciones, nivelCocina) {
  // 1. Limpiar cada nombre: minusculas + quitar espacios al inicio/final
  const limpios = (nombresIngredientes || [])
    .filter((n) => typeof n === 'string' && n.trim() !== '')
    .map((n) => n.trim().toLowerCase());

  // 2. Quitar duplicados y ordenar alfabeticamente
  const unicosOrdenados = [...new Set(limpios)].sort();

  // 3. Armar la cadena base
  const tipo = (tipoComida || 'general').trim().toLowerCase();
  const perfil = (perfilPorcion || 'normal').trim().toLowerCase();
  const porc = normalizarPorciones(porciones);
  const cocina = normalizarCocina(nivelCocina);
  const cadenaBase = `${tipo}|${perfil}|p${porc}|c${cocina}|${unicosOrdenados.join(',')}`;

  // 4. Convertir esa cadena en un hash SHA-256
  return crypto.createHash('sha256').update(cadenaBase).digest('hex');
}
