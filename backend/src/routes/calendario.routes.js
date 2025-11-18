// src/routes/calendario.routes.js
const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendario.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/v1/calendario/eventos
 * @desc    Listar eventos del calendario
 * @access  Private (todos los roles)
 */
router.get(
  '/eventos',
  authenticateToken,
  calendarioController.getEventos
);

/**
 * @route   GET /api/v1/calendario/eventos/:eventoId
 * @desc    Obtener detalle de un evento
 * @access  Private (todos los roles)
 */
router.get(
  '/eventos/:eventoId',
  authenticateToken,
  calendarioController.getEventoById
);

/**
 * @route   POST /api/v1/calendario/eventos
 * @desc    Crear nuevo evento
 * @access  Private (admin, docente)
 */
router.post(
  '/eventos',
  authenticateToken,
  authorize('admin', 'docente'),
  calendarioController.crearEvento
);

/**
 * @route   PUT /api/v1/calendario/eventos/:eventoId
 * @desc    Actualizar evento
 * @access  Private (creador del evento, admin)
 */
router.put(
  '/eventos/:eventoId',
  authenticateToken,
  calendarioController.actualizarEvento
);

/**
 * @route   DELETE /api/v1/calendario/eventos/:eventoId
 * @desc    Eliminar evento
 * @access  Private (creador del evento, admin)
 */
router.delete(
  '/eventos/:eventoId',
  authenticateToken,
  calendarioController.eliminarEvento
);

module.exports = router;
