// src/routes/cartera.routes.js
const express = require('express');
const router = express.Router();
const carteraController = require('../controllers/cartera.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/v1/cartera
 * @desc    Consultar saldo de cartera digital
 * @access  Private (padre, alumno)
 */
router.get(
  '/',
  authenticateToken,
  authorize('padres', 'alumno'),
  carteraController.getSaldo
);

/**
 * @route   POST /api/v1/cartera/depositar
 * @desc    Depositar saldo a cartera digital
 * @access  Private (padre)
 */
router.post(
  '/depositar',
  authenticateToken,
  authorize('padres'),
  carteraController.depositar
);

/**
 * @route   GET /api/v1/cartera/historial
 * @desc    Obtener historial de movimientos de cartera
 * @access  Private (padre, alumno)
 */
router.get(
  '/historial',
  authenticateToken,
  authorize('padres', 'alumno'),
  carteraController.getHistorial
);

module.exports = router;
