// src/routes/finanzas.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const finanzasController = require('../controllers/finanzas.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Configuración de Multer para subida de comprobantes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/comprobantes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `comprobante-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, JPG, JPEG, PNG'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

/**
 * @route   GET /api/v1/finanzas/cuotas
 * @desc    Obtener cuotas de un alumno
 * @access  Private (padres, alumno, admin)
 */
router.get(
  '/cuotas',
  authenticateToken,
  finanzasController.getCuotas
);

/**
 * @route   GET /api/v1/finanzas/cuotas/:cuotaId
 * @desc    Obtener detalle de una cuota
 * @access  Private (padres, alumno, admin)
 */
router.get(
  '/cuotas/:cuotaId',
  authenticateToken,
  finanzasController.getCuotaById
);

/**
 * @route   POST /api/v1/finanzas/cuotas/:cuotaId/pagar
 * @desc    Registrar pago de una cuota
 * @access  Private (padres, admin)
 */
router.post(
  '/cuotas/:cuotaId/pagar',
  authenticateToken,
  finanzasController.pagarCuota
);

/**
 * @route   POST /api/v1/finanzas/pagos/:pagoId/comprobante
 * @desc    Subir comprobante de pago
 * @access  Private (padres, admin)
 */
router.post(
  '/pagos/:pagoId/comprobante',
  authenticateToken,
  upload.single('archivo'),
  finanzasController.subirComprobante
);

/**
 * @route   GET /api/v1/finanzas/historial-pagos
 * @desc    Obtener historial de pagos
 * @access  Private (padres, alumno, admin)
 */
router.get(
  '/historial-pagos',
  authenticateToken,
  finanzasController.getHistorialPagos
);

module.exports = router;
