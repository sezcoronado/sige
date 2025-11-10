// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (invalidar token)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Renovar token de acceso
 * @access  Private
 */
router.post('/refresh', authenticateToken, authController.refreshToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
