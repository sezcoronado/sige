// src/routes/nomina.routes.js
const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nomina.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/v1/nomina/empleados
 * @desc    Obtener lista de empleados
 * @access  Private (docente, admin)
 */
router.get(
  '/empleados',
  authenticateToken,
  authorize(['docente', 'admin']),
  nominaController.getEmpleados
);

/**
 * @route   GET /api/v1/nomina/empleados/:empleadoId
 * @desc    Obtener detalle de un empleado
 * @access  Private (docente, admin)
 */
router.get(
  '/empleados/:empleadoId',
  authenticateToken,
  authorize(['docente', 'admin']),
  nominaController.getEmpleadoById
);

/**
 * @route   GET /api/v1/nomina/empleados/:empleadoId/pagos
 * @desc    Obtener pagos de un empleado específico
 * @access  Private (docente, admin)
 */
router.get(
  '/empleados/:empleadoId/pagos',
  authenticateToken,
  authorize(['docente', 'admin']),
  nominaController.getPagosEmpleado
);

/**
 * @route   GET /api/v1/nomina/pagos
 * @desc    Obtener lista de pagos/nómina
 * @access  Private (docente, admin)
 */
router.get(
  '/pagos',
  authenticateToken,
  authorize(['docente', 'admin']),
  nominaController.getPagos
);

/**
 * @route   POST /api/v1/nomina/pagos
 * @desc    Registrar un pago de nómina
 * @access  Private (admin)
 */
router.post(
  '/pagos',
  authenticateToken,
  authorize(['admin']),
  nominaController.registrarPago
);

/**
 * @route   PUT /api/v1/nomina/pagos/:pagoId
 * @desc    Actualizar estado de un pago
 * @access  Private (admin)
 */
router.put(
  '/pagos/:pagoId',
  authenticateToken,
  authorize(['admin']),
  nominaController.actualizarEstadoPago
);

/**
 * @route   GET /api/v1/nomina/resumen
 * @desc    Obtener resumen de nómina
 * @access  Private (docente, admin)
 */
router.get(
  '/resumen',
  authenticateToken,
  authorize(['docente', 'admin']),
  nominaController.getResumen
);

module.exports = router;
