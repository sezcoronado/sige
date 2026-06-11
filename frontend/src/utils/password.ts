// src/utils/password.ts
// Política de seguridad de contraseñas (espejo de backend/src/utils/password.util.js).
// Mantener sincronizada con el backend para dar feedback inmediato al usuario.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

const SPECIAL_CHARS_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`';]/;

export interface PasswordRequirement {
  label: string;
  valid: boolean;
}

/**
 * Evalúa una contraseña contra la política y devuelve cada requisito con su
 * estado, para mostrar una lista de verificación en vivo.
 */
export function evaluatePassword(password: string): PasswordRequirement[] {
  return [
    {
      label: `Entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`,
      valid: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    },
    { label: 'Al menos una letra mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Al menos una letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Al menos un número', valid: /[0-9]/.test(password) },
    { label: 'Al menos un carácter especial', valid: SPECIAL_CHARS_REGEX.test(password) },
  ];
}

/** Devuelve true si la contraseña cumple todos los requisitos de la política. */
export function isPasswordValid(password: string): boolean {
  return evaluatePassword(password).every((req) => req.valid);
}
