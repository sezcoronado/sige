// src/utils/errors.util.js

/**
 * Clase de error personalizada para la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', detalles = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.detalles = detalles;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory functions para errores comunes
 */
const ErrorFactory = {
  badRequest: (message, detalles = []) => {
    return new AppError(message, 400, 'BAD_REQUEST', detalles);
  },

  unauthorized: (message = 'No autorizado') => {
    return new AppError(message, 401, 'UNAUTHORIZED');
  },

  forbidden: (message = 'Acceso prohibido') => {
    return new AppError(message, 403, 'FORBIDDEN');
  },

  notFound: (resource = 'Recurso') => {
    return new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND');
  },

  conflict: (message) => {
    return new AppError(message, 409, 'CONFLICT');
  },

  paymentRequired: (message = 'Saldo insuficiente') => {
    return new AppError(message, 402, 'PAYMENT_REQUIRED');
  },

  validationError: (detalles = []) => {
    return new AppError('Error de validación', 400, 'VALIDATION_ERROR', detalles);
  }
};

module.exports = {
  AppError,
  ErrorFactory
};
