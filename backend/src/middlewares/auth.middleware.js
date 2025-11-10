// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors.util');

/**
 * Middleware para verificar JWT y autenticar usuarios
 */
const authenticateToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      throw new AppError('Token de autenticación no proporcionado', 401, 'UNAUTHORIZED');
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
        }
        throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
      }

      // Agregar información del usuario al request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        nombre: decoded.nombre // <-- ESTA LÍNEA FALTABA
      };

      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {Array<string>} rolesPermitidos - Array de roles permitidos
 */
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED');
      }

      if (!rolesPermitidos.includes(req.user.rol)) {
        throw new AppError(
          'No tiene permisos para realizar esta acción',
          403,
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticateToken,
  authorize
};
