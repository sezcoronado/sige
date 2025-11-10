// src/utils/jwt.util.js
const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 1800 // 30 minutos por defecto
  });
};

/**
 * Genera un refresh token
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 604800 // 7 días por defecto
  });
};

/**
 * Verifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
};
