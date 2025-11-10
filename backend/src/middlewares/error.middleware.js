// src/middlewares/error.middleware.js

/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      code: code,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Respuesta al cliente
  res.status(statusCode).json({
    codigo: code,
    mensaje: err.message || 'Ha ocurrido un error en el servidor',
    detalles: err.detalles || [],
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
