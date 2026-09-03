/**
 * Utilidades para normalización y enlace a WhatsApp de números telefónicos
 * Garantiza que los números de México siempre lleven el código de país (+52)
 * para evitar el error "El número de teléfono no existe en WhatsApp".
 */

/**
 * Formatea y normaliza un número telefónico asegurando el prefijo internacional +52 si no lo tiene.
 * Ejemplo:
 * - "9991234567" -> "+52 999 123 4567"
 * - "999 123 4567" -> "+52 999 123 4567"
 * - "529991234567" -> "+52 999 123 4567"
 * - "+529991234567" -> "+52 999 123 4567"
 * - "+1 555 123 4567" -> "+1 555 123 4567" (respeta otros países)
 */
export function normalizeMexicanPhone(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) return '';

  // 10 dígitos (estándar nacional de México sin código de país)
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // 12 dígitos comenzando con 52 (código de México ya incluido)
  if (digits.length === 12 && digits.startsWith('52')) {
    const local = digits.slice(2);
    return `+52 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  // 13 dígitos comenzando con 521 (antiguo formato móvil de WhatsApp México)
  if (digits.length === 13 && digits.startsWith('521')) {
    const local = digits.slice(3);
    return `+52 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  // Si ya tiene el signo '+' y es de otro país o formato
  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  // Si no tiene '+' pero tiene dígitos internacionales, añadir '+'
  return `+${trimmed}`;
}

/**
 * Obtiene el número limpio en formato exclusivo de dígitos para la API https://wa.me/<número>.
 * Si el número tiene 10 dígitos, le antepone automáticamente el código "52" de México.
 */
export function getWhatsAppCleanNumber(phone?: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Si son exactamente 10 dígitos locales de México, agregar prefijo 52
  if (digits.length === 10) {
    digits = `52${digits}`;
  } else if (digits.length === 13 && digits.startsWith('521')) {
    // Si contiene el prefijo 521 de WhatsApp antiguo, normalizar a 52 + 10 dígitos
    digits = `52${digits.slice(3)}`;
  }

  return digits;
}

/**
 * Valida si el número contiene al menos 10 dígitos necesarios para WhatsApp
 */
export function hasValidPhoneLength(phone?: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}
