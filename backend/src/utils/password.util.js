// src/utils/password.util.js

/**
 * Política de seguridad de contraseñas del SIGE.
 * Ajustar estos valores cambia los requisitos en todo el sistema.
 */
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 64,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

const SPECIAL_CHARS_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`';]/;

/**
 * Valida la fortaleza de una contraseña contra la política de seguridad.
 * @param {string} password - Contraseña en texto plano a validar.
 * @returns {Array<{campo: string, error: string}>} Lista de incumplimientos.
 *          Un arreglo vacío significa que la contraseña es válida.
 */
const validatePasswordStrength = (password) => {
  const detalles = [];

  if (typeof password !== 'string' || password.length === 0) {
    detalles.push({ campo: 'contrasenaNueva', error: 'La contraseña es requerida' });
    return detalles;
  }

  if (password.length < PASSWORD_POLICY.minLength) {
    detalles.push({
      campo: 'contrasenaNueva',
      error: `Debe tener al menos ${PASSWORD_POLICY.minLength} caracteres`
    });
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    detalles.push({
      campo: 'contrasenaNueva',
      error: `No debe exceder ${PASSWORD_POLICY.maxLength} caracteres`
    });
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    detalles.push({ campo: 'contrasenaNueva', error: 'Debe incluir al menos una letra mayúscula' });
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    detalles.push({ campo: 'contrasenaNueva', error: 'Debe incluir al menos una letra minúscula' });
  }

  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) {
    detalles.push({ campo: 'contrasenaNueva', error: 'Debe incluir al menos un número' });
  }

  if (PASSWORD_POLICY.requireSpecial && !SPECIAL_CHARS_REGEX.test(password)) {
    detalles.push({ campo: 'contrasenaNueva', error: 'Debe incluir al menos un carácter especial' });
  }

  return detalles;
};

module.exports = {
  PASSWORD_POLICY,
  validatePasswordStrength
};
