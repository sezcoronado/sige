// src/routes/transacciones.routes.js
const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transacciones.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/v1/transacciones/productos
 * @desc    Listar productos disponibles en tienda
 * @access  Private (todos los roles)
 */
router.get(
  '/productos',
  authenticateToken,
  transaccionesController.getProductos
);

/**
 * @route   GET /api/v1/transacciones/restricciones
 * @desc    Obtener restricciones de compra de un alumno
 * @access  Private (padre, alumno)
 */
router.get(
  '/restricciones',
  authenticateToken,
  authorize('padres', 'alumno'),
  transaccionesController.getRestricciones
);

/**
 * @route   PUT /api/v1/transacciones/restricciones
 * @desc    Actualizar las restricciones de un alumno
 * @access  Private (padre)
 */
router.put(
  '/restricciones',
  authenticateToken,
  authorize('padres'),
  transaccionesController.actualizarRestricciones
);

/**
 * @route   POST /api/v1/transacciones
 * @desc    Crear transacción de compra (valida restricciones y saldo)
 * @access  Private (alumno, administrador - POS)
 */
router.post(
  '/',
  authenticateToken,
  authorize('alumno', 'administrador'),
  transaccionesController.crearTransaccion
);

/**
 * @route   GET /api/v1/transacciones
 * @desc    Listar transacciones de un alumno
 * @access  Private (padre, alumno)
 */
router.get(
  '/',
  authenticateToken,
  authorize('padres', 'alumno'),
  transaccionesController.getTransacciones
);

module.exports = router;
