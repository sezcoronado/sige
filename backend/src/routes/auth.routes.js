// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { login, logout, refreshToken, getCurrentUser, getUsersByRol } = require('../controllers/auth.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (invalidar token)
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Renovar token de acceso
 * @access  Private
 */
router.post('/refresh', authenticateToken, refreshToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

// Nueva ruta para obtener usuarios por rol (protegida para docentes)
router.get('/users', authenticateToken, authorize('docente'), getUsersByRol);
//
module.exports = router;
