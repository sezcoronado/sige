// src/routes/mensajes.routes.js
const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajes.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/v1/mensajes
 * @desc    Listar mensajes del usuario (recibidos o enviados)
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  mensajesController.getMensajes
);

/**
 * @route   POST /api/v1/mensajes
 * @desc    Enviar mensaje a uno o varios destinatarios
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  mensajesController.enviarMensaje
);

/**
 * @route   GET /api/v1/mensajes/:mensajeId
 * @desc    Obtener detalle de un mensaje específico
 * @access  Private
 */
router.get(
  '/:mensajeId',
  authenticateToken,
  mensajesController.getMensajeById
);

/**
 * @route   PATCH /api/v1/mensajes/:mensajeId
 * @desc    Marcar mensaje como leído/no leído
 * @access  Private
 */
router.patch(
  '/:mensajeId',
  authenticateToken,
  mensajesController.marcarLeido
);

module.exports = router;
