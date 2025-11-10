// src/routes/tareas.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const tareasController = require('../controllers/tareas.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/tareas/');
  },
  filename: function (req, file, cb) {
    // req.user es añadido por el middleware authenticateToken
    const usuario = req.user;
    if (!usuario || !usuario.nombre) {
      // Si no hay usuario o nombre, usar el nombre por defecto para evitar errores
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return cb(null, 'tarea-' + uniqueSuffix + path.extname(file.originalname));
    }
    const nombreAlumno = usuario.nombre.replace(/\s+/g, '_'); // Reemplazar espacios con guiones bajos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${nombreAlumno}_tarea-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, JPG, PNG'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

/**
 * @route   GET /api/v1/tareas
 * @desc    Listar tareas
 * @access  Private (todos los roles)
 */
router.get(
  '/',
  authenticateToken,
  tareasController.getTareas
);

/**
 * @route   GET /api/v1/tareas/:tareaId
 * @desc    Obtener detalle de una tarea
 * @access  Private (todos los roles)
 */
router.get(
  '/:tareaId',
  authenticateToken,
  tareasController.getTareaById
);

/**
 * @route   POST /api/v1/tareas/:tareaId/entregar
 * @desc    Entregar tarea (con archivo)
 * @access  Private (alumno)
 */
router.post(
  '/:tareaId/entregar',
  authenticateToken,
  authorize('alumno'),
  upload.single('archivo'),
  tareasController.entregarTarea
);

/**
 * @route   POST /api/v1/tareas/:tareaId/calificar
 * @desc    Calificar tarea entregada
 * @access  Private (docente)
 */
router.post(
  '/:tareaId/calificar',
  authenticateToken,
  authorize('docente'),
  tareasController.calificarTarea
);

module.exports = router;
